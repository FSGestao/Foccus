"use client";

import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import { isOverdueDate } from "@/lib/tasks/list-filters";
import { sortTasksByPriorityDueProject } from "@/lib/tasks/sort";
import { dateFullLabel } from "@/lib/calendar/compute";
import { CalendarTaskChip } from "./calendar-task-chip";

// Mesma estrutura de grade do Mês (colunas encolhendo pra caber na largura,
// sem rolagem horizontal) — era colunas de largura fixa com scroll, ficou
// estranho comparado ao resto do calendário. Células bem mais altas que as
// do Mês (só 5-7 dias aqui, não 5-6 semanas), com mais espaço interno, e só
// o nome da tarefa — o projeto já dá pra ver no Kanban (pedido do usuário,
// 2026-09-09).
export function CalendarWeek({
  weekDays,
  today,
  showWeekends,
  tasksByDate,
  projects,
  projectById,
  onOpenTask,
}: {
  weekDays: string[];
  today: string;
  showWeekends: boolean;
  tasksByDate: Map<string, Task[]>;
  projects: Project[];
  projectById: Map<string, Project>;
  onOpenTask: (id: string) => void;
}) {
  const days = showWeekends ? weekDays : weekDays.slice(1, 6);
  const cols = days.length;

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {days.map((dateIso) => {
        const dayTasks = sortTasksByPriorityDueProject(tasksByDate.get(dateIso) ?? [], projects);
        const isToday = dateIso === today;
        const [weekday, dayOfMonth] = dateFullLabel(dateIso).split(", ");

        return (
          <div
            key={dateIso}
            className="flex min-h-[420px] flex-col gap-2 rounded-md p-3"
            style={{
              background: isToday ? "var(--pb-accent-bg)" : "var(--pb-surface-subtle)",
              border: `1px solid ${isToday ? "var(--pb-accent)" : "var(--pb-border)"}`,
            }}
          >
            <div className="flex flex-col items-center gap-0.5 pb-2" style={{ borderBottom: "1px solid var(--pb-border)" }}>
              <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
                {weekday}
              </span>
              <span className="text-[16px] font-bold" style={{ color: isToday ? "var(--pb-accent)" : "var(--pb-text)" }}>
                {dayOfMonth}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {dayTasks.map((t) => (
                <CalendarTaskChip
                  key={t.id}
                  task={t}
                  project={t.project_id ? (projectById.get(t.project_id) ?? null) : null}
                  overdue={isOverdueDate(t, dateIso)}
                  // Fonte menor (era compact=false, 12px) — mesmo tamanho do
                  // Mês, deixa mais tarefa visível por dia sem crescer a
                  // célula à toa (pedido do usuário, 2026-09-09).
                  compact
                  showProject={false}
                  onClick={() => onOpenTask(t.id)}
                />
              ))}
              {dayTasks.length === 0 && (
                <p className="px-1 py-2 text-center text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
                  Nada aqui
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
