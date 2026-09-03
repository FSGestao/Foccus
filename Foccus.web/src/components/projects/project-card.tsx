"use client";

import type { Project } from "@/lib/projects/types";
import { PROJECT_STATUS_LABEL } from "@/lib/projects/constants";

export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-4 text-sm"
      style={{ background: "var(--pb-glass-card)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: project.color }} />
        <span className="flex-1 truncate font-semibold">{project.name}</span>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold"
          style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}
        >
          {project.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: "var(--pb-text-muted)" }}>
        <span>{PROJECT_STATUS_LABEL[project.status]}</span>
        <span>{project.due_date ?? "sem prazo"}</span>
      </div>

      <div className="flex justify-end gap-3 text-xs">
        <button type="button" onClick={onEdit} style={{ color: "var(--pb-accent)" }}>
          editar
        </button>
        <button type="button" onClick={onDelete} style={{ color: "var(--pb-red)" }}>
          excluir
        </button>
      </div>
    </div>
  );
}
