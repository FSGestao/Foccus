"use client";

import { useState } from "react";
import { useProjectsStore } from "@/lib/stores/projects-store";

export function NoteModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: { title?: string; text: string; project_id: string | null; reference_date?: string | null }) => void;
}) {
  const projects = useProjectsStore((s) => s.projects);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [projectId, setProjectId] = useState("");
  const [referenceDate, setReferenceDate] = useState("");

  function submit() {
    if (!text.trim()) return;
    onSubmit({
      title: title.trim() || undefined,
      text: text.trim(),
      project_id: projectId || null,
      reference_date: referenceDate || null,
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
        <h2 className="text-base font-semibold">Nova anotação</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Título (opcional)</label>
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Texto</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Projeto</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          >
            <option value="">Sem projeto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Data de referência (opcional)</label>
          <input
            type="date"
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          />
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
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
