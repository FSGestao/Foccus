"use client";

import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import { PRIORITY_COLOR } from "@/lib/tasks/constants";

// Chip de tarefa reaproveitado nas 3 visões (Mês compacto, Semana/Agenda mais
// largo) — cor pela prioridade, riscado quando concluída, mesmo critério de
// "atrasada" usado no Kanban/Lista (task-row.tsx, kanban-card.tsx).
export function CalendarTaskChip({
  task,
  project,
  overdue,
  compact,
  showProject = !compact,
  onClick,
}: {
  task: Task;
  project: Project | null;
  overdue: boolean;
  compact: boolean;
  // Independente do tamanho (compact): a Semana usa chip "grande" mas sem
  // projeto (pedido do usuário, 2026-09-09 — "deixe somente os nomes").
  showProject?: boolean;
  onClick: () => void;
}) {
  const isDone = task.status === "DONE";
  const dotColor = isDone ? "var(--pb-text-dim)" : PRIORITY_COLOR[task.priority];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={task.title}
      className={`flex w-full items-center gap-1.5 overflow-hidden rounded text-left ${compact ? "px-1 py-[1px] text-[10.5px]" : "px-2 py-1 text-[12px]"}`}
      style={{
        background: overdue && !isDone ? "rgba(239,68,68,0.1)" : "var(--pb-glass)",
        border: `1px solid ${overdue && !isDone ? "rgba(239,68,68,0.25)" : "var(--pb-border)"}`,
        cursor: "pointer",
      }}
    >
      <span className="inline-block h-[6px] w-[6px] shrink-0 rounded-full" style={{ background: dotColor }} />
      <span
        className="flex-1 truncate"
        style={
          isDone
            ? { textDecoration: "line-through", color: "var(--pb-text-dim)" }
            : { color: overdue ? "var(--pb-red)" : "var(--pb-text)" }
        }
      >
        {task.title}
      </span>
      {showProject && project && (
        <span className="shrink-0 truncate text-[10.5px]" style={{ color: "var(--pb-text-dim)", maxWidth: 90 }}>
          {project.name}
        </span>
      )}
    </button>
  );
}
