import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCSV, rowsToRecords } from "@/lib/csv/csv";
import type { Project } from "@/lib/projects/types";
import type { Person } from "@/lib/people/types";
import type { Priority, TaskStatus } from "@/lib/tasks/types";

const VALID_PRIORITY: Priority[] = ["P1", "P2", "P3", "P4"];
const VALID_STATUS: TaskStatus[] = ["INBOX", "TODO", "IN_PROGRESS", "WAITING", "BLOCKED", "DONE", "CANCELLED"];

// Importa tarefas de um CSV com as colunas do export ao lado
// (/api/account/export/csv/tasks). Só "Título" é obrigatório — cada linha
// vira uma tarefa NOVA. "Projeto" e "Aguardando quem" são casados pelo nome
// (case-insensitive) contra projetos/pessoas já existentes do usuário; se não
// achar, a tarefa é criada sem esse vínculo e entra um aviso na resposta (não
// cria projeto/pessoa novo pra evitar duplicata por erro de digitação).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const text = await request.text();
  if (!text.trim()) {
    return NextResponse.json({ error: "Arquivo CSV vazio." }, { status: 400 });
  }

  const [projectsRes, peopleRes] = await Promise.all([
    supabase.from("projects").select("id, name"),
    supabase.from("people").select("id, name"),
  ]);
  const projects = (projectsRes.data ?? []) as Pick<Project, "id" | "name">[];
  const people = (peopleRes.data ?? []) as Pick<Person, "id" | "name">[];
  const projectIdByName = new Map(projects.map((p) => [p.name.trim().toLowerCase(), p.id]));
  const personIdByName = new Map(people.map((p) => [p.name.trim().toLowerCase(), p.id]));

  const records = rowsToRecords(parseCSV(text));
  const warnings: string[] = [];
  const toInsert: Record<string, unknown>[] = [];

  records.forEach((record, i) => {
    const line = i + 2;
    const title = (record["Título"] ?? "").trim();
    if (!title) {
      warnings.push(`Linha ${line}: sem Título, ignorada.`);
      return;
    }

    const priorityRaw = (record["Prioridade"] ?? "").trim().toUpperCase() as Priority;
    const priority = VALID_PRIORITY.includes(priorityRaw) ? priorityRaw : "P3";
    const statusRaw = (record["Status"] ?? "").trim().toUpperCase() as TaskStatus;
    const status = VALID_STATUS.includes(statusRaw) ? statusRaw : "TODO";

    const projectName = record["Projeto"]?.trim();
    let projectId: string | null = null;
    if (projectName) {
      projectId = projectIdByName.get(projectName.toLowerCase()) ?? null;
      if (!projectId) warnings.push(`Linha ${line}: projeto "${projectName}" não encontrado, tarefa criada sem projeto.`);
    }

    const waitingForName = record["Aguardando quem"]?.trim();
    let waitingForId: string | null = null;
    if (waitingForName) {
      waitingForId = personIdByName.get(waitingForName.toLowerCase()) ?? null;
      if (!waitingForId) warnings.push(`Linha ${line}: pessoa "${waitingForName}" não encontrada em "Aguardando quem".`);
    }

    const progressRaw = record["% concluído"]?.trim();
    const progress = progressRaw ? Math.round(Number(progressRaw)) : null;
    const estimatedRaw = record["Estimativa (minutos)"]?.trim();
    const estimated = estimatedRaw ? Math.round(Number(estimatedRaw)) : null;

    toInsert.push({
      user_id: user.id,
      title,
      description: record["Descrição"]?.trim() || null,
      project_id: projectId,
      priority,
      status,
      due_date: record["Prazo"]?.trim() || null,
      follow_up_date: record["Retorno esperado"]?.trim() || null,
      waiting_for: waitingForId,
      waiting_reason: record["Motivo"]?.trim() || null,
      progress_pct: Number.isFinite(progress) ? progress : null,
      estimated_minutes: Number.isFinite(estimated) ? estimated : null,
      tags: record["Tags"] ? record["Tags"].split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
  });

  if (toInsert.length === 0) {
    return NextResponse.json({ imported: 0, warnings: [...warnings, "Nenhuma linha válida encontrada."] });
  }

  const { error } = await supabase.from("tasks").insert(toInsert);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: toInsert.length, warnings });
}
