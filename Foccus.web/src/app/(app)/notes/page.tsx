"use client";

import { useEffect, useMemo, useState } from "react";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { NoteModal } from "@/components/notes/note-modal";

// Anotações (Foccus.dc.html: viewNotes) — lista agrupada por projeto, desde a
// v2.1.0 do legado.
export default function NotesPage() {
  const { notes, loading, error, init, createNote, deleteNote } = useNotesStore();
  const { projects, init: initProjects } = useProjectsStore();
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    init();
    initProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => {
    const byProject = new Map<string, typeof notes>();
    for (const note of notes) {
      const key = note.project_id ?? "none";
      byProject.set(key, [...(byProject.get(key) ?? []), note]);
    }
    return Array.from(byProject.entries()).map(([projectId, list]) => ({
      projectId,
      label: projectId === "none" ? "Sem projeto" : projects.find((p) => p.id === projectId)?.name ?? "—",
      notes: list,
    }));
  }, [notes, projects]);

  function handleDelete(id: string) {
    if (window.confirm("Excluir esta anotação?")) deleteNote(id);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
          Anotações
        </h1>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
        >
          + Nova anotação
        </button>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--pb-red)" }}>
          {error}
        </p>
      )}
      {loading && (
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Carregando...
        </p>
      )}
      {!loading && notes.length === 0 && (
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Nenhuma anotação ainda.
        </p>
      )}

      {groups.map((group) => (
        <div key={group.projectId} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--pb-text-muted)" }}>
            {group.label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.notes.map((note) => (
              <div
                key={note.id}
                className="flex flex-col gap-1 rounded-lg p-3 text-sm"
                style={{ background: "var(--pb-glass-card)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">
                    {note.title || new Date(note.recorded_at).toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="shrink-0 text-xs"
                    style={{ color: "var(--pb-red)" }}
                  >
                    excluir
                  </button>
                </div>
                <p style={{ color: "var(--pb-text-muted)" }}>{note.text}</p>
                <span className="text-xs" style={{ color: "var(--pb-text-dim)" }}>
                  registrado em {new Date(note.recorded_at).toLocaleDateString("pt-BR")}
                  {note.reference_date && ` · referente a ${note.reference_date}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showNewModal && (
        <NoteModal onClose={() => setShowNewModal(false)} onSubmit={(input) => createNote(input)} />
      )}
    </div>
  );
}
