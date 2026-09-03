"use client";

import { buildOverview } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";

export function DashboardOverview({
  allTasks,
  projects,
  scopeTasksForVelocity,
}: {
  allTasks: Task[];
  projects: Project[];
  scopeTasksForVelocity: Task[];
}) {
  const overview = buildOverview(allTasks, projects, scopeTasksForVelocity);

  if (projects.length === 0) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--db-text-muted)" }}>
        Crie projetos pra ver comparativos aqui.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-4 rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
        {overview.radialRings.map((r) => (
          <div key={r.id} className="flex flex-col items-center gap-1.5" title={r.tooltip}>
            <div className="relative h-16 w-16">
              <svg width={64} height={64} viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                <circle cx={28} cy={28} r={24} fill="none" stroke="var(--db-border)" strokeWidth={5} />
                <circle
                  cx={28}
                  cy={28}
                  r={24}
                  fill="none"
                  stroke={r.dotColor}
                  strokeWidth={5}
                  strokeLinecap="round"
                  style={{ strokeDasharray: r.ringDashArray, strokeDashoffset: r.ringDashOffset }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: "var(--db-text)" }}>
                {r.pct}%
              </div>
            </div>
            <span className="max-w-[80px] truncate text-xs" style={{ color: "var(--db-text-muted)" }}>
              {r.name}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="pb-2 text-left" style={{ color: "var(--db-text-dim)" }}>
                Projeto
              </th>
              {overview.heatCols.map((c) => (
                <th key={c.key} className="pb-2 text-center" style={{ color: "var(--db-text-dim)" }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overview.heatRows.map((row, i) => (
              <tr key={i}>
                <td className="py-1 pr-3" style={{ color: "var(--db-text)" }}>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: row.dotColor }} />
                  {row.name}
                </td>
                {row.cells.map((cell, j) => (
                  <td key={j} className="py-1 text-center font-semibold" style={{ background: cell.background, color: "var(--db-text)" }}>
                    {cell.count}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--db-text-muted)" }}>
          Velocidade (tarefas concluídas por semana){" "}
          {overview.velocityGoalMet ? (
            <span style={{ color: "var(--db-green)" }}>— acima da média ({overview.avgPastLabel})</span>
          ) : (
            <span>— média: {overview.avgPastLabel}</span>
          )}
        </span>
        <div className="flex h-24 items-end gap-1.5">
          {overview.velocityBars.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${b.label}: ${b.count}`}>
              <div
                className="w-full rounded-t-sm"
                style={{ height: `${Math.max(b.heightPct, 2)}%`, background: b.isCurrent ? "var(--db-teal)" : "var(--db-panel-strong)" }}
              />
              <span className="text-[9px]" style={{ color: "var(--db-text-dim)" }}>
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
