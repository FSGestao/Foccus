"use client";

import { useEffect, useState } from "react";
import type { ChecklistItem, Comment, Task } from "@/lib/tasks/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/tasks/constants";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { usePeopleStore } from "@/lib/stores/people-store";
import { createClient } from "@/lib/supabase/client";
import { Checklist } from "./checklist";

export function TaskDetailPanel({
  task,
  onClose,
  onChange,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onChange: (patch: Partial<Task>, note?: string) => void;
  onDelete: () => void;
}) {
  // Título/descrição só gravam no blur (evita 1 update por tecla digitada) — o
  // resto dos campos (select/date/number) já são discretos, gravam direto.
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  const projects = useProjectsStore((s) => s.projects);
  const initProjects = useProjectsStore((s) => s.init);
  const people = usePeopleStore((s) => s.people);
  const initPeople = usePeopleStore((s) => s.init);
  const [authorLabel, setAuthorLabel] = useState("Você");
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    initProjects();
    initPeople();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = (user?.user_metadata?.full_name as string | undefined) || user?.email;
      if (name) setAuthorLabel(name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showProgress = task.status === "IN_PROGRESS" || task.status === "WAITING";
  const isWaiting = task.status === "WAITING";

  function commitTitle() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) onChange({ title: trimmed });
  }

  function commitDescription() {
    if (description !== (task.description ?? "")) onChange({ description });
  }

  function handleChecklistChange(items: ChecklistItem[]) {
    onChange({ checklist: items });
  }

  // Anotações (Foccus.dc.html: addWaitingComment) — mesmo campo `comments`
  // usado na thread de Aguardando, mas disponível em qualquer tarefa aqui no
  // painel de detalhe, não só nas que estão aguardando alguém.
  function addNote() {
    const text = noteDraft.trim();
    if (!text) return;
    const comment: Comment = { id: crypto.randomUUID(), author: authorLabel, date: new Date().toISOString(), text };
    onChange({ comments: [...(task.comments ?? []), comment] }, `Anotação registrada por ${authorLabel}`);
    setNoteDraft("");
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col gap-5 overflow-y-auto p-6"
        style={{
          background: "var(--pb-glass-card)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          borderLeft: "1px solid var(--pb-border-hover)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.22)",
          color: "var(--pb-text)",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            className="flex-1 bg-transparent pb-1 text-lg font-semibold outline-none"
            style={{ borderBottom: "1px solid var(--pb-border)" }}
          />
          <button
            type="button"
            onClick={onClose}
            className="text-sm"
            style={{ color: "var(--pb-text-muted)" }}
          >
            fechar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Status</label>
            <select
              value={task.status}
              onChange={(e) => onChange({ status: e.target.value as Task["status"] })}
              className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Prioridade</label>
            <select
              value={task.priority}
              onChange={(e) => onChange({ priority: e.target.value as Task["priority"] })}
              className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Prazo</label>
            <input
              type="date"
              value={task.due_date ?? ""}
              onChange={(e) => onChange({ due_date: e.target.value || null })}
              className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Projeto</label>
            <select
              value={task.project_id ?? ""}
              onChange={(e) => onChange({ project_id: e.target.value || null })}
              className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
            >
              <option value="">Inbox (sem projeto)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Estimativa (min)</label>
            <input
              type="number"
              min={0}
              value={task.estimated_minutes ?? ""}
              onChange={(e) =>
                onChange({
                  estimated_minutes: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
            />
          </div>

          {showProgress && (
            <div
              className="col-span-2 rounded-md p-2.5"
              style={{ background: "var(--pb-accent-bg)", border: "1px solid var(--pb-accent)" }}
            >
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--pb-accent)" }}
              >
                % de conclusão desta tarefa
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={task.progress_pct ?? 0}
                  onChange={(e) => onChange({ progress_pct: Number(e.target.value) })}
                  className="w-[70px] shrink-0 rounded-md px-2 py-1.5 text-sm"
                  style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
                />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--pb-surface)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${task.progress_pct ?? 0}%`, background: "var(--pb-accent)" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {isWaiting && (
          <div
            className="flex flex-col gap-3 rounded-md p-3"
            style={{ background: "var(--pb-yellow-bg)", border: "1px solid var(--pb-border)" }}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Aguardando quem</label>
              <select
                value={task.waiting_for ?? ""}
                onChange={(e) => onChange({ waiting_for: e.target.value || null })}
                className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
              >
                <option value="">Ninguém selecionado</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Motivo</label>
              <input
                type="text"
                value={task.waiting_reason ?? ""}
                onChange={(e) => onChange({ waiting_reason: e.target.value })}
                className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Retorno esperado</label>
              <input
                type="date"
                value={task.follow_up_date ?? ""}
                onChange={(e) => onChange({ follow_up_date: e.target.value || null })}
                className="w-full rounded-md px-2 py-1.5 text-sm"
              style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitDescription}
            rows={4}
            className="w-full resize-y rounded-md px-3 py-2 text-sm"
            style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}>Checklist</label>
          <Checklist items={task.checklist ?? []} onChange={handleChecklistChange} />
        </div>

        <div className="flex flex-col gap-1.5 pt-3.5" style={{ borderTop: "1px solid var(--pb-border)" }}>
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
              Anotações ({task.comments?.length ?? 0})
            </label>
            <span className="text-[11px]" style={{ color: "var(--pb-text-muted)" }}>
              Salvo na entidade
            </span>
          </div>

          {task.comments && task.comments.length > 0 && (
            <div className="mb-1 flex max-h-40 flex-col gap-2 overflow-y-auto">
              {task.comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md px-2.5 py-2"
                  style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}
                >
                  <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
                    <strong style={{ color: "var(--pb-text)" }}>{c.author}</strong>
                    <span>{new Date(c.date).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--pb-text)" }}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-1.5">
            <input
              type="text"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addNote();
              }}
              placeholder="Adicionar anotação registrada..."
              className="flex-1 rounded-md px-2 py-1.5 text-[12.5px]"
              style={{ background: "var(--pb-surface)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
            />
            <button
              type="button"
              onClick={addNote}
              className="rounded-md px-3 text-xs font-medium"
              style={{ background: "var(--pb-accent)", color: "#fff", border: "none" }}
            >
              Salvar
            </button>
          </div>
        </div>

        {task.history && task.history.length > 0 && (
          <div className="flex flex-col gap-2 pt-3.5" style={{ borderTop: "1px solid var(--pb-border)" }}>
            <label
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}
            >
              Histórico de alterações
            </label>
            <ul className="flex max-h-40 flex-col gap-1.5 overflow-y-auto text-xs">
              {[...task.history].reverse().map((h, i) => (
                <li key={i} className="flex items-baseline gap-2" style={{ color: "var(--pb-text-dim)" }}>
                  <span className="shrink-0 font-mono text-[11px]" style={{ color: "var(--pb-text-muted)" }}>
                    {new Date(h.date).toLocaleDateString("pt-BR")}
                  </span>
                  <span style={{ color: "var(--pb-text)" }}>{h.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="mt-auto self-start text-sm font-medium"
          style={{ color: "#ef4444" }}
        >
          Excluir tarefa
        </button>
      </div>
    </div>
  );
}
