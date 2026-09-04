// Estatísticas de um projeto pro card da grade (Foccus.dc.html:3150-3172:
// projectProgressPct + projectRows) — % de andamento, tarefas abertas e
// atrasadas, calculadas a partir das tarefas do projeto.

import type { Task } from "@/lib/tasks/types";
import { relevantDateFor, isOverdueDate } from "@/lib/tasks/list-filters";

function taskProgressWeight(t: Task): number {
  return t.status === "DONE" ? 100 : (t.progress_pct ?? 0);
}

export function computeProjectStats(projectId: string, tasks: Task[]) {
  const pTasks = tasks.filter((t) => t.project_id === projectId && t.status !== "CANCELLED");
  const open = pTasks.filter((t) => t.status !== "DONE" && t.status !== "INBOX");
  const overdue = open.filter((t) => isOverdueDate(t, relevantDateFor(t)));

  const progressPct = pTasks.length
    ? pTasks.reduce((acc, t) => acc + taskProgressWeight(t), 0) / pTasks.length
    : 0;

  return {
    openCount: open.length,
    overdueCount: overdue.length,
    hasOverdue: overdue.length > 0,
    progressPct,
    progressLabel: Math.round(progressPct),
  };
}
