// Utilidades de data + agrupamento de tarefas por dia pra tela de Calendário
// (Mês/Semana/Agenda). Datas em string ISO "YYYY-MM-DD" o tempo todo (mesmo
// padrão de due_date/follow_up_date no banco) — sem Date pra ida e volta,
// exceto internamente aqui pra fazer aritmética de calendário (soma de dias/
// meses, dia da semana), sempre com hora local (nunca .toISOString(), que é
// UTC — mesmo cuidado de lib/assistant/compute.ts).

import type { Task } from "@/lib/tasks/types";
import { relevantDateFor } from "@/lib/tasks/list-filters";

export type CalendarViewMode = "month" | "week" | "agenda";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function addMonths(iso: string, months: number): string {
  const d = parseISO(iso);
  d.setMonth(d.getMonth() + months, 1);
  return toISO(d);
}

export function isWeekend(iso: string): boolean {
  const dow = parseISO(iso).getDay();
  return dow === 0 || dow === 6;
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function weekdayLabels(showWeekends: boolean): string[] {
  return showWeekends ? WEEKDAY_LABELS : WEEKDAY_LABELS.slice(1, 6);
}

export function monthYearLabel(iso: string): string {
  const d = parseISO(iso);
  return `${MONTH_LABELS[d.getMonth()]} de ${d.getFullYear()}`;
}

export function dayNumberLabel(iso: string): string {
  return String(Number(iso.split("-")[2]));
}

export function dateFullLabel(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAY_LABELS[d.getDay()]}, ${Number(iso.split("-")[2])} de ${MONTH_LABELS[d.getMonth()]}`;
}

export function weekRangeLabel(weekDays: string[]): string {
  if (!weekDays.length) return "";
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];
  const sameMonth = isSameMonth(first, last);
  const firstLabel = sameMonth ? dayNumberLabel(first) : `${dayNumberLabel(first)} ${monthYearLabel(first).split(" de ")[0].slice(0, 3)}`;
  return `${firstLabel} – ${dayNumberLabel(last)} de ${monthYearLabel(last)}`;
}

export function startOfWeek(iso: string): string {
  return addDays(iso, -parseISO(iso).getDay());
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function daysInMonth(monthStartIso: string): number {
  const [y, m] = monthStartIso.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

// Grade do mês em semanas completas (dom-sáb), começando na semana que
// contém o dia 1 e indo até a semana que contém o último dia do mês —
// mesmo comportamento do Google Agenda/Outlook em vista de mês.
export function buildMonthGrid(anchorIso: string): string[][] {
  const monthStart = startOfMonth(anchorIso);
  const monthEnd = `${monthStart.slice(0, 8)}${pad(daysInMonth(monthStart))}`;
  const gridStart = startOfWeek(monthStart);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);

  const weeks: string[][] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function buildWeekDays(anchorIso: string): string[] {
  const start = startOfWeek(anchorIso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Todos os dias do mês de `anchorIso`, em ordem — base da Agenda (que depois
// filtra pra só os dias com tarefa).
export function buildMonthDays(anchorIso: string): string[] {
  const monthStart = startOfMonth(anchorIso);
  const total = daysInMonth(monthStart);
  return Array.from({ length: total }, (_, i) => addDays(monthStart, i));
}

// Tarefa entra no calendário pela "data relevante" (due_date, ou
// follow_up_date quando Aguardando — mesma regra do Kanban/Lista por Prazo
// em lib/tasks/list-filters.ts). Tarefa sem nenhuma das duas não aparece —
// um calendário não tem onde colocar algo sem data.
export function tasksByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    const date = relevantDateFor(t);
    if (!date) continue;
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(t);
  }
  return map;
}
