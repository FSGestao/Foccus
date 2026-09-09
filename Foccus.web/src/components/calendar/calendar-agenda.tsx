"use client";

import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import { isOverdueDate } from "@/lib/tasks/list-filters";
import { sortTasksByPriorityDueProject } from "@/lib/tasks/sort";
import { dateFullLabel, isWeekend } from "@/lib/calendar/compute";
import { CalendarTaskChip } from "./calendar-task-chip";

// Lista por dia, só os dias com tarefa (estilo Agenda do Google/Outlook —
// dia vazio não aparece, diferente do Mês/Semana que mostram a grade toda).
export function CalendarAgenda({
  monthDays,
  today,
  showWeekends,
  tasksByDate,
  projects,
  projectById,
  onOpenTask,
}: {
  monthDays: string[];
  today: string;
  showWeekends: boolean;
  tasksByDate: Map<string, Task[]>;
  projects: Project[];
  projectById: Map<string, Project>;
  onOpenTask: (id: string) => void;
}) {
  const daysWithTasks = monthDays.filter((d) => {
    if (!showWeekends && isWeekend(d)) return false;
    return (tasksByDate.get(d) ?? []).length > 0;
  });

  if (daysWithTasks.length === 0) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--pb-text-muted)" }}>
        Nenhuma tarefa com prazo neste mês.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {daysWithTasks.map((dateIso) => {
        const dayTasks = sortTasksByPriorityDueProject(tasksByDate.get(dateIso) ?? [], projects);
        const isToday = dateIso === today;
        return (
          <div key={dateIso} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
                style={{
                  background: isToday ? "var(--pb-accent)" : "var(--pb-surface-subtle)",
                  color: isToday ? "var(--pb-on-accent)" : "var(--pb-text-muted)",
                  border: isToday ? "none" : "1px solid var(--pb-border)",
                }}
              >
                {dateFullLabel(dateIso)}
              </span>
            </div>
            <div className="flex flex-col gap-1 pl-1">
              {dayTasks.map((t) => (
                <CalendarTaskChip
                  key={t.id}
                  task={t}
                  project={t.project_id ? (projectById.get(t.project_id) ?? null) : null}
                  overdue={isOverdueDate(t, dateIso)}
                  compact={false}
                  onClick={() => onOpenTask(t.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
