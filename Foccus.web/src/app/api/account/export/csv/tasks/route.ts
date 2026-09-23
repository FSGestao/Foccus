import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/projects/types";
import type { Person } from "@/lib/people/types";
import type { Task } from "@/lib/tasks/types";
import { toCSV } from "@/lib/csv/csv";

// Export CSV de tarefas — projeto/pessoa já resolvidos pro nome (mais fácil
// de editar numa planilha do que o uuid cru), mesmas colunas que
// /api/account/import/tasks aceita de volta.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [tasksRes, projectsRes, peopleRes] = await Promise.all([
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("projects").select("*"),
    supabase.from("people").select("*"),
  ]);
  if (tasksRes.error) {
    return NextResponse.json({ error: tasksRes.error.message }, { status: 500 });
  }

  const tasks = (tasksRes.data ?? []) as Task[];
  const projects = (projectsRes.data ?? []) as Project[];
  const people = (peopleRes.data ?? []) as Person[];
  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));
  const personNameById = new Map(people.map((p) => [p.id, p.name]));

  const rows: string[][] = [
    [
      "Título",
      "Descrição",
      "Projeto",
      "Prioridade",
      "Status",
      "Prazo",
      "Retorno esperado",
      "Aguardando quem",
      "Motivo",
      "% concluído",
      "Estimativa (minutos)",
      "Tags",
    ],
  ];
  for (const t of tasks) {
    rows.push([
      t.title,
      t.description ?? "",
      t.project_id ? (projectNameById.get(t.project_id) ?? "") : "",
      t.priority,
      t.status,
      t.due_date ?? "",
      t.follow_up_date ?? "",
      t.waiting_for ? (personNameById.get(t.waiting_for) ?? "") : "",
      t.waiting_reason ?? "",
      t.progress_pct != null ? String(t.progress_pct) : "",
      t.estimated_minutes != null ? String(t.estimated_minutes) : "",
      (t.tags ?? []).join(", "),
    ]);
  }

  return new NextResponse(toCSV(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="foccus-tarefas-${user.id}.csv"`,
    },
  });
}
