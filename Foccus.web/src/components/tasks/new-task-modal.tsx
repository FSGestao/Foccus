"use client";

import { useEffect, useState } from "react";
import { PRIORITY_OPTIONS } from "@/lib/tasks/constants";
import type { Priority } from "@/lib/tasks/types";
import { useProjectsStore } from "@/lib/stores/projects-store";

export function NewTaskModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (title: string, priority: Priority, projectId: string | null) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("P3");
  const [projectId, setProjectId] = useState<string>("");
  const projects = useProjectsStore((s) => s.projects);
  const initProjects = useProjectsStore((s) => s.init);

  useEffect(() => {
    // Idempotente o suficiente pra chamar de novo aqui — se a store já tiver
    // sido inicializada (ex.: usuário já visitou /projects), só refaz o fetch.
    initProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed, priority, projectId || null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-[10px] p-6"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
          color: "var(--pb-text)",
        }}
      >
        <h2 className="text-base font-semibold">Nova tarefa</h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-task-title" className="text-sm font-medium">
            Título
          </label>
          <input
            id="new-task-title"
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") onClose();
            }}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-task-priority" className="text-sm font-medium">
            Prioridade
          </label>
          <select
            id="new-task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-task-project" className="text-sm font-medium">
            Projeto
          </label>
          <select
            id="new-task-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          >
            <option value="">Inbox (sem projeto)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-sm px-3 py-2">
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-md px-3 py-2 text-sm font-medium"
            style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
          >
            Criar tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
