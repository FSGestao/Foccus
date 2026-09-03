"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/lib/tasks/types";
import { PRIORITY_COLOR } from "@/lib/tasks/constants";

export function KanbanCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className="flex cursor-grab flex-col gap-1.5 rounded-md p-2.5 text-xs active:cursor-grabbing"
      style={{
        background: "var(--pb-glass-card)",
        border: "1px solid var(--pb-border)",
        color: "var(--pb-text)",
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="rounded px-1 py-0.5 font-semibold"
          style={{ color: PRIORITY_COLOR[task.priority], background: "var(--pb-surface-subtle)" }}
        >
          {task.priority}
        </span>
        {task.due_date && <span style={{ color: "var(--pb-text-muted)" }}>{task.due_date}</span>}
      </div>
      <span className="font-medium">{task.title}</span>
    </div>
  );
}
