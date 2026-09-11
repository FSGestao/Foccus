import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Integração com o sistema externo de gestão de desenvolvimento pessoal (ver
// docs/INTEGRATIONS.md). Autenticação é uma chave única/central
// (INTEGRATION_API_KEY) — mas cada tarefa é atribuída a um usuário real do
// Foccus via `owner_email`, não a uma conta de serviço compartilhada (pedido
// do usuário, 2026-09-11: "precisamos gerenciar as tarefas por usuários").

const PRIORITIES = ["P1", "P2", "P3", "P4"] as const;

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const expectedKey = process.env.INTEGRATION_API_KEY;
  if (!expectedKey) {
    // Integração desligada por padrão até a chave existir no ambiente.
    return NextResponse.json({ ok: false, error: "Integração não configurada." }, { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${expectedKey}`) {
    return unauthorized();
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const ownerEmail = typeof body.owner_email === "string" ? body.owner_email.trim().toLowerCase() : "";
  const priority = typeof body.priority === "string" ? body.priority : "P3";
  const projectId = typeof body.project_id === "string" && body.project_id ? body.project_id : null;
  const dueDate = typeof body.due_date === "string" && body.due_date ? body.due_date : null;
  const description = typeof body.description === "string" && body.description ? body.description : null;
  const externalId = typeof body.external_id === "string" && body.external_id ? body.external_id : null;

  if (!title) {
    return NextResponse.json({ ok: false, error: "'title' é obrigatório." }, { status: 422 });
  }
  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "'owner_email' é obrigatório." }, { status: 422 });
  }
  if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
    return NextResponse.json({ ok: false, error: "'priority' precisa ser P1, P2, P3 ou P4." }, { status: 422 });
  }
  if (dueDate && Number.isNaN(Date.parse(dueDate))) {
    return NextResponse.json({ ok: false, error: "'due_date' inválida (use AAAA-MM-DD)." }, { status: 422 });
  }

  const admin = createAdminClient();

  const { data: owner, error: ownerError } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", ownerEmail)
    .maybeSingle();
  if (ownerError || !owner) {
    return NextResponse.json(
      { ok: false, error: `Usuário '${ownerEmail}' não encontrado no Foccus.` },
      { status: 404 },
    );
  }

  if (projectId) {
    const { data: project } = await admin
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", owner.id)
      .maybeSingle();
    if (!project) {
      return NextResponse.json(
        { ok: false, error: "'project_id' não encontrado para esse usuário." },
        { status: 422 },
      );
    }
  }

  const { data: task, error } = await admin
    .from("tasks")
    .insert({
      user_id: owner.id,
      project_id: projectId,
      title,
      description,
      priority,
      due_date: dueDate,
      external_id: externalId,
      status: "TODO",
    })
    .select("id")
    .single();

  if (error || !task) {
    return NextResponse.json({ ok: false, error: "Falha ao criar tarefa." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: task.id }, { status: 201 });
}
