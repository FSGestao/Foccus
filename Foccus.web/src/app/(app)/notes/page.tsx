"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/lib/stores/notes-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { computeNoteGroups } from "@/lib/notes/compute";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const fieldStyle = {
  background: "var(--pb-bg)",
  border: "1px solid var(--pb-border)",
  color: "var(--pb-text)",
} as const;

// Anotações (Foccus.dc.html:997-1084) — anotações manuais de projeto +
// anotações registradas dentro das tarefas (task.comments, mesmo dado usado
// no painel de detalhe — ver src/lib/notes/compute.ts), agrupadas por
// projeto.
export default function NotesPage() {
  const { notes, loading, error, init, createNote, deleteNote } = useNotesStore();
  const { projects, init: initProjects } = useProjectsStore();
  const tasks = useTasksStore((s) => s.tasks);
  const openTask = useTasksStore((s) => s.openTask);
  const router = useRouter();

  const [projectFilter, setProjectFilter] = useState("all");
  const [draftProjectId, setDraftProjectId] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftText, setDraftText] = useState("");
  const [draftRecordedAt, setDraftRecordedAt] = useState(todayISO());
  const [draftReferenceDate, setDraftReferenceDate] = useState("");

  useEffect(() => {
    init();
    initProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sem efeito pra sincronizar: só cai no primeiro projeto como valor padrão
  // enquanto o usuário não escolheu nenhum (draftProjectId ainda vazio).
  const effectiveDraftProjectId = draftProjectId || projects[0]?.id || "";

  const groups = useMemo(
    () => computeNoteGroups(notes, tasks, projects, projectFilter),
    [notes, tasks, projects, projectFilter],
  );

  function handleDelete(id: string) {
    if (window.confirm("Excluir esta anotação?")) deleteNote(id);
  }

  function handleOpenTask(taskId: string) {
    openTask(taskId);
    router.push("/");
  }

  function handleAddNote() {
    const title = draftTitle.trim();
    const text = draftText.trim();
    if (!effectiveDraftProjectId || !title || !text) return;
    createNote({
      project_id: effectiveDraftProjectId,
      title,
      text,
      recorded_at: draftRecordedAt || undefined,
      reference_date: draftReferenceDate || null,
    });
    setDraftTitle("");
    setDraftText("");
    setDraftRecordedAt(todayISO());
    setDraftReferenceDate("");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
            Anotações
          </h1>
          <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--pb-text-muted)" }}>
            Registro de andamento por projeto, mesmo quando não vira tarefa. Anotações registradas
            dentro das tarefas também aparecem aqui automaticamente.
          </div>
        </div>
        <div>
          <label
            className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--pb-text-dim)" }}
          >
            Consultar projeto
          </label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            title="Filtrar Anotações por Projeto"
            className="min-w-[240px] rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold"
            style={{
              background: "var(--pb-glass)",
              backdropFilter: "blur(10px) saturate(150%)",
              WebkitBackdropFilter: "blur(10px) saturate(150%)",
              border: "1px solid var(--pb-border)",
              color: "var(--pb-text)",
            }}
          >
            <option value="all">Todos os projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="mb-5 rounded-lg p-3.5"
        style={{
          background: "var(--pb-glass-card)",
          border: "1px solid var(--pb-border-hover)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div
          className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--pb-text-dim)" }}
        >
          Nova anotação do projeto
        </div>
        <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select
            value={effectiveDraftProjectId}
            onChange={(e) => setDraftProjectId(e.target.value)}
            title="Projeto da anotação"
            className="rounded-[5px] px-2 py-1.5 text-[12.5px]"
            style={fieldStyle}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Título da anotação"
            title="Título da anotação"
            className="rounded-[5px] px-2 py-1.5 text-[12.5px]"
            style={fieldStyle}
          />
          <div>
            <label className="mb-0.5 block text-[9.5px]" style={{ color: "var(--pb-text-dim)" }}>
              Data do registro
            </label>
            <input
              type="date"
              value={draftRecordedAt}
              onChange={(e) => setDraftRecordedAt(e.target.value)}
              title="Data em que a anotação foi registrada"
              className="w-full rounded-[5px] px-1.5 py-1 text-[11.5px]"
              style={fieldStyle}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[9.5px]" style={{ color: "var(--pb-text-dim)" }}>
              Data referência
            </label>
            <input
              type="date"
              value={draftReferenceDate}
              onChange={(e) => setDraftReferenceDate(e.target.value)}
              title="Data à qual o conteúdo da anotação se refere (opcional)"
              className="w-full rounded-[5px] px-1.5 py-1 text-[11.5px]"
              style={fieldStyle}
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Descrição da anotação..."
            title="Descrição da anotação"
            className="min-h-[62px] flex-1 resize-y rounded-[5px] p-2 text-[12.5px]"
            style={fieldStyle}
          />
          <button
            type="button"
            onClick={handleAddNote}
            title="Adicionar anotação"
            className="h-[34px] shrink-0 rounded-[5px] px-3.5 text-[12.5px] font-medium text-white"
            style={{ background: "var(--pb-accent)" }}
          >
            Adicionar anotação
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 text-sm" style={{ color: "var(--pb-red)" }}>
          {error}
        </p>
      )}
      {loading && (
        <p className="mb-3 text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Carregando...
        </p>
      )}

      {groups.map((group) => (
        <div key={group.projectId || "inbox"}>
          <div className="my-4 flex items-center gap-2">
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{ background: group.color }}
            />
            <span
              className="text-[11.5px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--pb-text-dim)" }}
            >
              {group.projectName}
            </span>
            <span className="text-[10.5px]" style={{ color: "var(--pb-text-dim)" }}>
              ({group.count})
            </span>
            <div className="h-px flex-1" style={{ background: "var(--pb-border)" }} />
          </div>

          <div className="flex flex-col gap-2">
            {group.notes.map((note) => (
              <div
                key={note.id}
                className="rounded-[7px] p-3.5"
                style={{
                  background: "var(--pb-glass-card)",
                  border: "1px solid var(--pb-border-hover)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  color: "var(--pb-text)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[13.5px] font-semibold">{note.title}</span>
                      <span
                        title="Origem da anotação"
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={
                          note.isTaskNote
                            ? { color: "#a855f7", background: "rgba(168,85,247,0.1)" }
                            : { color: "var(--pb-accent)", background: "var(--pb-accent-bg)" }
                        }
                      >
                        {note.sourceLabel}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
                      Registrado em <strong style={{ color: "var(--pb-text-muted)" }}>{note.registeredLabel}</strong>
                      {note.hasReferenceDate && (
                        <>
                          {" "}
                          · Referência: <strong style={{ color: "var(--pb-text-muted)" }}>{note.referenceLabel}</strong>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {note.isTaskNote && note.taskId && (
                      <button
                        type="button"
                        onClick={() => handleOpenTask(note.taskId!)}
                        title="Abrir a tarefa vinculada"
                        className="text-[11.5px] font-medium"
                        style={{ color: "var(--pb-accent)" }}
                      >
                        Abrir tarefa →
                      </button>
                    )}
                    {note.canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        title="Excluir esta anotação"
                        className="text-[11.5px]"
                        style={{ color: "#ef4444" }}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: "var(--pb-text-muted)" }}>
                  {note.text}
                </div>
                {note.isTaskNote && (
                  <div className="mt-1.5 text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
                    Atividade: {note.taskTitle}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {!loading && groups.length === 0 && (
        <div
          className="rounded-lg py-9 text-center text-[13.5px]"
          style={{
            background: "var(--pb-glass-card)",
            border: "1px solid var(--pb-border-hover)",
            color: "var(--pb-text-muted)",
          }}
        >
          Nenhuma anotação encontrada para este filtro.
        </div>
      )}
    </div>
  );
}
