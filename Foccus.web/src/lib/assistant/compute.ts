// "Assistente Inteligente" — fórmulas portadas de Foccus.dc.html:2976-3002
// (renderVals: emProgressoCount, gargaloBreach, quickWinCandidates,
// progressPct) e :1968-1995 (checkFechamentoTrigger, checkQuickWinTrigger).
// Só a matemática pura mora aqui — persistência e disparo ficam no
// profile-store e no AppShell.

import type { Task } from "@/lib/tasks/types";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOpenTask(t: Task): boolean {
  return t.status !== "CANCELLED" && t.status !== "DONE";
}

// "Em Progresso" no sentido do Assistente = tudo que não é Futura (TODO) nem
// Concluída/Cancelada — mesma definição usada no Kanban do Dashboard.
export function computeEmProgressoCount(tasks: Task[]): number {
  return tasks.filter((t) => isOpenTask(t) && t.status !== "TODO").length;
}

export function computeGargaloBreach(
  tasks: Task[],
  ativo: boolean,
  limite: number,
): { count: number; breach: boolean } {
  const count = computeEmProgressoCount(tasks);
  return { count, breach: ativo && count > limite };
}

export type QuickWinCandidate = { id: string; title: string };

// Candidatas a "vitória rápida": TODO com estimativa <= 15min ou Prioridade
// Baixa (P4) — sem tag "Rápido" porque a UI ainda não tem edição de tags.
export function computeQuickWinCandidates(tasks: Task[]): QuickWinCandidate[] {
  const isQuickCandidate = (t: Task) => (t.estimated_minutes != null && t.estimated_minutes <= 15) || t.priority === "P4";
  return tasks
    .filter((t) => t.status === "TODO" && isQuickCandidate(t))
    .sort(
      (a, b) =>
        (a.estimated_minutes ? 0 : 1) - (b.estimated_minutes ? 0 : 1) ||
        (a.estimated_minutes ?? 999) - (b.estimated_minutes ?? 999),
    )
    .slice(0, 3)
    .map((t) => ({ id: t.id, title: t.title }));
}

export function computeDoneTasksToday(tasks: Task[]): number {
  const today = todayISO();
  return tasks.filter((t) => t.status === "DONE" && t.completed_at?.slice(0, 10) === today).length;
}

// Eficiência diária: % das tarefas com prazo/follow-up hoje (ou concluídas
// hoje) que já foram concluídas.
export function computeDailyEfficiency(tasks: Task[]): { doneTasks: number; totalTasks: number; progressPct: number } {
  const today = todayISO();
  const dueToday = tasks.filter(
    (t) =>
      t.status !== "CANCELLED" &&
      (t.due_date === today || t.follow_up_date === today || t.completed_at?.slice(0, 10) === today),
  );
  const totalTasks = dueToday.length;
  const doneTasks = dueToday.filter((t) => t.status === "DONE" && t.completed_at?.slice(0, 10) === today).length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  return { doneTasks, totalTasks, progressPct };
}

// Ritual de Fechamento: dispara depois do horário configurado, uma vez por
// dia, só quando nenhum modal já está aberto. Consecutivo (dia anterior)
// soma ao "Nível de Foco"; senão reinicia a sequência em 1.
export function shouldTriggerFechamento(params: {
  ativo: boolean;
  fechamentoShownDate: string | null;
  fechamentoHora: string;
  anyModalOpen: boolean;
  now?: Date;
}): boolean {
  const { ativo, fechamentoShownDate, fechamentoHora, anyModalOpen, now = new Date() } = params;
  if (!ativo) return false;
  if (fechamentoShownDate === todayISO()) return false;
  if (anyModalOpen) return false;
  const nowHHMM = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  return nowHHMM >= (fechamentoHora || "17:30");
}

function addDaysStr(base: string, days: number): string {
  const [y, m, d] = base.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ry = date.getFullYear();
  const rm = String(date.getMonth() + 1).padStart(2, "0");
  const rd = String(date.getDate()).padStart(2, "0");
  return `${ry}-${rm}-${rd}`;
}

export function nextFechamentoStreak(fechamentoLastDate: string | null, currentStreak: number): number {
  const isConsecutive = fechamentoLastDate === addDaysStr(todayISO(), -1);
  return isConsecutive ? (currentStreak || 0) + 1 : 1;
}

// Vitórias Rápidas: sugere depois de 4h sem nenhuma edição de tarefa.
export const QUICK_WIN_IDLE_MS = 4 * 60 * 60 * 1000;
