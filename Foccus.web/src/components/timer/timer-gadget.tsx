"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task, TaskStatus } from "@/lib/tasks/types";
import { PRIORITY_COLOR, STATUS_COLOR, STATUS_ICON, STATUS_LABEL } from "@/lib/tasks/constants";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { sortTasksByPriorityDueProject } from "@/lib/tasks/sort";
import { formatElapsed, liveSeconds as computeLiveSeconds, stopTimerPatch } from "@/lib/tasks/timer";

// Gadget flutuante de cronômetro (pedido do usuário, 2026-09-23) — ligado ao
// mesmo tracked_seconds/timer_started_at do painel de detalhe (task-detail-
// panel.tsx) e do badge de tempo da linha (task-row.tsx: TaskTimeBadge), só
// que visível em qualquer tela, sem precisar abrir a tarefa. Como o schema já
// guarda o cronômetro por tarefa (não um timer global único), várias tarefas
// podem rodar ao mesmo tempo — cada uma com seu próprio botão aqui.

// Ordem dos grupos da lista, a pedido do usuário: A Fazer, depois Em
// andamento, depois Aguardando.
const GROUP_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "WAITING"];

// A partir de quantas tarefas a busca aparece — abaixo disso ela só ocuparia
// espaço numa lista que já cabe inteira na tela.
const SEARCH_THRESHOLD = 6;

const STORAGE_KEY = "foccus:timer-gadget-expanded";

const PRIORITY_DINGBAT: Record<Task["priority"], string> = { P1: "❶", P2: "❷", P3: "❸", P4: "❹" };

function startTimerPatch(task: Task): Partial<Task> {
  const patch: Partial<Task> = { timer_started_at: new Date().toISOString() };
  // "A fazer" ou "Aguardando" viram "Em andamento" ao ligar o cronômetro —
  // mesma regra pros dois status (pedido do usuário: "em andamento e
  // andamento é a mesma coisa" ao confirmar o comportamento de Aguardando).
  if (task.status === "TODO" || task.status === "WAITING") patch.status = "IN_PROGRESS";
  return patch;
}

export function TimerGadget() {
  const tasks = useTasksStore((s) => s.tasks);
  const updateTask = useTasksStore((s) => s.updateTask);
  const projects = useProjectsStore((s) => s.projects);

  // Começa fechado (igual ao server-rendered) e só aplica a preferência salva
  // depois de montado — ler localStorage já no useState quebraria a
  // hidratação (SSR não tem acesso a ele).
  const [expanded, setExpanded] = useState(false);
  const [confirmStopId, setConfirmStopId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com localStorage (sistema externo), só roda uma vez ao montar
      setExpanded(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage indisponível (aba privada etc.) — mantém fechado.
    }
  }, []);

  function toggleExpanded() {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignora — só é uma conveniência de UI, não estado essencial.
      }
      return next;
    });
  }

  const relevantTasks = useMemo(
    () => tasks.filter((t) => GROUP_ORDER.includes(t.status)),
    [tasks],
  );
  const runningTasks = useMemo(() => relevantTasks.filter((t) => t.timer_started_at), [relevantTasks]);

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  // Lista de seleção: tudo que não está rodando, filtrado pela busca e
  // agrupado por status — dentro de cada grupo, a mesma régua "Prioridade >
  // Prazo > Projeto" que o Kanban/Minha Lista já usam (sort.ts).
  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const idle = relevantTasks.filter(
      (t) => !t.timer_started_at && (!term || t.title.toLowerCase().includes(term)),
    );
    return GROUP_ORDER.map((status) => ({
      status,
      tasks: sortTasksByPriorityDueProject(
        idle.filter((t) => t.status === status),
        projects,
      ),
    })).filter((g) => g.tasks.length > 0);
  }, [relevantTasks, projects, search]);

  const idleCount = useMemo(() => relevantTasks.filter((t) => !t.timer_started_at).length, [relevantTasks]);

  useEffect(() => {
    if (runningTasks.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [runningTasks.length]);

  const confirmTask = confirmStopId ? tasks.find((t) => t.id === confirmStopId) : undefined;

  function handleStart(task: Task) {
    updateTask(task.id, startTimerPatch(task));
  }

  function handlePause(task: Task) {
    // Status não muda ao pausar — pedido do usuário: "fica em andamento".
    updateTask(task.id, stopTimerPatch(task));
  }

  function resolveStop(task: Task, completed: boolean) {
    const patch = stopTimerPatch(task);
    if (completed) {
      patch.status = "DONE";
      patch.completed_at = new Date().toISOString();
    }
    updateTask(task.id, patch, completed ? "Tarefa concluída pelo cronômetro" : undefined);
    setConfirmStopId(null);
  }

  const primaryRunning = runningTasks[0];
  const clockLabel = primaryRunning ? formatElapsed(computeLiveSeconds(primaryRunning, now)) : "--:--:--";

  function renderTaskRow(task: Task) {
    const project = task.project_id ? projectById.get(task.project_id) : undefined;
    return (
      <div
        key={task.id}
        className="flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:[background:var(--pb-hover)]"
      >
        <span
          title={`Prioridade ${task.priority}`}
          className="shrink-0 text-[13px] font-semibold leading-none"
          style={{ color: PRIORITY_COLOR[task.priority] }}
        >
          {PRIORITY_DINGBAT[task.priority]}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[13px] leading-snug" title={task.title}>
            {task.title}
          </span>
          {project && (
            <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: project.color }} />
              <span className="truncate">{project.name}</span>
            </span>
          )}
        </div>

        {task.tracked_seconds > 0 && (
          <span
            className="shrink-0 font-mono text-[11px] tabular-nums"
            title="Tempo já registrado"
            style={{ color: "var(--pb-text-dim)" }}
          >
            {formatElapsed(task.tracked_seconds)}
          </span>
        )}

        <button
          type="button"
          onClick={() => handleStart(task)}
          title={task.tracked_seconds > 0 ? "Retomar cronômetro" : "Iniciar cronômetro"}
          className="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold"
          style={{ background: "var(--pb-accent)", color: "#fff", border: "none", cursor: "pointer" }}
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
      {expanded && (
        <div
          className="flex w-[440px] max-w-[calc(100vw-2.5rem)] flex-col rounded-[10px]"
          style={{
            // Fundo sólido (não o vidro translúcido do resto do shell) pelo
            // mesmo motivo do AdminUsersModal: lista densa fica bem mais
            // legível sem o blur por trás do texto.
            background: "var(--pb-surface)",
            border: "1px solid var(--pb-border-hover)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
            color: "var(--pb-text)",
            maxHeight: "min(70vh, 560px)",
          }}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-2 px-3.5 py-3"
            style={{ borderBottom: "1px solid var(--pb-border)" }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold">Cronômetro</span>
              {runningTasks.length > 0 && (
                <span className="text-[11px] font-medium" style={{ color: "var(--pb-accent)" }}>
                  {runningTasks.length} rodando
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={toggleExpanded}
              aria-label="Recolher"
              title="Recolher"
              className="rounded px-1.5 py-0.5 text-sm leading-none"
              style={{ color: "var(--pb-text-dim)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3.5 py-3">
            {runningTasks.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--pb-text-dim)" }}
                >
                  Rodando agora
                </span>
                {runningTasks.map((task) => {
                  const project = task.project_id ? projectById.get(task.project_id) : undefined;
                  return (
                    <div
                      key={task.id}
                      className="flex flex-col gap-2 rounded-md p-2.5"
                      style={{ background: "var(--pb-accent-bg)", border: "1px solid var(--pb-accent)" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-[13px] font-medium" title={task.title}>
                            {task.title}
                          </span>
                          {project && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px]"
                              style={{ color: "var(--pb-text-muted)" }}
                            >
                              <span
                                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: project.color }}
                              />
                              <span className="truncate">{project.name}</span>
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 font-mono text-base font-semibold tabular-nums">
                          {formatElapsed(computeLiveSeconds(task, now))}
                        </span>
                      </div>

                      {confirmStopId === task.id ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
                            A tarefa foi concluída?
                          </span>
                          <button
                            type="button"
                            onClick={() => resolveStop(task, true)}
                            className="rounded px-2.5 py-1 text-xs font-medium"
                            style={{ background: "#10b981", color: "#fff", border: "none", cursor: "pointer" }}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveStop(task, false)}
                            className="rounded px-2.5 py-1 text-xs font-medium"
                            style={{
                              background: "var(--pb-surface)",
                              color: "var(--pb-text)",
                              border: "1px solid var(--pb-border)",
                              cursor: "pointer",
                            }}
                          >
                            Não
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmStopId(null)}
                            className="text-xs"
                            style={{
                              background: "transparent",
                              color: "var(--pb-text-dim)",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePause(task)}
                            title="Pausar (mantém o status e o tempo já contado)"
                            className="rounded px-2.5 py-1 text-xs font-medium"
                            style={{
                              background: "var(--pb-surface)",
                              color: "var(--pb-text)",
                              border: "1px solid var(--pb-border)",
                              cursor: "pointer",
                            }}
                          >
                            ⏸ Pausar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmStopId(task.id)}
                            title="Parar e registrar se a tarefa foi concluída"
                            className="rounded px-2.5 py-1 text-xs font-medium"
                            style={{
                              background: "var(--pb-surface)",
                              color: "var(--pb-red)",
                              border: "1px solid var(--pb-border)",
                              cursor: "pointer",
                            }}
                          >
                            ⏹ Parar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--pb-text-dim)" }}
                >
                  Selecionar tarefa
                </span>
                {idleCount > 0 && (
                  <span className="text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
                    {idleCount} {idleCount === 1 ? "tarefa" : "tarefas"}
                  </span>
                )}
              </div>

              {idleCount > SEARCH_THRESHOLD && (
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar tarefa..."
                  className="w-full rounded-md px-2.5 py-1.5 text-[13px]"
                  style={{
                    background: "var(--pb-bg)",
                    border: "1px solid var(--pb-border)",
                    color: "var(--pb-text)",
                  }}
                />
              )}

              {groups.length === 0 ? (
                <span className="py-2 text-xs" style={{ color: "var(--pb-text-muted)" }}>
                  {search.trim()
                    ? "Nenhuma tarefa encontrada com esse termo."
                    : "Nenhuma tarefa em A Fazer, Em andamento ou Aguardando."}
                </span>
              ) : (
                groups.map((group) => (
                  <div key={group.status} className="flex flex-col">
                    <div
                      className="sticky top-0 flex items-center gap-1.5 py-1.5 text-[11px] font-semibold"
                      style={{ background: "var(--pb-surface)", color: STATUS_COLOR[group.status] }}
                    >
                      <span>{STATUS_ICON[group.status]}</span>
                      <span>{STATUS_LABEL[group.status]}</span>
                      <span style={{ color: "var(--pb-text-dim)" }}>({group.tasks.length})</span>
                    </div>
                    {group.tasks.map(renderTaskRow)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleExpanded}
        title="Cronômetro de tarefas"
        className="flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-sm font-semibold tabular-nums"
        style={{
          cursor: "pointer",
          background: "var(--pb-glass-strong)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          border: `1px solid ${primaryRunning ? "var(--pb-accent)" : "var(--pb-border-hover)"}`,
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          color: primaryRunning ? "var(--pb-accent)" : "var(--pb-text)",
        }}
      >
        {primaryRunning && <span aria-hidden style={{ color: "var(--pb-accent)" }}>●</span>}
        {clockLabel}
        {runningTasks.length > 1 && (
          <span className="text-[11px] font-semibold" style={{ color: "var(--pb-text-dim)" }}>
            +{runningTasks.length - 1}
          </span>
        )}
      </button>

      {!expanded && confirmTask && (
        <div
          className="flex w-72 flex-col gap-2 rounded-md p-3 text-sm"
          style={{
            background: "var(--pb-surface)",
            border: "1px solid var(--pb-border-hover)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            color: "var(--pb-text)",
          }}
        >
          <span>
            A tarefa <strong>{confirmTask.title}</strong> foi concluída?
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => resolveStop(confirmTask, true)}
              className="flex-1 rounded px-2 py-1.5 text-xs font-medium"
              style={{ background: "#10b981", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => resolveStop(confirmTask, false)}
              className="flex-1 rounded px-2 py-1.5 text-xs font-medium"
              style={{
                background: "transparent",
                color: "var(--pb-text)",
                border: "1px solid var(--pb-border)",
                cursor: "pointer",
              }}
            >
              Não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
