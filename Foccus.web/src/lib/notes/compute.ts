// Feed de Anotações (Foccus.dc.html:3360-3405) — junta anotações manuais de
// projeto (project_notes) com as anotações registradas dentro de cada
// tarefa. O legado usava o campo `notes` (texto livre) da tarefa; aqui
// usamos `task.comments` — é exatamente o feed com autor/data mostrado na
// seção "Anotações" do painel de detalhe da tarefa (task-detail-panel.tsx),
// então uma anotação registrada lá aparece aqui automaticamente, e vice-versa
// (mesmo dado, duas telas).

import type { Project } from "@/lib/projects/types";
import type { Task } from "@/lib/tasks/types";
import type { ProjectNote } from "./types";

export type NoteRow = {
  id: string;
  projectId: string;
  title: string;
  text: string;
  registeredLabel: string;
  hasReferenceDate: boolean;
  referenceLabel: string;
  sourceLabel: "Projeto" | "Tarefa";
  isTaskNote: boolean;
  canDelete: boolean;
  taskId: string | null;
  taskTitle: string;
  sortKey: string;
};

export type NoteGroup = {
  projectId: string;
  projectName: string;
  color: string;
  count: number;
  notes: NoteRow[];
};

function fmtDateBR(isoLike: string): string {
  if (!isoLike) return "—";
  const [y, m, d] = isoLike.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function computeNoteGroups(
  projectNotes: ProjectNote[],
  tasks: Task[],
  projects: Project[],
  filterProjectId: string,
): NoteGroup[] {
  const matches = (projectId: string | null) => filterProjectId === "all" || projectId === filterProjectId;

  const projectNoteRows: NoteRow[] = projectNotes
    .filter((n) => matches(n.project_id))
    .map((n) => ({
      id: n.id,
      projectId: n.project_id ?? "",
      title: n.title || "Anotação sem título",
      text: n.text,
      registeredLabel: fmtDateBR(n.recorded_at),
      hasReferenceDate: !!n.reference_date,
      referenceLabel: n.reference_date ? fmtDateBR(n.reference_date) : "",
      sourceLabel: "Projeto",
      isTaskNote: false,
      canDelete: true,
      taskId: null,
      taskTitle: "",
      sortKey: n.recorded_at,
    }));

  const taskNoteRows: NoteRow[] = tasks
    .filter((t) => t.comments.length > 0 && matches(t.project_id))
    .flatMap((t) =>
      t.comments.map((c) => ({
        id: `${t.id}:${c.id}`,
        projectId: t.project_id ?? "",
        title: `Nota da atividade: ${t.title}`,
        text: c.text,
        registeredLabel: fmtDateBR(c.date),
        hasReferenceDate: false,
        referenceLabel: "",
        sourceLabel: "Tarefa" as const,
        isTaskNote: true,
        canDelete: false,
        taskId: t.id,
        taskTitle: t.title,
        sortKey: c.date,
      })),
    );

  const allRows = [...projectNoteRows, ...taskNoteRows];

  const groupOrder: { id: string; name: string; color: string }[] = [
    { id: "", name: "Inbox", color: "rgba(var(--pb-text-rgb),0.3)" },
    ...projects.map((p) => ({ id: p.id, name: p.name, color: p.color })),
  ];

  return groupOrder
    .map((g) => {
      const notes = allRows
        .filter((n) => (n.projectId || "") === g.id)
        .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
      return { projectId: g.id, projectName: g.name, color: g.color, count: notes.length, notes };
    })
    .filter((g) => g.notes.length > 0);
}
