import type { Task } from "./types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// atrasada > hoje > tem data > sem data — mesma régua do `sortTasks` legado
// (Foccus.dc.html:2600-2620).
function urgencyRank(task: Task, today: string): number {
  if (!task.due_date) return 3;
  if (task.due_date < today) return 0;
  if (task.due_date === today) return 1;
  return 2;
}

// Não concluídas primeiro (por urgência de data, depois prioridade — 'P1' <
// 'P4' já ordena certo como string). Concluídas/canceladas por último, mais
// recente primeiro.
export function sortTasks(tasks: Task[]): Task[] {
  const today = todayISO();
  const pending = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");
  const done = tasks.filter((t) => t.status === "DONE" || t.status === "CANCELLED");

  pending.sort((a, b) => {
    const rankDiff = urgencyRank(a, today) - urgencyRank(b, today);
    if (rankDiff !== 0) return rankDiff;
    return a.priority.localeCompare(b.priority);
  });

  done.sort((a, b) => {
    const aDate = a.completed_at ?? a.updated_at;
    const bDate = b.completed_at ?? b.updated_at;
    return bDate.localeCompare(aDate);
  });

  return [...pending, ...done];
}

export function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "DONE" || task.status === "CANCELLED") return false;
  return task.due_date < todayISO();
}

export function isDueToday(task: Task): boolean {
  return task.due_date === todayISO();
}
