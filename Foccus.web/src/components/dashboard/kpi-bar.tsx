"use client";

import { computeKpi, computeForecast, computeStreak } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";

export function KpiBar({ scopeTasks }: { scopeTasks: Task[] }) {
  const kpi = computeKpi(scopeTasks);
  const forecast = computeForecast(scopeTasks);
  const streak = computeStreak(scopeTasks);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-3">
        {streak.hasStreak && (
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: "var(--db-amber-bg)", border: "1px solid var(--db-amber)", color: "var(--db-amber)" }}
          >
            🏆 {streak.label}
          </div>
        )}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: "var(--db-amber-bg)", border: "1px solid var(--db-amber)", color: "var(--db-amber)" }}
          title={forecast.velocityLabel}
        >
          ▲ {forecast.allDone ? "Tudo concluído" : forecast.hasForecast ? `Previsão: ${forecast.dateLabel}` : "Sem previsão ainda"}
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-6 rounded-2xl px-6 py-3.5"
        style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}
      >
        <div className="text-center">
          <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--db-text-dim)" }}>
            Total de Tarefas
          </div>
          <div className="mt-0.5 text-xl font-extrabold" style={{ color: "var(--db-text)" }}>
            {kpi.total}
          </div>
        </div>
        <div className="h-8 w-px" style={{ background: "var(--db-border)" }} />
        <div className="text-center">
          <div className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: "var(--db-text-dim)" }}>
            Conclusão
          </div>
          <div className="mt-0.5 text-xl font-extrabold" style={{ color: "var(--db-text)" }}>
            {kpi.donePct}%
          </div>
        </div>
        <div className="relative h-[70px] w-[70px] shrink-0" title={`${kpi.doneCount} de ${kpi.total} tarefas concluídas`}>
          <svg width={70} height={70} viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={32} cy={32} r={28} fill="none" stroke="var(--db-border)" strokeWidth={6} />
            <circle
              cx={32}
              cy={32}
              r={28}
              fill="none"
              stroke="var(--db-green)"
              strokeWidth={6}
              strokeLinecap="round"
              style={{ strokeDasharray: kpi.ringDashArray, strokeDashoffset: kpi.ringDashOffset, transition: "stroke-dashoffset .4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-extrabold" style={{ color: "var(--db-text)" }}>
              {kpi.donePct}%
            </span>
          </div>
        </div>
        <div className="h-8 w-px" style={{ background: "var(--db-border)" }} />
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--db-green)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--db-green)" }} />
            {kpi.doneCount} Concluídas
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--db-teal)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--db-teal)" }} />
            {kpi.progressCount} Em Progresso
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--db-amber)" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--db-amber)" }} />
            {kpi.futureCount} Futuras
          </span>
        </div>
      </div>
    </div>
  );
}
