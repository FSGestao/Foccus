"use client";

import { useState } from "react";
import { PRIORITY_OPTIONS } from "@/lib/tasks/constants";
import type { Priority } from "@/lib/tasks/types";
import { PROJECT_COLOR_SWATCHES, PROJECT_STATUS_OPTIONS } from "@/lib/projects/constants";
import type { Project, ProjectStatus } from "@/lib/projects/types";

// Um modal só pra criar e editar (evita duplicar o formulário) — em modo
// edição recebe `project` e mostra também Status/Prazo, que só fazem sentido
// depois que o projeto já existe.
export function ProjectModal({
  project,
  onClose,
  onSubmit,
  onDelete,
}: {
  project?: Project;
  onClose: () => void;
  onSubmit: (patch: {
    name: string;
    color: string;
    priority: Priority;
    status?: ProjectStatus;
    due_date?: string | null;
  }) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(project?.color ?? PROJECT_COLOR_SWATCHES[0]);
  const [priority, setPriority] = useState<Priority>(project?.priority ?? "P3");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "ACTIVE");
  const [dueDate, setDueDate] = useState(project?.due_date ?? "");

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({
      name: trimmed,
      color,
      priority,
      ...(project ? { status, due_date: dueDate || null } : {}),
    });
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
        <h2 className="text-base font-semibold">{project ? "Editar projeto" : "Novo projeto"}</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Nome</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") onClose();
            }}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Cor</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                title={c}
                className="h-6 w-6 rounded-full"
                style={{
                  background: c,
                  outline: color === c ? "2px solid var(--pb-text)" : "1px solid var(--pb-border)",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Prioridade</label>
          <select
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

        {project && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="rounded-md px-3 py-2 text-sm"
                style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
              >
                {PROJECT_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Prazo</label>
              <input
                type="date"
                value={dueDate ?? ""}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-md px-3 py-2 text-sm"
                style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          {project && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm px-3 py-2"
              style={{ color: "var(--pb-red)" }}
            >
              Excluir projeto
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="text-sm px-3 py-2">
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-md px-3 py-2 text-sm font-medium"
              style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
            >
              {project ? "Salvar" : "Criar projeto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
