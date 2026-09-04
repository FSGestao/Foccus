"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { STATUS_LABEL, STATUS_OPTIONS, PRIORITY_OPTIONS, PRIORITY_COLOR } from "@/lib/tasks/constants";
import { relevantDateFor, fmtDateShort } from "@/lib/tasks/list-filters";
import type { Task, TaskStatus, Priority } from "@/lib/tasks/types";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";

type GroupBy = "status" | "project" | "priority" | "due";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Kanban avulso (Foccus.dc.html: viewKanban).
export default function KanbanPage() {
  const { tasks, selectedTaskId, init, updateTask, deleteTask, openTask } = useTasksStore();
  const { projects, init: initProjects } = useProjectsStore();
  const [groupBy, setGroupBy] = useState<GroupBy>("status");

  useEffect(() => {
    init();
    initProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(() => {
    if (groupBy === "status") {
      return STATUS_OPTIONS.map((s) => ({
        id: s.value,
        label: s.label,
        tasks: tasks.filter((t) => t.status === s.value),
      }));
    }
    if (groupBy === "priority") {
      return PRIORITY_OPTIONS.map((p) => ({
        id: p,
        label: p,
        accent: PRIORITY_COLOR[p],
        tasks: tasks.filter((t) => t.priority === p),
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
        accent: d < today ? "var(--pb-red)" : d === today ? "var(--pb-yellow)" : "var(--pb-blue)",
        tasks: dateMap.get(d)!,
      }));
      return [...dateCols, { id: "none", label: "· Sem Prazo", accent: "var(--pb-text-dim)", tasks: noDate }];
    }
    // project
    const cols = projects.map((p) => ({
      id: p.id,
      label: p.name,
      accent: p.color,
      tasks: tasks.filter((t) => t.project_id === p.id),
    }));
    return [
      { id: "none", label: "Inbox", tasks: tasks.filter((t) => !t.project_id) },
      ...cols,
    ];
  }, [groupBy, tasks, projects]);

  function handleDragEnd(event: DragEndEvent) {
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

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="flex flex-col gap-4 px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
          Kanban
        </h1>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className="rounded-md px-2 py-1.5 text-sm"
          style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface)" }}
        >
          <option value="status">Agrupar por status</option>
          <option value="project">Agrupar por projeto</option>
          <option value="priority">Agrupar por prioridade</option>
          <option value="due">Agrupar por prazo</option>
        </select>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="mx-auto flex w-full max-w-5xl gap-3 overflow-x-auto pb-2">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              accent={"accent" in col ? col.accent : undefined}
              tasks={col.tasks}
              onOpenTask={openTask}
            />
          ))}
        </div>
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
