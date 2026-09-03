"use client";

import { useState } from "react";
import type { Comment, Task } from "@/lib/tasks/types";

// Card da tela Aguardando: motivo, retorno esperado e a thread de comentários
// (Foccus.dc.html, addWaitingComment) — diferente da linha da Minha Lista, o
// foco aqui é a conversa em volta do bloqueio, não edição de campos.
export function WaitingCard({
  task,
  authorLabel,
  onAddComment,
  onOpen,
}: {
  task: Task;
  authorLabel: string;
  onAddComment: (text: string) => void;
  onOpen: () => void;
}) {
  const [draft, setDraft] = useState("");

  function submitComment() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setDraft("");
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-3 text-sm"
      style={{ background: "var(--pb-glass-card)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="text-left font-medium">
          {task.title}
        </button>
        {task.follow_up_date && (
          <span className="shrink-0 text-xs" style={{ color: "var(--pb-yellow-text)" }}>
            retorno: {task.follow_up_date}
          </span>
        )}
      </div>

      {task.waiting_reason && (
        <p className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
          {task.waiting_reason}
        </p>
      )}

      {task.comments && task.comments.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: "var(--pb-border)" }}>
          {task.comments.map((c: Comment) => (
            <li key={c.id} className="text-xs">
              <span className="font-medium">{c.author}</span>{" "}
              <span style={{ color: "var(--pb-text-dim)" }}>
                {new Date(c.date).toLocaleDateString("pt-BR")}
              </span>
              <p>{c.text}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitComment();
          }}
          placeholder={`Comentar como ${authorLabel}...`}
          className="flex-1 rounded-md px-2 py-1 text-xs"
          style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
        />
        <button
          type="button"
          onClick={submitComment}
          className="rounded-md px-2 py-1 text-xs"
          style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
