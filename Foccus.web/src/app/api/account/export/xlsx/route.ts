import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/projects/types";
import type { Person } from "@/lib/people/types";
import type { Task } from "@/lib/tasks/types";
import type { ProjectNote } from "@/lib/notes/types";

// Mesma exportação de dados (LGPD, art. 18) da rota .json ao lado, só que em
// .xlsx — uma planilha por tabela, com project_id/waiting_for já resolvidos
// pro nome (mais legível numa planilha do que o uuid cru).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [profileRes, projectsRes, peopleRes, tasksRes, notesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("projects").select("*"),
    supabase.from("people").select("*"),
    supabase.from("tasks").select("*"),
    supabase.from("project_notes").select("*"),
  ]);

  const profile = (profileRes.data ?? {}) as Record<string, unknown>;
  const projects = (projectsRes.data ?? []) as Project[];
  const people = (peopleRes.data ?? []) as Person[];
  const tasks = (tasksRes.data ?? []) as Task[];
  const notes = (notesRes.data ?? []) as ProjectNote[];

  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));
  const personNameById = new Map(people.map((p) => [p.id, p.name]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Foccus";
  workbook.created = new Date();

  const perfil = workbook.addWorksheet("Perfil");
  perfil.columns = [
    { header: "Campo", key: "field", width: 28 },
    { header: "Valor", key: "value", width: 50 },
  ];
  perfil.addRow({ field: "email", value: user.email ?? "" });
  for (const [field, value] of Object.entries(profile)) {
    if (field === "id") continue;
    perfil.addRow({ field, value: typeof value === "object" && value !== null ? JSON.stringify(value) : (value ?? "") });
  }

  const projetos = workbook.addWorksheet("Projetos");
  projetos.columns = [
    { header: "Nome", key: "name", width: 30 },
    { header: "Prioridade", key: "priority", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Prazo", key: "due_date", width: 14 },
    { header: "Criado em", key: "created_at", width: 22 },
  ];
  for (const p of projects) {
    projetos.addRow({
      name: p.name,
      priority: p.priority,
      status: p.status,
      due_date: p.due_date ?? "",
      created_at: p.created_at,
    });
  }

  const pessoas = workbook.addWorksheet("Pessoas");
  pessoas.columns = [
    { header: "Nome", key: "name", width: 28 },
    { header: "Papel", key: "role", width: 22 },
    { header: "Status", key: "status", width: 12 },
    { header: "Cadastrado em", key: "created_at", width: 22 },
  ];
  for (const p of people) {
    pessoas.addRow({ name: p.name, role: p.role ?? "", status: p.status, created_at: p.created_at });
  }

  const tarefas = workbook.addWorksheet("Tarefas");
  tarefas.columns = [
    { header: "Título", key: "title", width: 40 },
    { header: "Descrição", key: "description", width: 40 },
    { header: "Projeto", key: "project", width: 22 },
    { header: "Prioridade", key: "priority", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Prazo", key: "due_date", width: 14 },
    { header: "Retorno esperado", key: "follow_up_date", width: 16 },
    { header: "Aguardando quem", key: "waiting_for", width: 22 },
    { header: "Motivo", key: "waiting_reason", width: 26 },
    { header: "% concluído", key: "progress_pct", width: 12 },
    { header: "Tags", key: "tags", width: 22 },
    { header: "Criada em", key: "created_at", width: 22 },
    { header: "Concluída em", key: "completed_at", width: 22 },
  ];
  for (const t of tasks) {
    tarefas.addRow({
      title: t.title,
      description: t.description ?? "",
      project: t.project_id ? (projectNameById.get(t.project_id) ?? "") : "",
      priority: t.priority,
      status: t.status,
      due_date: t.due_date ?? "",
      follow_up_date: t.follow_up_date ?? "",
      waiting_for: t.waiting_for ? (personNameById.get(t.waiting_for) ?? "") : "",
      waiting_reason: t.waiting_reason ?? "",
      progress_pct: t.progress_pct ?? "",
      tags: (t.tags ?? []).join(", "),
      created_at: t.created_at,
      completed_at: t.completed_at ?? "",
    });
  }

  const anotacoes = workbook.addWorksheet("Anotações");
  anotacoes.columns = [
    { header: "Título", key: "title", width: 30 },
    { header: "Projeto", key: "project", width: 22 },
    { header: "Texto", key: "text", width: 60 },
    { header: "Data de referência", key: "reference_date", width: 16 },
    { header: "Registrado em", key: "recorded_at", width: 22 },
  ];
  for (const n of notes) {
    anotacoes.addRow({
      title: n.title ?? "",
      project: n.project_id ? (projectNameById.get(n.project_id) ?? "") : "",
      text: n.text,
      reference_date: n.reference_date ?? "",
      recorded_at: n.recorded_at,
    });
  }

  for (const sheet of workbook.worksheets) {
    sheet.getRow(1).font = { bold: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="foccus-dados-${user.id}.xlsx"`,
    },
  });
}
