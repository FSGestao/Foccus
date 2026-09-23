import type { Task } from "./types";

// Cronômetro manual (0013_task_timer.sql) — mede o tempo realmente gasto na
// tarefa. Extraído de task-detail-panel.tsx pra ser reusado pelo gadget
// flutuante (timer-gadget.tsx) e pelo badge de tempo na linha da lista
// (task-row.tsx), sem duplicar a lógica de start/stop.

// "Xh MMm" acima de 1h, "MM:SS" abaixo disso (mais preciso pra sessões curtas).
export function formatElapsed(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Soma a sessão em curso a tracked_seconds e limpa timer_started_at.
export function stopTimerPatch(task: Task): Partial<Task> {
  if (!task.timer_started_at) return {};
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(task.timer_started_at).getTime()) / 1000));
  return { tracked_seconds: (task.tracked_seconds ?? 0) + elapsed, timer_started_at: null };
}

// Tempo acumulado "ao vivo": tracked_seconds + o que já passou da sessão em
// curso, se houver uma rodando. `now` vem de fora (setInterval do chamador)
// pra este cálculo continuar puro.
export function liveSeconds(task: Task, now: number): number {
  if (!task.timer_started_at) return task.tracked_seconds ?? 0;
  return (task.tracked_seconds ?? 0) + Math.max(0, Math.floor((now - new Date(task.timer_started_at).getTime()) / 1000));
}
