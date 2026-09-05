"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import type { Person } from "@/lib/people/types";
import { PRIORITY_COLOR } from "@/lib/tasks/constants";
import { relevantDateFor, isOverdueDate, dateLabelFor } from "@/lib/tasks/list-filters";

// Card do Kanban (Foccus.dc.html:551-575) — avatar (pessoa/projeto),
// concluir/excluir, prioridade, "aguardando", projeto e prazo. `colored`
// alterna só o círculo do avatar entre a cor real (pessoa/projeto) e um
// neutro — o resto (dados, layout, badges de prioridade/prazo) é igual nos
// dois modos, como pedido ("mantendo a visualização e funcionalidades").
export function KanbanCard({
  task,
  project,
  person,
  colored,
  onOpen,
  onToggleDone,
  onDelete,
}: {
  task: Task;
  project: Project | null;
  person: Person | null;
  colored: boolean;
  onOpen: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const avatarLabel = person ? person.name[0]?.toUpperCase() : project ? project.name[0]?.toUpperCase() : "·";
  const avatarBg = colored ? (person ? "var(--pb-accent)" : project ? project.color : "var(--pb-text-dim)") : "var(--pb-text-dim)";
  const showWaiting = task.status === "WAITING" && !!person;

  const relevantDate = relevantDateFor(task);
  const overdue = isOverdueDate(task, relevantDate);
  const dateLabel = relevantDate ? dateLabelFor(task, relevantDate) : "";
  const showDate = !!dateLabel && task.status !== "BLOCKED";
  const dateColor = overdue ? "var(--pb-red)" : task.status === "WAITING" ? "var(--pb-yellow)" : "var(--pb-text-muted)";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      title="Arraste para mover entre colunas ou clique para abrir detalhes"
      className="flex cursor-grab flex-col gap-2 rounded-[9px] p-2.5 active:cursor-grabbing"
      style={{
        background: "var(--pb-glass-strong)",
        border: "1px solid var(--pb-border)",
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    >
      <div className="flex items-start gap-2">
        <span
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: avatarBg }}
        >
          {avatarLabel}
        </span>
        <span
          className="flex-1 text-[13.5px] leading-[1.35]"
          style={
            task.status === "DONE"
              ? { textDecoration: "line-through", color: "var(--pb-text-dim)", fontWeight: 400 }
              : { color: "var(--pb-text)", fontWeight: 600 }
          }
        >
          {task.title}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone();
          }}
          aria-label="Concluir"
          title="Marcar como concluída"
          className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-[15px] leading-none"
          // Mesmo ajuste de task-row.tsx: verde bem visível antes de concluída,
          // em vez de cinza neutro, pra deixar mais claro que é o botão de concluir.
          style={{ color: task.status === "DONE" ? "#10b981" : "#34d399", background: "transparent" }}
        >
          ✓
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Excluir tarefa"
          title="Excluir tarefa"
          className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded text-[11px] leading-none"
          style={{ color: "#ef4444", background: "transparent" }}
        >
          ✕
        </button>
      </div>

      <div className="ml-[35px] flex flex-wrap items-center gap-1.5">
        <span
          title={`Prioridade: ${task.priority}`}
          className="rounded px-[5px] py-px text-[10.5px]"
          style={{ border: "1px solid var(--pb-border)", color: PRIORITY_COLOR[task.priority], fontWeight: 600 }}
        >
          {task.priority}
        </span>

        {showWaiting && (
          <span
            title={`Aguardando: ${person!.name}`}
            className="whitespace-nowrap rounded px-1.5 py-px text-[10.5px]"
            style={{ color: "var(--pb-yellow)", background: "var(--pb-yellow-bg)", border: "1px solid rgba(234,179,8,0.2)" }}
          >
            ⏳ {person!.name}
          </span>
        )}

        <span
          title={`Projeto: ${project ? project.name : "Inbox"}`}
          className="inline-flex max-w-[110px] items-center gap-[3px] overflow-hidden text-[10.5px]"
          style={{ color: "var(--pb-text-dim)" }}
        >
          <span
            className="inline-block h-[6px] w-[6px] shrink-0 rounded-full"
            style={{ background: colored ? (project ? project.color : "var(--pb-text-dim)") : "var(--pb-text-dim)" }}
          />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{project ? project.name : "Inbox"}</span>
        </span>

        {showDate && (
          <span
            title={`Prazo: ${dateLabel}`}
            className="rounded px-1.5 py-px text-[10.5px]"
            style={{ background: "var(--pb-glass)", color: dateColor, fontWeight: overdue ? 600 : 400 }}
          >
            🗓 {dateLabel}
          </span>
        )}
      </div>
    </div>
  );
}
