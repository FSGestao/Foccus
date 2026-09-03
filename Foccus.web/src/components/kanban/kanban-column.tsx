"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Task } from "@/lib/tasks/types";
import { KanbanCard } from "./kanban-card";

export function KanbanColumn({
  id,
  label,
  accent,
  tasks,
  onOpenTask,
}: {
  id: string;
  label: string;
  accent?: string;
  tasks: Task[];
  onOpenTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex w-64 shrink-0 flex-col gap-2 rounded-lg p-2.5"
      style={{
        background: isOver ? "var(--pb-hover)" : "var(--pb-surface-subtle)",
        border: `1px solid ${isOver ? "var(--pb-border-hover)" : "var(--pb-border)"}`,
      }}
    >
      <div className="flex items-center justify-between px-1 pb-1 text-xs font-semibold">
        <span style={{ color: accent ?? "var(--pb-text)" }}>{label}</span>
        <span style={{ color: "var(--pb-text-dim)" }}>{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onOpen={() => onOpenTask(task.id)} />
        ))}
        {tasks.length === 0 && (
          <p className="px-1 text-xs" style={{ color: "var(--pb-text-dim)" }}>
            Vazio
          </p>
        )}
      </div>
    </div>
  );
}
