"use client";

import { buildGantt } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";

const BAR_STYLE: Record<string, React.CSSProperties> = {
  done: { background: "var(--db-green)" },
  progress: {
    background:
      "repeating-linear-gradient(45deg, var(--db-teal), var(--db-teal) 9px, var(--db-teal-soft) 9px, var(--db-teal-soft) 18px)",
  },
  blocked: { background: "#ef4444" },
  todo: { background: "transparent", border: "1.5px dashed var(--db-text-dim)" },
};

export function DashboardGantt({
  scopeTasks,
  projects,
  filterMode,
}: {
  scopeTasks: Task[];
  projects: Project[];
  filterMode: "all" | "inbox" | string;
}) {
  const gantt = buildGantt(scopeTasks, projects, filterMode);

  if (gantt.isEmpty) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--db-text-muted)" }}>
        Sem tarefas com datas para mostrar no Gantt.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
      <div className="relative h-5" style={{ marginLeft: 160 }}>
        {gantt.weeks.map((w, i) => (
          <span
            key={i}
            className="absolute text-[10px]"
            style={{ left: `${w.leftPct}%`, color: "var(--db-text-dim)" }}
          >
            {w.label}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {gantt.barRows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <span
              className="flex w-40 shrink-0 items-center gap-1.5 truncate text-xs"
              style={{ color: "var(--db-text)" }}
              title={row.label}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: row.dotColor }} />
              {row.label}
            </span>
            <div className="relative h-4 flex-1" style={{ background: "var(--db-panel-strong)", borderRadius: 4 }}>
              <div
                title={row.tooltip}
                className="absolute top-1/2 h-4 -translate-y-1/2 rounded"
                style={{ left: `${row.leftPct}%`, width: `${row.widthPct}%`, ...BAR_STYLE[row.status] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
