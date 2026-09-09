"use client";

import { useEffect, useMemo, useState } from "react";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { usePeopleStore } from "@/lib/stores/people-store";
import {
  addDays,
  addMonths,
  buildMonthDays,
  buildMonthGrid,
  buildWeekDays,
  monthYearLabel,
  tasksByDate as buildTasksByDate,
  todayISO,
  weekRangeLabel,
  type CalendarViewMode,
} from "@/lib/calendar/compute";
import { CalendarMonth } from "@/components/calendar/calendar-month";
import { CalendarWeek } from "@/components/calendar/calendar-week";
import { CalendarAgenda } from "@/components/calendar/calendar-agenda";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { AssistantBanners } from "@/components/assistant/assistant-banners";

const VIEW_KEY = "foccus_web_calendar_view";
const WEEKENDS_KEY = "foccus_web_calendar_weekends";

const VIEW_TABS: { value: CalendarViewMode; label: string }[] = [
  { value: "month", label: "Mês" },
  { value: "week", label: "Semana" },
  { value: "agenda", label: "Agenda" },
];

// Calendário (Mês/Semana/Agenda) — tarefa aparece pela "data relevante"
// (due_date, ou follow_up_date quando Aguardando), mesma regra do Kanban/
// Lista por Prazo. Arrastar tarefa pra outro dia (mudar o prazo) fica pra
// uma v2 — combinado com o usuário em 2026-09-09, o DragOverlay que o Kanban
// já usa serve de base pra isso depois.
export default function CalendarPage() {
  const { tasks, selectedTaskId, init, updateTask, deleteTask, openTask } = useTasksStore();
  const { projects, init: initProjects } = useProjectsStore();
  const { init: initPeople } = usePeopleStore();

  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  // Fins de semana começam visíveis (igual ao server-rendered) e só aplicam
  // a preferência salva depois de montado — mesmo cuidado de hidratação do
  // "com/sem cores" do Kanban.
  const [showWeekends, setShowWeekends] = useState(true);
  const [anchor, setAnchor] = useState(todayISO());

  useEffect(() => {
    init();
    initProjects();
    initPeople();
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView === "month" || savedView === "week" || savedView === "agenda") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com localStorage, só ao montar
        setViewMode(savedView);
      }
      setShowWeekends(localStorage.getItem(WEEKENDS_KEY) !== "0");
    } catch {
      // localStorage indisponível — segue com os padrões
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSetViewMode(mode: CalendarViewMode) {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch {
      // segue sem persistir
    }
  }

  function handleToggleWeekends(next: boolean) {
    setShowWeekends(next);
    try {
      localStorage.setItem(WEEKENDS_KEY, next ? "1" : "0");
    } catch {
      // segue sem persistir
    }
  }

  const today = todayISO();
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const dateMap = useMemo(() => buildTasksByDate(tasks), [tasks]);

  const weeks = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const weekDays = useMemo(() => buildWeekDays(anchor), [anchor]);
  const monthDays = useMemo(() => buildMonthDays(anchor), [anchor]);

  function goToday() {
    setAnchor(todayISO());
  }
  function goPrev() {
    setAnchor((a) => (viewMode === "week" ? addDays(a, -7) : addMonths(a, -1)));
  }
  function goNext() {
    setAnchor((a) => (viewMode === "week" ? addDays(a, 7) : addMonths(a, 1)));
  }

  const periodLabel = viewMode === "week" ? weekRangeLabel(weekDays) : monthYearLabel(anchor);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <AssistantBanners />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
            Calendário
          </h1>
          <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--pb-text-muted)" }}>
            Suas tarefas organizadas por prazo
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          <label className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--pb-text-muted)" }}>
            <input
              type="checkbox"
              checked={showWeekends}
              onChange={(e) => handleToggleWeekends(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Fins de semana
          </label>

          <div
            className="inline-flex gap-0.5 rounded-full p-0.5"
            style={{
              background: "var(--pb-glass)",
              backdropFilter: "blur(10px) saturate(150%)",
              WebkitBackdropFilter: "blur(10px) saturate(150%)",
              border: "1px solid var(--pb-border)",
            }}
          >
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleSetViewMode(tab.value)}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-all"
                style={{
                  background: viewMode === tab.value ? "var(--pb-accent)" : "transparent",
                  color: viewMode === tab.value ? "var(--pb-on-accent)" : "var(--pb-text-muted)",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            title="Período anterior"
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)", color: "var(--pb-text)", cursor: "pointer" }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            title="Próximo período"
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)", color: "var(--pb-text)", cursor: "pointer" }}
          >
            ›
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-md px-2.5 py-1 text-[12px] font-medium"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)", color: "var(--pb-text)", cursor: "pointer" }}
          >
            Hoje
          </button>
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--pb-text)" }}>
          {periodLabel}
        </span>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        {viewMode === "month" && (
          <CalendarMonth
            weeks={weeks}
            anchorIso={anchor}
            today={today}
            showWeekends={showWeekends}
            tasksByDate={dateMap}
            projects={projects}
            projectById={projectById}
            onOpenTask={openTask}
          />
        )}
        {viewMode === "week" && (
          <CalendarWeek
            weekDays={weekDays}
            today={today}
            showWeekends={showWeekends}
            tasksByDate={dateMap}
            projects={projects}
            projectById={projectById}
            onOpenTask={openTask}
          />
        )}
        {viewMode === "agenda" && (
          <CalendarAgenda
            monthDays={monthDays}
            today={today}
            showWeekends={showWeekends}
            tasksByDate={dateMap}
            projects={projects}
            projectById={projectById}
            onOpenTask={openTask}
          />
        )}
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => openTask(null)}
          onChange={(patch, note) => updateTask(selectedTask.id, patch, note)}
          onDelete={() => {
            deleteTask(selectedTask.id);
            openTask(null);
          }}
        />
      )}
    </div>
  );
}
