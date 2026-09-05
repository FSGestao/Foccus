// Filtros/agrupamento da Minha Lista — porta de Foccus.dc.html:2496-2512
// (isOverdue, dateLabelFor) e :3038-3125 (quickFilters, groupBy, summaryStats).
// Fica num arquivo à parte de sort.ts porque usa a "data relevante" da tarefa
// (follow_up_date quando Aguardando, due_date nos demais casos) — diferente
// do isOverdue(task) simples de sort.ts, que só olha due_date (usado na
// ordenação, que nunca prioriza por follow_up_date).

import type { Task } from "./types";

// Data local, não UTC — ver mesma correção em lib/assistant/compute.ts.
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function relevantDateFor(task: Task): string | null {
  return task.status === "WAITING" ? task.follow_up_date : task.due_date;
}

export function isOverdueDate(task: Task, dateStr: string | null): boolean {
  return !!dateStr && dateStr < todayISO() && task.status !== "DONE" && task.status !== "CANCELLED";
}

export function fmtDateShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function dateLabelFor(task: Task, dateStr: string | null): string {
  if (!dateStr) return "";
  if (isOverdueDate(task, dateStr)) return fmtDateShort(dateStr);
  if (dateStr === todayISO()) return "Hoje";
  if (dateStr === tomorrowISO()) return "Amanhã";
  return fmtDateShort(dateStr);
}
