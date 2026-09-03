"use client";

import { buildKanbanColumns, PRIORITY_COLOR } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";

export function DashboardKanban({ scopeTasks, onOpenTask }: { scopeTasks: Task[]; onOpenTask: (id: string) => void }) {
  const columns = buildKanbanColumns(scopeTasks);

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-2">
      {columns.map((col) => (
        <div
          key={col.key}
          className="flex w-[280px] shrink-0 flex-col gap-2.5 rounded-xl p-3.5"
          style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: col.accent }}>
              <span>{col.icon}</span>
              <span>{col.label}</span>
            </span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              style={{ background: "var(--db-panel-strong)", border: "1px solid var(--db-border)", color: "var(--db-text-muted)" }}
            >
              {col.tasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {col.tasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpenTask(t.id)}
                className="flex flex-col gap-2 rounded-md p-2.5 text-left"
                style={{ background: "var(--db-panel-strong)", border: "1px solid var(--db-border)" }}
              >
                <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--db-text)" }}>
                  {t.title}
                </span>
                <span
                  className="w-fit rounded px-1 py-0.5 text-[10.5px]"
                  style={{ border: "1px solid var(--db-border)", color: PRIORITY_COLOR[t.priority] }}
                >
                  {t.priority}
                </span>
              </button>
            ))}
            {col.tasks.length === 0 && (
              <p className="text-xs" style={{ color: "var(--db-text-dim)" }}>
                Vazio
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
