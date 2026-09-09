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

  const n = burndown.bars.length;
  const trendPoints = burndown.bars.some((b) => b.trendPct !== null)
    ? burndown.bars
        .map((bar, i) => (bar.trendPct === null ? null : `${((i + 0.5) / n) * 100},${100 - bar.trendPct}`))
        .filter((p): p is string => p !== null)
        .join(" ")
    : null;

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

      <div className="relative flex h-40 items-end gap-1">
        {burndown.bars.map((bar, i) => (
          <div key={i} className="relative flex h-full flex-1 flex-col justify-end" title={bar.tooltip}>
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
          </div>
        ))}
        {/* Linha de tendência ligando as barras (pedido do usuário, 2026-09-09)
            — precisa vir DEPOIS das barras no DOM (não antes), senão o
            preenchimento sólido delas pinta por cima da linha e só sobra um
            pedacinho visível onde a linha passa acima do topo da barra; foi
            exatamente essa ordem trocada que deixava a linha "quase
            imperceptível" mesmo já com cor/espessura ajustadas antes. Duas
            polylines sobrepostas: um "halo" mais grosso na cor do painel por
            baixo, pra garantir contraste mesmo cruzando as listras
            tracejadas de Ideal/Previsão, e a linha azul por cima. viewBox
            0-100/0-100 casa com o layout percentual das colunas (mesma
            largura cada, via flex-1); non-scaling-stroke mantém a espessura
            do traço fixa mesmo com o viewBox esticado sem manter proporção. */}
        {trendPoints && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={trendPoints}
              fill="none"
              stroke="var(--db-panel)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={trendPoints}
              fill="none"
              stroke="var(--db-blue)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>
      {/* Uma data por baixo de cada barra (era só a primeira/última) — pedido
          do usuário, 2026-09-09. */}
      <div className="flex gap-1 text-[9px]" style={{ color: "var(--db-text-dim)" }}>
        {burndown.bars.map((bar, i) => (
          <span key={i} className="flex-1 truncate text-center">
            {bar.label}
          </span>
        ))}
      </div>
      <p className="text-xs" style={{ color: "var(--db-text-muted)" }}>
        {burndown.forecastLabel}
      </p>
    </div>
  );
}
