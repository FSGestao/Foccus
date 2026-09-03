"use client";

import { buildBurndown, computeForecast } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";

export function DashboardBurndown({ scopeTasks }: { scopeTasks: Task[] }) {
  const forecast = computeForecast(scopeTasks);
  const burndown = buildBurndown(scopeTasks, forecast);

  if (burndown.isEmpty) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--db-text-muted)" }}>
        Sem tarefas suficientes para montar o burndown.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--db-text-muted)" }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ background: "var(--db-teal)" }} /> Real
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ border: "1.5px dashed var(--db-text-dim)" }} /> Ideal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ border: "1.5px dashed var(--db-amber)" }} /> Previsão
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3" style={{ background: "var(--db-blue)" }} /> Tendência
        </span>
      </div>

      <div className="flex h-40 items-end gap-1">
        {burndown.bars.map((bar, i) => (
          <div key={i} className="relative flex h-full flex-1 flex-col justify-end" title={bar.label}>
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-sm"
              style={{ height: `${bar.idealPct}%`, background: "var(--db-panel-strong)", borderTop: "1.5px dashed var(--db-text-dim)" }}
            />
            {bar.hasActual && (
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-sm"
                style={{ height: `${bar.actualPct}%`, background: "var(--db-teal)" }}
              />
            )}
            {bar.hasForecastBar && (
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-sm"
                style={{ height: `${bar.forecastPct}%`, border: "1.5px dashed var(--db-amber)" }}
              />
            )}
            {bar.trendPct !== null && (
              <div className="absolute inset-x-0 h-0.5" style={{ bottom: `${bar.trendPct}%`, background: "var(--db-blue)", opacity: 0.85 }} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px]" style={{ color: "var(--db-text-dim)" }}>
        <span>{burndown.bars[0]?.label}</span>
        <span>{burndown.bars[burndown.bars.length - 1]?.label}</span>
      </div>
      <p className="text-xs" style={{ color: "var(--db-text-muted)" }}>
        {burndown.forecastLabel}
      </p>
    </div>
  );
}
