"use client";

import { useState } from "react";
import type { Task } from "@/lib/tasks/types";
import { PRIORITY_COLOR, STATUS_COLOR, STATUS_ICON, STATUS_LABEL } from "@/lib/tasks/constants";
import { relevantDateFor, isOverdueDate, dateLabelFor } from "@/lib/tasks/list-filters";
import { useProjectsStore } from "@/lib/stores/projects-store";

// Cartão de vidro (--pb-glass-card + blur), porta fiel do `buildRow` do
// legado (Foccus.dc.html:2514-2586, markup em :341-408): botões ✓/✕ em vez
// de checkbox nativo, prioridade como dingbat colorido (❶❷❸❹ — o "círculo
// preenchido com o número" já é o glifo Unicode, só a cor muda), badge de
// status com o mesmo ícone/cor do select do painel de detalhe.
export function TaskRow({
  task,
  onOpen,
  onToggleDone,
  onChangePriority,
  onChangeDate,
  onDelete,
}: {
  task: Task;
  onOpen: () => void;
  onToggleDone: () => void;
  onChangePriority: (priority: Task["priority"]) => void;
  onChangeDate: (date: string | null) => void;
  onDelete: () => void;
}) {
  const [editingDate, setEditingDate] = useState(false);
  const done = task.status === "DONE";
  const blocked = task.status === "BLOCKED";
  const relevantDate = relevantDateFor(task);
  const overdue = isOverdueDate(task, relevantDate);
  const dateLabel = dateLabelFor(task, relevantDate);
  const project = useProjectsStore((s) =>
    task.project_id ? s.projects.find((p) => p.id === task.project_id) : undefined,
  );

  return (
    <div
      onClick={onOpen}
      className="flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors"
      style={{
        background: "var(--pb-glass-card)",
        backdropFilter: "blur(12px) saturate(160%)",
        WebkitBackdropFilter: "blur(12px) saturate(160%)",
        border: "1px solid var(--pb-border-hover)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        color: "var(--pb-text)",
      }}
    >
      <button
        type="button"
        aria-label="Concluir"
        title="Marcar como concluída"
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone();
        }}
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded p-0 text-[15px] leading-none"
        style={{ background: "transparent", border: "none", color: done ? "#10b981" : "var(--pb-text-dim)" }}
      >
        ✓
      </button>
      <button
        type="button"
        aria-label="Excluir tarefa"
        title="Excluir tarefa"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded p-0 text-[11px] leading-none"
        style={{ background: "transparent", border: "none", color: "#ef4444" }}
      >
        ✕
      </button>

      <select
        value={task.priority}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChangePriority(e.target.value as Task["priority"])}
        title="Alterar prioridade da tarefa"
        className="shrink-0 appearance-none bg-transparent text-[13px] font-semibold outline-none"
        style={{ color: PRIORITY_COLOR[task.priority], border: "none", padding: 0 }}
      >
        <option value="P1" style={{ color: PRIORITY_COLOR.P1 }}>❶</option>
        <option value="P2" style={{ color: PRIORITY_COLOR.P2 }}>❷</option>
        <option value="P3" style={{ color: PRIORITY_COLOR.P3 }}>❸</option>
        <option value="P4" style={{ color: PRIORITY_COLOR.P4 }}>❹</option>
      </select>

      <span
        title={STATUS_LABEL[task.status]}
        className="shrink-0 text-xs leading-none"
        style={{ color: STATUS_COLOR[task.status] }}
      >
        {STATUS_ICON[task.status]}
      </span>

      <span
        className="flex-1 truncate"
        style={
          done
            ? { textDecoration: "line-through", color: "var(--pb-text-dim)", fontWeight: 400 }
            : { fontWeight: 600 }
        }
      >
        {task.title}
      </span>

      {project && (
        <span
          className="inline-flex shrink-0 items-center gap-1 text-xs"
          style={{ color: "var(--pb-text-dim)" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: project.color }} />
          <span className="max-w-[90px] truncate">{project.name}</span>
        </span>
      )}

      {blocked ? (
        <span
          title={task.blocked_by ?? undefined}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium"
          style={{ color: "#ef4444" }}
        >
          <span>⛔</span>
          <span>Bloqueada</span>
        </span>
      ) : (
        dateLabel &&
        (editingDate ? (
          <input
            type="date"
            autoFocus
            defaultValue={relevantDate ?? ""}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => {
              onChangeDate(e.target.value || null);
              setEditingDate(false);
            }}
            className="shrink-0 rounded px-1 py-0.5 text-xs"
            style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-accent)", color: "var(--pb-text)" }}
          />
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setEditingDate(true);
            }}
            title={`Prazo: ${dateLabel} (clique para alterar)`}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap text-xs"
            style={{
              color: overdue ? "var(--pb-red)" : task.status === "WAITING" ? "var(--pb-yellow)" : "var(--pb-text-muted)",
              fontWeight: overdue ? 600 : 400,
            }}
          >
            <span>🗓</span>
            <span>{dateLabel}</span>
          </span>
        ))
      )}
    </div>
  );
}
