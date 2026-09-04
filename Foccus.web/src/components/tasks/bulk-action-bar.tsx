"use client";

import type { Priority } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";

const PRIORITY_BUTTONS: { value: Priority; glyph: string; color: string; bg: string; border: string }[] = [
  { value: "P1", glyph: "❶", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  { value: "P2", glyph: "❷", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  { value: "P3", glyph: "❸", color: "#1e40af", bg: "rgba(30,64,175,0.1)", border: "rgba(30,64,175,0.3)" },
  { value: "P4", glyph: "❹", color: "#4d7c0f", bg: "rgba(77,124,15,0.1)", border: "rgba(77,124,15,0.3)" },
];

// Barra flutuante contextual (Foccus.dc.html:294-329) — aparece quando 1+
// tarefas estão selecionadas na Minha Lista (Shift/Ctrl+clique ou arraste).
export function BulkActionBar({
  count,
  projects,
  onClear,
  onAssignProject,
  onSetPriority,
  onComplete,
  onDelete,
}: {
  count: number;
  projects: Project[];
  onClear: () => void;
  onAssignProject: (projectId: string | null) => void;
  onSetPriority: (priority: Priority) => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-40 flex max-w-[92vw] -translate-x-1/2 flex-wrap items-center gap-3 rounded-xl px-3.5 py-2"
      style={{
        background: "var(--pb-glass)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        border: "1px solid var(--pb-border-hover)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center gap-2 border-r pr-2" style={{ borderColor: "var(--pb-border)" }}>
        <span
          className="whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold"
          style={{ color: "var(--pb-accent)", background: "var(--pb-accent-bg)" }}
        >
          🎯 {count} {count === 1 ? "tarefa selecionada" : "tarefas selecionadas"}
        </span>
        <button
          type="button"
          onClick={onClear}
          title="Limpar seleção (Atalho: Esc)"
          className="px-1 py-0.5 text-xs"
          style={{ background: "transparent", border: "none", color: "var(--pb-text-muted)" }}
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: "var(--pb-text-dim)" }} title="Mover para Projeto">
          📁
        </span>
        <select
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            onAssignProject(v === "none" ? null : v);
          }}
          title="Atribuir as tarefas selecionadas a um Projeto"
          className="rounded-md px-2 py-1 text-xs"
          style={{ background: "var(--pb-surface-subtle)", color: "var(--pb-text)", border: "1px solid var(--pb-border)" }}
        >
          <option value="" disabled>
            Atribuir Projeto...
          </option>
          <option value="none">📥 Inbox (Sem Projeto)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <span className="mr-0.5 text-xs" style={{ color: "var(--pb-text-dim)" }} title="Alterar Prioridade">
          ⚡
        </span>
        {PRIORITY_BUTTONS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onSetPriority(p.value)}
            title={`Definir Prioridade ${p.value}`}
            className="rounded-md px-1.5 py-0.5 text-xs font-bold"
            style={{ border: `1px solid ${p.border}`, background: p.bg, color: p.color }}
          >
            {p.glyph}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-l pl-2" style={{ borderColor: "var(--pb-border)" }}>
        <button
          type="button"
          onClick={onComplete}
          title="Marcar todas as selecionadas como Concluídas"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium"
          style={{ border: "1px solid #10b981", background: "rgba(16,185,129,0.1)", color: "#10b981" }}
        >
          ✓ Concluir
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Excluir as tarefas selecionadas (com suporte a Desfazer)"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium"
          style={{ border: "1px solid rgba(239,68,68,0.25)", background: "transparent", color: "#ef4444" }}
        >
          ✕ Excluir
        </button>
      </div>
    </div>
  );
}
