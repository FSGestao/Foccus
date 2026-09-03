"use client";

import { useRouter } from "next/navigation";
import { useSearchStore } from "@/lib/stores/search-store";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { usePeopleStore } from "@/lib/stores/people-store";

// Busca simples (Foccus.dc.html: isSearching/matchesSearch) — sobrepõe o
// header enquanto a query não está vazia. Tarefa: busca em título/descrição;
// clicar abre o painel de detalhe (que só existe nas páginas que o renderizam
// — por isso navega pra "/" antes de abrir).
export function SearchOverlay() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const router = useRouter();

  const tasks = useTasksStore((s) => s.tasks);
  const openTask = useTasksStore((s) => s.openTask);
  const projects = useProjectsStore((s) => s.projects);
  const people = usePeopleStore((s) => s.people);

  if (!query.trim()) return null;

  const q = query.trim().toLowerCase();
  const matchingTasks = tasks
    .filter(
      (t) =>
        t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q),
    )
    .slice(0, 8);
  const matchingProjects = projects.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
  const matchingPeople = people.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);

  const nothing = matchingTasks.length === 0 && matchingProjects.length === 0 && matchingPeople.length === 0;

  function close() {
    setQuery("");
  }

  function openTaskResult(id: string) {
    openTask(id);
    router.push("/");
    close();
  }

  return (
    <div
      className="absolute left-0 right-0 top-full z-30 mx-auto max-w-[440px] rounded-b-md p-3 text-sm"
      style={{
        background: "var(--pb-glass-strong)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        border: "1px solid var(--pb-border)",
        borderTop: "none",
        boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
        color: "var(--pb-text)",
      }}
    >
      {nothing && <p style={{ color: "var(--pb-text-muted)" }}>Nada encontrado para &quot;{query}&quot;.</p>}

      {matchingTasks.length > 0 && (
        <div className="mb-2 flex flex-col gap-1">
          <span className="text-xs font-semibold" style={{ color: "var(--pb-text-dim)" }}>
            Tarefas
          </span>
          {matchingTasks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => openTaskResult(t.id)}
              className="truncate rounded px-2 py-1 text-left"
              style={{ background: "var(--pb-surface-subtle)" }}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      {matchingProjects.length > 0 && (
        <div className="mb-2 flex flex-col gap-1">
          <span className="text-xs font-semibold" style={{ color: "var(--pb-text-dim)" }}>
            Projetos
          </span>
          {matchingProjects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                router.push("/projects");
                close();
              }}
              className="truncate rounded px-2 py-1 text-left"
              style={{ background: "var(--pb-surface-subtle)" }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {matchingPeople.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold" style={{ color: "var(--pb-text-dim)" }}>
            Pessoas
          </span>
          {matchingPeople.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                router.push("/people");
                close();
              }}
              className="truncate rounded px-2 py-1 text-left"
              style={{ background: "var(--pb-surface-subtle)" }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
