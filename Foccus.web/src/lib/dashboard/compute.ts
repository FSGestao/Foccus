// Fórmulas do "Painel do Projeto" portadas de Foccus.dc.html:2654-2970
// (computeDashboardForecast, buildDashboardKanban/Gantt/Burndown,
// computeDashboardStreak, buildDashboardOverview) — mesma matemática, só
// adaptada dos shapes camelCase do legado pros snake_case do Supabase.

import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";
import { PRIORITY_COLOR } from "@/lib/tasks/constants";

// Data local (nunca UTC) — .toISOString() usa UTC, então da meia-noite até o
// fuso "voltar" pro dia anterior (ex.: 21h-23h59 no Brasil, UTC-3) ele já
// aponta pro dia seguinte. Isso fazia tarefas concluídas à noite sumirem das
// contagens de "hoje" (streak do dashboard, Ritual de Fechamento etc.).
function todayISO(): string {
  return localDateISO(new Date());
}

function localDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// completed_at é timestamp completo (gravado com `new Date().toISOString()`,
// UTC) — precisa converter pra data local antes de comparar com TODAY/
// windowStart/etc. (esses já são datas locais, ver todayISO acima). Um
// `.slice(0, 10)` direto no timestamp pegaria a data em UTC, mesmo problema.
function localDateFromISO(iso: string): string {
  return localDateISO(new Date(iso));
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

function diffDaysStr(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function fmtDateFull(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export const TODAY = todayISO();

// ---------- Previsão de conclusão (velocidade real dos últimos 14 dias) ----------
export type Forecast = {
  hasForecast: boolean;
  allDone: boolean;
  forecastDateIso: string | null;
  dateLabel: string;
  velocityLabel: string;
};

export function computeForecast(scopeTasks: Task[]): Forecast {
  const remaining = scopeTasks.filter((t) => t.status !== "DONE").length;
  if (remaining === 0) {
    return { hasForecast: false, allDone: true, forecastDateIso: null, dateLabel: "", velocityLabel: "" };
  }
  const windowStart = addDaysStr(TODAY, -14);
  const doneInWindow = scopeTasks.filter((t) => {
    if (t.status !== "DONE" || !t.completed_at) return false;
    const doneDate = localDateFromISO(t.completed_at);
    return doneDate >= windowStart && doneDate <= TODAY;
  }).length;
  const velocityPerDay = doneInWindow / 14;
  if (velocityPerDay <= 0) {
    return {
      hasForecast: false,
      allDone: false,
      forecastDateIso: null,
      dateLabel: "",
      velocityLabel: "Sem ritmo suficiente nos últimos 14 dias",
    };
  }
  const daysToFinish = Math.max(1, Math.ceil(remaining / velocityPerDay));
  const forecastDateIso = addDaysStr(TODAY, daysToFinish);
  const velocityPerWeek = Math.round(velocityPerDay * 7 * 10) / 10;
  return {
    hasForecast: true,
    allDone: false,
    forecastDateIso,
    dateLabel: fmtDateFull(forecastDateIso),
    velocityLabel: `${velocityPerWeek} tarefa(s)/semana`,
  };
}

// ---------- Sequência (gamificação) ----------
export function computeStreak(scopeTasks: Task[]) {
  const completedDates = new Set(
    scopeTasks.filter((t) => t.status === "DONE" && t.completed_at).map((t) => localDateFromISO(t.completed_at!)),
  );
  let streak = 0;
  let cursor = completedDates.has(TODAY) ? TODAY : addDaysStr(TODAY, -1);
  while (completedDates.has(cursor)) {
    streak++;
    cursor = addDaysStr(cursor, -1);
  }
  return { days: streak, hasStreak: streak >= 2, label: `Sequência: ${streak} dia${streak === 1 ? "" : "s"}` };
}

// ---------- KPI (barra de estatísticas + anel) ----------
export function computeKpi(scopeTasks: Task[]) {
  const total = scopeTasks.length;
  const doneCount = scopeTasks.filter((t) => t.status === "DONE").length;
  const futureCount = scopeTasks.filter((t) => t.status === "TODO").length;
  const progressCount = total - doneCount - futureCount;
  const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const ringCircumference = 2 * Math.PI * 28;
  return {
    total,
    doneCount,
    progressCount,
    futureCount,
    donePct,
    ringDashArray: ringCircumference.toFixed(1),
    ringDashOffset: (ringCircumference * (1 - donePct / 100)).toFixed(1),
  };
}

// ---------- Kanban do Dashboard (3 colunas) ----------
export function buildKanbanColumns(scopeTasks: Task[]) {
  const bucketOf = (t: Task) => (t.status === "DONE" ? "done" : t.status === "TODO" ? "future" : "progress");
  // Ordem de fluxo A Fazer → Em Progresso → Concluídas (era Concluídas →
  // Em Progresso → Futuras) e "Futuras" renomeada pra "A Fazer" — mesmo nome
  // que o status TODO já tem em todo o resto do app (STATUS_LABEL.TODO),
  // "Futuras" não existia em nenhum outro lugar. Pedido do usuário, 2026-09-09.
  const defs = [
    { key: "future", label: "A Fazer", icon: "○", accent: "var(--db-amber)" },
    { key: "progress", label: "Em Progresso", icon: "◐", accent: "var(--db-teal)" },
    { key: "done", label: "Concluídas", icon: "✓", accent: "var(--db-green)" },
  ] as const;
  return defs.map((def) => ({
    ...def,
    tasks: scopeTasks.filter((t) => bucketOf(t) === def.key),
  }));
}

// ---------- Gantt ----------
export type GanttRow = {
  id: string;
  label: string;
  dotColor: string;
  leftPct: number;
  widthPct: number;
  status: "done" | "progress" | "blocked" | "todo";
  tooltip: string;
};

export function buildGantt(scopeTasks: Task[], projects: Project[], filterMode: "all" | "inbox" | string) {
  type Row = { id: string; label: string; dotColor: string; start: string | null; end: string | null; status: GanttRow["status"] };
  let rows: Row[] = [];

  if (filterMode === "all") {
    rows = projects
      .map((p) => {
        const pTasks = scopeTasks.filter((t) => t.project_id === p.id);
        if (!pTasks.length) return null;
        const starts = pTasks.map((t) => t.created_at?.slice(0, 10)).filter(Boolean) as string[];
        const ends = pTasks.map((t) => t.due_date).filter(Boolean) as string[];
        const allDone = pTasks.every((t) => t.status === "DONE");
        const anyBlocked = pTasks.some((t) => t.status === "BLOCKED");
        const anyProgress = pTasks.some((t) => t.status === "IN_PROGRESS" || t.status === "WAITING");
        return {
          id: p.id,
          label: p.name,
          dotColor: p.color,
          start: starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : null,
          end: ends.length ? ends.reduce((a, b) => (a > b ? a : b)) : null,
          status: allDone ? "done" : anyBlocked ? "blocked" : anyProgress ? "progress" : "todo",
        } as Row;
      })
      .filter((r): r is Row => r !== null);
  } else {
    rows = scopeTasks.map((t) => ({
      id: t.id,
      label: t.title,
      dotColor: t.project_id ? projects.find((p) => p.id === t.project_id)?.color ?? "#6b7280" : "#6b7280",
      start: t.created_at?.slice(0, 10) ?? null,
      end: t.due_date,
      status:
        t.status === "DONE" ? "done" : t.status === "BLOCKED" ? "blocked" : t.status === "IN_PROGRESS" || t.status === "WAITING" ? "progress" : "todo",
    }));
  }

  if (!rows.length) return { isEmpty: true, days: [] as { label: string; leftPct: number }[], barRows: [] as GanttRow[] };

  const starts = rows.map((r) => r.start).filter(Boolean) as string[];
  const ends = rows.map((r) => r.end).filter(Boolean) as string[];
  const domainStart = starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : addDaysStr(TODAY, -7);
  let domainEnd = ends.length ? ends.reduce((a, b) => (a > b ? a : b)) : addDaysStr(TODAY, 14);
  if (diffDaysStr(domainStart, domainEnd) < 7) domainEnd = addDaysStr(domainStart, 14);
  const totalSpan = Math.max(diffDaysStr(domainStart, domainEnd), 1);

  // Régua por dia (era por semana) — pedido do usuário (2026-09-09). Passo
  // fixo em dias (não "N marcações distribuídas por índice", que tentei antes
  // — arredondar pra encaixar exatamente 0% e 100% deixava um intervalo mais
  // curto que os outros, "algumas datas mais perto, outras mais distantes",
  // usuário 2026-09-09). Passo constante = espaçamento sempre igual em %, e
  // continua sendo dia/totalSpan de verdade — mesma conta que as barras usam
  // (leftPct/widthPct logo abaixo), então a régua fica alinhada com o
  // andamento real das tarefas, só não força a última marcação bater exatamente
  // no fim do período (pode sobrar uma folga no final, sem problema).
  const NICE_STEPS_DAYS = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90];
  const maxCols = 10;
  const idealStep = totalSpan / Math.max(1, maxCols - 1);
  const step = NICE_STEPS_DAYS.find((s) => s >= idealStep) ?? Math.ceil(idealStep / 30) * 30;
  const days: { label: string; leftPct: number }[] = [];
  for (let d = 0; d <= totalSpan; d += step) {
    days.push({ label: fmtDate(addDaysStr(domainStart, d)), leftPct: (d / totalSpan) * 100 });
  }

  const barRows: GanttRow[] = rows.map((r) => {
    const rs = r.start || r.end || domainStart;
    const re = r.end || r.start || domainStart;
    const startOff = Math.max(0, diffDaysStr(domainStart, rs));
    const endOff = Math.min(totalSpan, Math.max(diffDaysStr(domainStart, re), startOff));
    const leftPct = (startOff / totalSpan) * 100;
    const widthPct = Math.max(((endOff - startOff) / totalSpan) * 100, 1.4);
    return {
      id: r.id,
      label: r.label,
      dotColor: r.dotColor,
      leftPct,
      widthPct,
      status: r.status,
      tooltip: r.label + (r.start || r.end ? ` (${fmtDateFull(r.start)} → ${fmtDateFull(r.end)})` : " — sem datas"),
    };
  });

  return { isEmpty: false, days, barRows };
}

// ---------- Burndown (barras CSS, alturas em %) ----------
export function buildBurndown(scopeTasks: Task[], forecast: Forecast) {
  if (!scopeTasks.length) return { isEmpty: true, bars: [] as ReturnType<typeof burndownBar>[], forecastLabel: "" };

  const starts = scopeTasks.map((t) => t.created_at?.slice(0, 10)).filter(Boolean) as string[];
  const dueDates = scopeTasks.map((t) => t.due_date).filter(Boolean) as string[];
  const rangeStart = starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : addDaysStr(TODAY, -14);
  let rangeEnd = dueDates.length ? dueDates.reduce((a, b) => (a > b ? a : b)) : addDaysStr(TODAY, 14);
  if (forecast.hasForecast && forecast.forecastDateIso! > rangeEnd) rangeEnd = forecast.forecastDateIso!;
  if (diffDaysStr(rangeStart, rangeEnd) < 3) rangeEnd = addDaysStr(rangeStart, 14);
  const totalDays = Math.max(diffDaysStr(rangeStart, rangeEnd), 1);
  const totalCount = scopeTasks.length;
  const todayOffset = Math.max(0, Math.min(totalDays, diffDaysStr(rangeStart, TODAY)));

  const remainingAt = (dateIso: string) =>
    scopeTasks.filter((t) => !(t.status === "DONE" && t.completed_at && localDateFromISO(t.completed_at) <= dateIso)).length;
  const idealAt = (d: number) => Math.max(0, totalCount * (1 - d / totalDays));
  const remainingAtToday = remainingAt(addDaysStr(rangeStart, todayOffset));

  const forecastOffset = forecast.hasForecast
    ? Math.min(totalDays, Math.max(todayOffset, diffDaysStr(rangeStart, forecast.forecastDateIso!)))
    : null;
  const forecastAt = (d: number) => {
    if (!forecast.hasForecast || forecastOffset === todayOffset) return 0;
    const t = Math.max(0, Math.min(1, (d - todayOffset) / (forecastOffset! - todayOffset)));
    return Math.max(0, remainingAtToday * (1 - t));
  };

  let trendSlope = 0;
  let trendIntercept = totalCount;
  let hasTrend = false;
  {
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0,
      n = 0;
    for (let d = 0; d <= todayOffset; d++) {
      const y = remainingAt(addDaysStr(rangeStart, d));
      sumX += d;
      sumY += y;
      sumXY += d * y;
      sumXX += d * d;
      n++;
    }
    const denom = n * sumXX - sumX * sumX;
    if (n >= 2 && denom !== 0) {
      trendSlope = (n * sumXY - sumX * sumY) / denom;
      trendIntercept = (sumY - trendSlope * sumX) / n;
      hasTrend = true;
    }
  }
  const trendAt = (d: number) => Math.max(0, trendIntercept + trendSlope * d);

  const maxCols = 24;
  const step = Math.max(1, Math.ceil((totalDays + 1) / maxCols));
  const dayIdxs: number[] = [];
  for (let d = 0; d <= totalDays; d += step) dayIdxs.push(d);
  if (dayIdxs[dayIdxs.length - 1] !== totalDays) dayIdxs.push(totalDays);

  const pct = (v: number) => (totalCount ? Math.max(0, Math.min(100, (v / totalCount) * 100)) : 0);

  function burndownBar(d: number) {
    const dateIso = addDaysStr(rangeStart, d);
    const isPast = d <= todayOffset;
    const idealValue = idealAt(d);
    const actualValue = isPast ? remainingAt(dateIso) : null;
    const forecastValue = !isPast && forecast.hasForecast ? forecastAt(d) : null;
    const trendValue = hasTrend ? trendAt(d) : null;
    // Tooltip (hover na coluna) com os 4 valores — pedido do usuário
    // (2026-09-09): real, ideal, previsão e tendência do dia, não só a data.
    const tooltip = [
      fmtDateFull(dateIso),
      `Real: ${actualValue !== null ? Math.round(actualValue) : "—"}`,
      `Ideal: ${Math.round(idealValue)}`,
      `Previsão: ${forecastValue !== null ? Math.round(forecastValue) : "—"}`,
      `Tendência: ${trendValue !== null ? Math.round(trendValue) : "—"}`,
    ].join("\n");
    return {
      label: fmtDate(dateIso),
      tooltip,
      idealPct: pct(idealValue),
      hasActual: isPast,
      actualPct: isPast ? pct(remainingAt(dateIso)) : 0,
      hasForecastBar: !isPast && forecast.hasForecast,
      forecastPct: !isPast && forecast.hasForecast ? pct(forecastValue!) : 0,
      trendPct: hasTrend ? pct(trendValue!) : null,
    };
  }

  const bars = dayIdxs.map(burndownBar);

  return {
    isEmpty: false,
    bars,
    forecastLabel: forecast.hasForecast ? `Previsão de conclusão: ${forecast.dateLabel}` : "Sem dados suficientes para prever conclusão",
  };
}

// ---------- Visão Geral (anéis por projeto, mapa de calor, velocity) ----------
export function buildOverview(allTasks: Task[], projects: Project[], scopeTasksForVelocity: Task[]) {
  const bucketOf = (t: Task) => (t.status === "DONE" ? "done" : t.status === "TODO" ? "future" : "progress");
  const ringCircumference = 2 * Math.PI * 24;

  const radialRings = projects.map((p) => {
    const pTasks = allTasks.filter((t) => t.project_id === p.id && t.status !== "CANCELLED" && t.status !== "INBOX");
    const total = pTasks.length;
    const done = pTasks.filter((t) => t.status === "DONE").length;
    const future = pTasks.filter((t) => t.status === "TODO").length;
    const progress = total - done - future;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      id: p.id,
      name: p.name,
      pct,
      dotColor: p.color,
      ringDashArray: ringCircumference.toFixed(1),
      ringDashOffset: (ringCircumference * (1 - pct / 100)).toFixed(1),
      tooltip: `${p.name}: ${done} concluída(s), ${progress} em progresso, ${future} futura(s)`,
    };
  });

  const heatCols = [
    { key: "future" as const, label: "Futuras" },
    { key: "progress" as const, label: "Em Progresso" },
    { key: "done" as const, label: "Concluídas" },
  ];
  const heatBgRgb = { future: "255,166,0", progress: "14,154,167", done: "34,197,94" };
  const heatRowsRaw = projects.map((p) => {
    const pTasks = allTasks.filter((t) => t.project_id === p.id && t.status !== "CANCELLED" && t.status !== "INBOX");
    const counts = { future: 0, progress: 0, done: 0 };
    pTasks.forEach((t) => {
      counts[bucketOf(t) as keyof typeof counts]++;
    });
    return { name: p.name, dotColor: p.color, counts };
  });
  const maxCount = Math.max(1, ...heatRowsRaw.flatMap((r) => Object.values(r.counts)));
  const heatRows = heatRowsRaw.map((r) => ({
    name: r.name,
    dotColor: r.dotColor,
    cells: heatCols.map((c) => {
      const count = r.counts[c.key];
      const intensity = count / maxCount;
      return { count, background: `rgba(${heatBgRgb[c.key]},${(0.08 + intensity * 0.55).toFixed(2)})` };
    }),
  }));

  const weeks: { label: string; count: number; isCurrent: boolean }[] = [];
  for (let w = 7; w >= 0; w--) {
    const weekEnd = addDaysStr(TODAY, -7 * w);
    const weekStart = addDaysStr(weekEnd, -6);
    const count = scopeTasksForVelocity.filter((t) => {
      if (t.status !== "DONE" || !t.completed_at) return false;
      const doneDate = localDateFromISO(t.completed_at);
      return doneDate >= weekStart && doneDate <= weekEnd;
    }).length;
    weeks.push({ label: fmtDate(weekEnd), count, isCurrent: w === 0 });
  }
  const maxVelocity = Math.max(1, ...weeks.map((w) => w.count));
  const pastWeeks = weeks.slice(0, 7);
  const avgPast = pastWeeks.length ? pastWeeks.reduce((a, b) => a + b.count, 0) / pastWeeks.length : 0;
  const currentWeek = weeks[weeks.length - 1];
  const velocityGoalMet = avgPast > 0 && currentWeek.count >= avgPast;
  const velocityBars = weeks.map((w) => ({
    label: w.label,
    count: w.count,
    heightPct: Math.round((w.count / maxVelocity) * 100),
    isCurrent: w.isCurrent,
  }));

  return { radialRings, heatCols, heatRows, velocityBars, avgPastLabel: Math.round(avgPast * 10) / 10, velocityGoalMet };
}

export { PRIORITY_COLOR };
