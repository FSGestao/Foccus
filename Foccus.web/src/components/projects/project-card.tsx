"use client";

import type { Project } from "@/lib/projects/types";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL } from "@/lib/projects/constants";
import { computeProjectStats } from "@/lib/projects/compute";
import { useTasksStore } from "@/lib/stores/tasks-store";

// Card da grade de Projetos (Foccus.dc.html:604-628) — ponto/nome/lápis,
// badge de status, barra de progresso e contagem de tarefas abertas/atrasadas.
export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tasks = useTasksStore((s) => s.tasks);
  const stats = computeProjectStats(project.id, tasks);
  const badge = PROJECT_STATUS_BADGE[project.status];

  return (
    <div
      className="flex flex-col rounded-lg p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:[border-color:var(--pb-accent)]"
      style={{
        background: "var(--pb-glass-card)",
        border: "1px solid var(--pb-border-hover)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        color: "var(--pb-text)",
      }}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ background: project.color }}
          />
          <span className="truncate text-[15px] font-semibold">{project.name}</span>
          <button
            type="button"
            onClick={onEdit}
            title="Renomear projeto"
            className="shrink-0 text-xs"
            style={{ background: "transparent", color: "var(--pb-text-dim)" }}
          >
            ✎
          </button>
        </div>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold"
          style={{ color: badge.color, background: badge.background, border: badge.border }}
        >
          {PROJECT_STATUS_LABEL[project.status]}
        </span>
      </div>

      <div className="mb-3">
        <div
          className="mb-1 flex items-center justify-between text-xs"
          style={{ color: "var(--pb-text-dim)" }}
        >
          <span>Progresso</span>
          <span>{stats.progressLabel}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full" style={{ background: "var(--pb-surface-subtle)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${stats.progressPct}%`, background: "var(--pb-accent)" }}
          />
        </div>
      </div>

      <div className="mb-2.5 flex items-center justify-between text-xs" style={{ color: "var(--pb-text-muted)" }}>
        <span>{stats.openCount} tarefas abertas</span>
        {stats.hasOverdue && (
          <span style={{ color: "#ef4444", fontWeight: 600 }}>{stats.overdueCount} atrasadas</span>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t pt-2.5 text-xs" style={{ borderColor: "var(--pb-border)" }}>
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
