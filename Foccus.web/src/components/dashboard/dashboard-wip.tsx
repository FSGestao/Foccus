"use client";

import { useState } from "react";
import { buildWip, type WipWindowDays } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";

const WINDOW_OPTIONS: WipWindowDays[] = [7, 14, 30, 90];

// Uma série = uma cor + as chaves (compute.ts) usadas pra linha (%, pro SVG)
// e pro valor bruto (contagem, pro eixo/tooltip).
const SERIES: {
  pctKey: "donePct" | "activePct" | "futurePct" | "otherPct";
  countKey: "done" | "active" | "future" | "other";
  label: string;
  color: string;
  dashed?: boolean;
}[] = [
  { pctKey: "donePct", countKey: "done", label: "Concluídas", color: "var(--db-green)" },
  { pctKey: "activePct", countKey: "active", label: "Bloqueadas/Aguardando/Em andamento", color: "var(--db-teal)" },
  { pctKey: "futurePct", countKey: "future", label: "Futuras", color: "var(--db-amber)" },
  { pctKey: "otherPct", countKey: "other", label: "Sem status ou sem data", color: "var(--db-neutral)", dashed: true },
];

export function DashboardWip({ scopeTasks }: { scopeTasks: Task[] }) {
  const [windowDays, setWindowDays] = useState<WipWindowDays>(14);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const wip = buildWip(scopeTasks, windowDays);

  if (wip.isEmpty) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--db-text-muted)" }}>
        Sem tarefas suficientes para montar o gráfico de WIP.
      </p>
    );
  }

  const n = wip.bars.length;
  const pointsFor = (key: (typeof SERIES)[number]["pctKey"]) =>
    wip.bars.map((bar, i) => `${((i + 0.5) / n) * 100},${100 - bar[key]}`).join(" ");
  const hovered = hoverIdx !== null ? wip.bars[hoverIdx] : null;
  const midTotal = Math.round(wip.maxTotal / 2);

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--db-text-muted)" }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm" style={{ background: "var(--db-wip-bar-bg)", border: "1px solid var(--db-border-strong)" }} /> Total do dia
          </span>
          {SERIES.map((s) => (
            <span key={s.pctKey} className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3" style={{ background: s.color }} /> {s.label}
            </span>
          ))}
        </div>

        <div className="inline-flex w-fit gap-1 rounded-full p-1" style={{ background: "var(--db-bg)", border: "1px solid var(--db-border)" }}>
          {WINDOW_OPTIONS.map((opt) => {
            const active = windowDays === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setWindowDays(opt)}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: active ? "var(--db-teal)" : "transparent", color: active ? "#fff" : "var(--db-text-muted)" }}
              >
                {opt}d
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        {/* Eixo Y (0 / meio / topo em quantidade de tarefas) — pedido do
            usuário, 2026-09-14: dá uma referência de escala sem precisar
            passar o mouse. */}
        <div className="relative h-48 w-6 shrink-0 text-right text-[10px]" style={{ color: "var(--db-text-dim)" }}>
          <span className="absolute right-0 top-0 -translate-y-1/2">{wip.maxTotal}</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2">{midTotal}</span>
          <span className="absolute right-0 bottom-0 translate-y-1/2">0</span>
        </div>

        <div className="relative flex h-48 flex-1 items-end gap-1">
          {wip.bars.map((bar, i) => (
            <div
              key={i}
              tabIndex={0}
              role="button"
              aria-label={`${bar.dateLabel}: total ${bar.total}, concluídas ${bar.done}, bloqueadas/aguardando/em andamento ${bar.active}, futuras ${bar.future}, sem status ou sem data ${bar.other}`}
              className="relative flex h-full flex-1 flex-col justify-end outline-none"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
              onFocus={() => setHoverIdx(i)}
              onBlur={() => setHoverIdx((cur) => (cur === i ? null : cur))}
            >
              {hoverIdx === i && (
                <div className="absolute inset-y-0 left-0 right-0" style={{ background: "var(--db-border-strong)" }} />
              )}
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-sm"
                style={{
                  height: `${bar.totalPct}%`,
                  background: "var(--db-wip-bar-bg)",
                  borderTop: "1.5px solid var(--db-border-strong)",
                }}
              />
            </div>
          ))}
          {/* Linhas por cima das barras (mesma técnica do burndown: halo na cor
              do painel por baixo de cada linha colorida, pra elas continuarem
              legíveis mesmo se cruzarem/sobrepuserem entre si). */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {SERIES.map((s) => (
              <polyline
                key={`halo-${s.pctKey}`}
                points={pointsFor(s.pctKey)}
                fill="none"
                stroke="var(--db-panel)"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {SERIES.map((s) => (
              <polyline
                key={s.pctKey}
                points={pointsFor(s.pctKey)}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeDasharray={s.dashed ? "4 3" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* Tooltip: valores de todas as séries no dia sob o mouse/foco, não
              só a data (título nativo do navegador era lento/sem estilo) —
              pedido do usuário, 2026-09-14. */}
          {hovered && (
            <div
              className="pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-[220px] rounded-md px-2.5 py-2 text-xs shadow-lg"
              style={{
                left: `${((hoverIdx! + 0.5) / n) * 100}%`,
                transform: `translateX(${hoverIdx! < n / 2 ? "-10%" : "-90%"})`,
                background: "var(--db-panel-strong)",
                border: "1px solid var(--db-border-strong)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="mb-1 font-semibold" style={{ color: "var(--db-text)" }}>
                {hovered.dateLabel}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ color: "var(--db-text-muted)" }}>Total</span>
                <span className="font-semibold" style={{ color: "var(--db-text)" }}>{hovered.total}</span>
              </div>
              {SERIES.map((s) => (
                <div key={s.pctKey} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5" style={{ color: "var(--db-text-muted)" }}>
                    <span className="h-0.5 w-2.5 shrink-0" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-semibold" style={{ color: "var(--db-text)" }}>{hovered[s.countKey]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 pl-8 text-[9px]" style={{ color: "var(--db-text-dim)" }}>
        {wip.bars.map((bar, i) => (
          <span key={i} className="flex-1 truncate text-center">
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}
