"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { usePeopleStore } from "@/lib/stores/people-store";
import { STATUS_LABEL, STATUS_OPTIONS, STATUS_ICON, STATUS_TINT_HEX, PRIORITY_OPTIONS, PRIORITY_COLOR } from "@/lib/tasks/constants";
import { relevantDateFor, fmtDateShort } from "@/lib/tasks/list-filters";
import { sortTasksByPriorityDueProject } from "@/lib/tasks/sort";
import type { Task, TaskStatus, Priority } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCardBody } from "@/components/kanban/kanban-card";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { AssistantBanners } from "@/components/assistant/assistant-banners";

type GroupBy = "status" | "project" | "priority" | "due";

const PRIORITY_ICON: Record<Priority, string> = { P1: "❶", P2: "❷", P3: "❸", P4: "❹" };
const KANBAN_COLORED_KEY = "foccus_web_kanban_colored";

// Data local, não UTC — ver mesma correção em lib/assistant/compute.ts.
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Kanban avulso (Foccus.dc.html: viewKanban) — "com cores"/"sem cores" é uma
// opção nova (o legado só tem o modo colorido); alterna o tint das colunas e
// a cor do avatar dos cards, mantendo layout e funcionalidades iguais nos
// dois modos.
export default function KanbanPage() {
  const { tasks, selectedTaskId, init, updateTask, deleteTask, toggleDone, openTask } = useTasksStore();
  const { projects, init: initProjects } = useProjectsStore();
  const { people, init: initPeople } = usePeopleStore();
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  // Começa sem cores (igual ao server-rendered e ao comportamento de antes
  // desta opção existir) e só aplica a preferência salva depois de montado —
  // ler localStorage já no useState quebraria a hidratação (SSR não tem
  // acesso a ele, o HTML gerado no build sempre seria "sem cores").
  const [colored, setColored] = useState(false);
  // Id da tarefa sendo arrastada — só pro clone do DragOverlay (ver abaixo).
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    init();
    initProjects();
    initPeople();
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com localStorage (sistema externo), só roda uma vez ao montar
      setColored(localStorage.getItem(KANBAN_COLORED_KEY) === "1");
    } catch {
      // localStorage indisponível (ex.: navegação privada) — segue sem cores
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggleColored(next: boolean) {
    setColored(next);
    try {
      localStorage.setItem(KANBAN_COLORED_KEY, next ? "1" : "0");
    } catch {
      // segue sem persistir
    }
  }

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const projectOf = (t: Task): Project | null => (t.project_id ? (projectById.get(t.project_id) ?? null) : null);
  const personOf = (t: Task) => (t.waiting_for ? (personById.get(t.waiting_for) ?? null) : null);
  const activeTask = activeTaskId ? (tasks.find((t) => t.id === activeTaskId) ?? null) : null;

  const columns = useMemo(() => {
    if (groupBy === "status") {
      return STATUS_OPTIONS.map((s) => ({
        id: s.value,
        label: STATUS_LABEL[s.value],
        icon: STATUS_ICON[s.value],
        tintHex: STATUS_TINT_HEX[s.value],
        tasks: tasks.filter((t) => t.status === s.value),
      }));
    }
    if (groupBy === "priority") {
      return PRIORITY_OPTIONS.map((p) => ({
        id: p,
        label: p,
        icon: PRIORITY_ICON[p],
        tintHex: PRIORITY_COLOR[p],
        tasks: sortTasksByPriorityDueProject(tasks.filter((t) => t.priority === p), projects),
      }));
    }
    if (groupBy === "due") {
      // Uma coluna por data (dueDate, ou followUpDate se Aguardando) presente
      // entre as tarefas + "Sem Prazo" no fim (Foccus.dc.html:3529-3582) — cada
      // coluna tem uma data única e bem definida, então soltar um card nela
      // grava esse due_date exato (ou limpa, na coluna "Sem Prazo").
      const kbTasks = tasks.filter((t) => t.status !== "INBOX" && t.status !== "CANCELLED");
      const today = todayISO();
      const dateMap = new Map<string, Task[]>();
      const noDate: Task[] = [];
      for (const t of kbTasks) {
        const d = relevantDateFor(t);
        if (!d) noDate.push(t);
        else {
          if (!dateMap.has(d)) dateMap.set(d, []);
          dateMap.get(d)!.push(t);
        }
      }
      const dateCols = [...dateMap.keys()].sort().map((d) => ({
        id: d,
        label: `${d < today ? "⚠️" : "🗓"} ${fmtDateShort(d)}`,
        icon: undefined as string | undefined,
        tintHex: d < today ? STATUS_TINT_HEX.BLOCKED : d === today ? STATUS_TINT_HEX.WAITING : STATUS_TINT_HEX.TODO,
        tasks: sortTasksByPriorityDueProject(dateMap.get(d)!, projects),
      }));
      return [
        ...dateCols,
        { id: "none", label: "· Sem Prazo", icon: undefined, tintHex: undefined, tasks: sortTasksByPriorityDueProject(noDate, projects) },
      ];
    }
    // project
    const cols = projects.map((p) => ({
      id: p.id,
      label: p.name,
      icon: "📁",
      tintHex: p.color,
      tasks: sortTasksByPriorityDueProject(tasks.filter((t) => t.project_id === p.id), projects),
    }));
    return [
      {
        id: "none",
        label: "Inbox",
        icon: "📁",
        tintHex: "#94a3b8",
        tasks: sortTasksByPriorityDueProject(tasks.filter((t) => !t.project_id), projects),
      },
      ...cols,
    ];
  }, [groupBy, tasks, projects]);

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const targetColId = String(over.id);

    if (groupBy === "status") {
      const status = targetColId as TaskStatus;
      const patch: Partial<Task> =
        status === "DONE" ? { status, completed_at: new Date().toISOString() } : { status };
      updateTask(taskId, patch, `Movida para ${STATUS_LABEL[status]} pelo Kanban`);
    } else if (groupBy === "priority") {
      updateTask(taskId, { priority: targetColId as Priority });
    } else if (groupBy === "due") {
      const date = targetColId === "none" ? null : targetColId;
      updateTask(taskId, { due_date: date }, date ? `Prazo alterado para ${fmtDateShort(date)}` : "Prazo removido");
    } else {
      updateTask(taskId, { project_id: targetColId === "none" ? null : targetColId });
    }
  }

  function handleDragCancel() {
    setActiveTaskId(null);
  }

  function handleToggleDone(task: Task) {
    toggleDone(task.id);
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <AssistantBanners />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
            Kanban
          </h1>
          <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--pb-text-muted)" }}>
            Organize suas tarefas visualmente em cards
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div
            className="inline-flex gap-0.5 rounded-full p-0.5"
            style={{
              background: "var(--pb-glass)",
              backdropFilter: "blur(10px) saturate(150%)",
              WebkitBackdropFilter: "blur(10px) saturate(150%)",
              border: "1px solid var(--pb-border)",
            }}
          >
            {[
              { value: false, label: "Sem cores" },
              { value: true, label: "Com cores" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleToggleColored(opt.value)}
                title={opt.value ? "Colunas e avatares coloridos, como no Foccus.dc" : "Visual neutro, sem cores de destaque"}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-all"
                style={{
                  background: colored === opt.value ? "var(--pb-accent)" : "transparent",
                  color: colored === opt.value ? "var(--pb-on-accent)" : "var(--pb-text-muted)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <label className="whitespace-nowrap text-[11.5px] font-medium" style={{ color: "var(--pb-text-dim)" }}>
              Agrupar:
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              title="Agrupar colunas do Kanban"
              className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold"
              style={{
                background: "var(--pb-glass)",
                backdropFilter: "blur(10px) saturate(150%)",
                WebkitBackdropFilter: "blur(10px) saturate(150%)",
                border: "1px solid var(--pb-border)",
                color: "var(--pb-text)",
              }}
            >
              <option value="status">Status</option>
              <option value="project">Projeto</option>
              <option value="priority">Urgência</option>
              <option value="due">Prazo</option>
            </select>
          </div>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <div role="region" aria-label="Quadro Kanban" className="mx-auto flex w-full max-w-5xl items-start gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              icon={col.icon}
              tintHex={col.tintHex}
              colored={colored}
              tasks={col.tasks}
              projectOf={projectOf}
              personOf={personOf}
              onOpenTask={openTask}
              onToggleDone={handleToggleDone}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>
        {/* Clone do card sendo arrastado, num portal do dnd-kit — sempre por
            cima de tudo (era o card real se movendo no próprio lugar via
            transform, que ficava clipado/pintado por baixo das colunas
            vizinhas; ver comentário em kanban-card.tsx). */}
        <DragOverlay>
          {activeTask && (
            <div
              className="flex w-[280px] cursor-grabbing flex-col gap-2 rounded-[9px] p-2.5"
              style={{ background: "var(--pb-surface)", border: "1px solid var(--pb-border)", boxShadow: "0 14px 32px rgba(0,0,0,0.35)" }}
            >
              <KanbanCardBody
                task={activeTask}
                project={projectOf(activeTask)}
                person={personOf(activeTask)}
                colored={colored}
                onToggleDone={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
