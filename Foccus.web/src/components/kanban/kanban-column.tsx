"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import type { Person } from "@/lib/people/types";
import { kanbanColTint } from "@/lib/kanban/compute";
import { KanbanCard } from "./kanban-card";

// Coluna do Kanban (Foccus.dc.html:541-547) — fundo com degradê tintado pela
// cor do grupo quando `colored`, senão o neutro de sempre.
export function KanbanColumn({
  id,
  label,
  icon,
  tintHex,
  colored,
  tasks,
  projectOf,
  personOf,
  onOpenTask,
  onToggleDone,
  onDeleteTask,
}: {
  id: string;
  label: string;
  icon?: string;
  tintHex?: string;
  colored: boolean;
  tasks: Task[];
  projectOf: (t: Task) => Project | null;
  personOf: (t: Task) => Person | null;
  onOpenTask: (id: string) => void;
  onToggleDone: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const tint = colored && tintHex ? kanbanColTint(tintHex) : null;

  return (
    <div
      ref={setNodeRef}
      className="flex w-[280px] shrink-0 flex-col gap-2.5 rounded-xl p-3.5"
      style={{
        background: tint ? tint.colBg : isOver ? "var(--pb-hover)" : "var(--pb-surface-subtle)",
        border: `1px solid ${tint ? tint.colBorder : isOver ? "var(--pb-border-hover)" : "var(--pb-border)"}`,
        maxHeight: "calc(100vh - 260px)",
        overflowY: "auto",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold"
          style={{ color: colored && tintHex ? tintHex : "var(--pb-text)" }}
        >
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </span>
        <span
          title={`${tasks.length} tarefas nesta coluna`}
          className="rounded-full px-1.5 py-px text-[11px] font-semibold"
          style={{ background: "var(--pb-glass-strong)", border: "1px solid var(--pb-border)", color: "var(--pb-text-muted)" }}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex min-h-[20px] flex-col gap-2">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            project={projectOf(task)}
            person={personOf(task)}
            colored={colored}
            onOpen={() => onOpenTask(task.id)}
            onToggleDone={() => onToggleDone(task)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <p className="px-1 py-4 text-center text-xs" style={{ color: "var(--pb-text-dim)" }}>
            Nenhuma tarefa aqui.
          </p>
        )}
      </div>
    </div>
  );
}
