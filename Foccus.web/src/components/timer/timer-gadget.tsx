"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task, TaskStatus } from "@/lib/tasks/types";
import { STATUS_ICON, STATUS_LABEL } from "@/lib/tasks/constants";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { formatElapsed, liveSeconds as computeLiveSeconds, stopTimerPatch } from "@/lib/tasks/timer";

// Gadget flutuante de cronômetro (pedido do usuário, 2026-09-23) — ligado ao
// mesmo tracked_seconds/timer_started_at do painel de detalhe (task-detail-
// panel.tsx) e do badge de tempo da linha (task-row.tsx: TaskTimeBadge), só
// que visível em qualquer tela, sem precisar abrir a tarefa. Como o schema já
// guarda o cronômetro por tarefa (não um timer global único), várias tarefas
// podem rodar ao mesmo tempo — cada uma com seu próprio botão aqui.
const SELECTABLE_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "WAITING"];

const STORAGE_KEY = "foccus:timer-gadget-expanded";

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

  // Começa fechado (igual ao server-rendered) e só aplica a preferência salva
  // depois de montado — ler localStorage já no useState quebraria a
  // hidratação (SSR não tem acesso a ele).
  const [expanded, setExpanded] = useState(false);
  const [confirmStopId, setConfirmStopId] = useState<string | null>(null);
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
    () => tasks.filter((t) => SELECTABLE_STATUSES.includes(t.status)),
    [tasks],
  );
  const runningTasks = useMemo(() => relevantTasks.filter((t) => t.timer_started_at), [relevantTasks]);
  const idleTasks = useMemo(() => relevantTasks.filter((t) => !t.timer_started_at), [relevantTasks]);

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

  function handleStopClick(task: Task) {
    setConfirmStopId(task.id);
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

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
      {expanded && (
        <div
          className="flex w-80 max-w-[calc(100vw-2.5rem)] flex-col gap-3 rounded-[10px] p-3.5"
          style={{
            background: "var(--pb-glass-strong)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
            border: "1px solid var(--pb-border-hover)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
            color: "var(--pb-text)",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Cronômetro</span>
            <button
              type="button"
              onClick={toggleExpanded}
              aria-label="Recolher"
              title="Recolher"
              className="rounded px-1.5 py-0.5 text-sm leading-none"
              style={{ color: "var(--pb-text-dim)", background: "transparent", border: "none" }}
            >
              ✕
            </button>
          </div>

          {runningTasks.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
                Rodando agora
              </span>
              {runningTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-1.5 rounded-md p-2"
                  style={{ background: "var(--pb-accent-bg)", border: "1px solid var(--pb-accent)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1 truncate text-[13px] font-medium">{task.title}</span>
                    <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums">
                      {formatElapsed(computeLiveSeconds(task, now))}
                    </span>
                  </div>
                  {confirmStopId === task.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
                        Concluída?
                      </span>
                      <button
                        type="button"
                        onClick={() => resolveStop(task, true)}
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{ background: "#10b981", color: "#fff", border: "none" }}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveStop(task, false)}
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{ background: "transparent", color: "var(--pb-text)", border: "1px solid var(--pb-border)" }}
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePause(task)}
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{ background: "transparent", color: "var(--pb-text)", border: "1px solid var(--pb-border)" }}
                      >
                        ⏸ Pausar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStopClick(task)}
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{ background: "transparent", color: "var(--pb-red)", border: "1px solid var(--pb-border)" }}
                      >
                        ⏹ Parar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
              Selecionar tarefa
            </span>
            {idleTasks.length === 0 ? (
              <span className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
                Nenhuma tarefa em A Fazer, Em andamento ou Aguardando.
              </span>
            ) : (
              <div className="flex flex-col gap-1">
                {idleTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 rounded-md px-1.5 py-1" style={{ borderBottom: "1px solid var(--pb-border)" }}>
                    <span title={STATUS_LABEL[task.status]} className="shrink-0 text-xs" style={{ color: "var(--pb-text-dim)" }}>
                      {STATUS_ICON[task.status]}
                    </span>
                    <span className="flex-1 truncate text-[13px]">{task.title}</span>
                    {task.tracked_seconds > 0 && (
                      <span className="shrink-0 font-mono text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
                        {formatElapsed(task.tracked_seconds)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStart(task)}
                      title={task.tracked_seconds > 0 ? "Retomar" : "Iniciar"}
                      className="shrink-0 rounded px-2 py-1 text-xs font-medium"
                      style={{ background: "var(--pb-accent)", color: "#fff", border: "none" }}
                    >
                      ▶
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            background: "var(--pb-glass-strong)",
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
              style={{ background: "#10b981", color: "#fff", border: "none" }}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => resolveStop(confirmTask, false)}
              className="flex-1 rounded px-2 py-1.5 text-xs font-medium"
              style={{ background: "transparent", color: "var(--pb-text)", border: "1px solid var(--pb-border)" }}
            >
              Não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
