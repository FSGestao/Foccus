"use client";

import { useState } from "react";
import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import { isOverdueDate } from "@/lib/tasks/list-filters";
import { sortTasksByPriorityDueProject } from "@/lib/tasks/sort";
import { dayNumberLabel, isSameMonth, weekdayLabels } from "@/lib/calendar/compute";
import { CalendarTaskChip } from "./calendar-task-chip";

const VISIBLE_CAP = 3;

export function CalendarMonth({
  weeks,
  anchorIso,
  today,
  showWeekends,
  tasksByDate,
  projects,
  projectById,
  onOpenTask,
}: {
  weeks: string[][];
  anchorIso: string;
  today: string;
  showWeekends: boolean;
  tasksByDate: Map<string, Task[]>;
  projects: Project[];
  projectById: Map<string, Project>;
  onOpenTask: (id: string) => void;
}) {
  // Dias com "+N mais" expandido — reseta implicitamente ao trocar de mês
  // porque a chave é a data ISO (mês diferente = chaves diferentes).
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(dateIso: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(dateIso)) next.delete(dateIso);
      else next.add(dateIso);
      return next;
    });
  }

  const cols = showWeekends ? 7 : 5;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {weekdayLabels(showWeekends).map((label) => (
          <div key={label} className="text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => {
          const days = showWeekends ? week : week.slice(1, 6);
          return (
            <div key={wi} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {days.map((dateIso) => {
                const dayTasks = sortTasksByPriorityDueProject(tasksByDate.get(dateIso) ?? [], projects);
                const inMonth = isSameMonth(dateIso, anchorIso);
                const isToday = dateIso === today;
                const isExpanded = expanded.has(dateIso);
                const visibleTasks = isExpanded ? dayTasks : dayTasks.slice(0, VISIBLE_CAP);
                const hiddenCount = dayTasks.length - visibleTasks.length;

                return (
                  <div
                    key={dateIso}
                    className="flex min-h-[92px] flex-col gap-1 rounded-md p-1.5"
                    style={{
                      background: isToday ? "var(--pb-accent-bg)" : "var(--pb-surface-subtle)",
                      border: `1px solid ${isToday ? "var(--pb-accent)" : "var(--pb-border)"}`,
                      opacity: inMonth ? 1 : 0.45,
                    }}
                  >
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: isToday ? "var(--pb-accent)" : "var(--pb-text-muted)" }}
                    >
                      {dayNumberLabel(dateIso)}
                    </span>
                    <div className="flex flex-col gap-1">
                      {visibleTasks.map((t) => (
                        <CalendarTaskChip
                          key={t.id}
                          task={t}
                          project={t.project_id ? (projectById.get(t.project_id) ?? null) : null}
                          overdue={isOverdueDate(t, dateIso)}
                          compact
                          onClick={() => onOpenTask(t.id)}
                        />
                      ))}
                      {hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(dateIso)}
                          className="text-left text-[10.5px] font-medium"
                          style={{ color: "var(--pb-accent)", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          +{hiddenCount} mais
                        </button>
                      )}
                      {isExpanded && dayTasks.length > VISIBLE_CAP && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(dateIso)}
                          className="text-left text-[10.5px] font-medium"
                          style={{ color: "var(--pb-text-dim)", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          mostrar menos
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
