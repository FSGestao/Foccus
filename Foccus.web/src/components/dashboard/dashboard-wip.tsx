"use client";

import { useState } from "react";
import { buildWip, type WipWindowDays } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";

const WINDOW_OPTIONS: WipWindowDays[] = [7, 14, 30, 90];

// Uma série = uma cor + a chave do %-do-dia (compute.ts) usada pra linha.
const SERIES: { key: "donePct" | "activePct" | "futurePct" | "otherPct"; label: string; color: string; dashed?: boolean }[] = [
  { key: "donePct", label: "Concluídas", color: "var(--db-green)" },
  { key: "activePct", label: "Bloqueadas/Aguardando/Em andamento", color: "var(--db-teal)" },
  { key: "futurePct", label: "Futuras", color: "var(--db-amber)" },
  { key: "otherPct", label: "Sem status ou sem data", color: "var(--db-text-dim)", dashed: true },
];

export function DashboardWip({ scopeTasks }: { scopeTasks: Task[] }) {
  const [windowDays, setWindowDays] = useState<WipWindowDays>(14);
  const wip = buildWip(scopeTasks, windowDays);

  if (wip.isEmpty) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--db-text-muted)" }}>
        Sem tarefas suficientes para montar o gráfico de WIP.
      </p>
    );
  }

  const n = wip.bars.length;
  const pointsFor = (key: (typeof SERIES)[number]["key"]) =>
    wip.bars.map((bar, i) => `${((i + 0.5) / n) * 100},${100 - bar[key]}`).join(" ");

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--db-text-muted)" }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm" style={{ background: "var(--db-panel-strong)" }} /> Total do dia
          </span>
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3" style={{ background: s.color, opacity: s.dashed ? 0.7 : 1 }} /> {s.label}
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

      <div className="relative flex h-48 items-end gap-1">
        {wip.bars.map((bar, i) => (
          <div key={i} className="relative flex h-full flex-1 flex-col justify-end" title={bar.tooltip}>
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-sm"
              style={{ height: `${bar.totalPct}%`, background: "var(--db-panel-strong)" }}
            />
          </div>
        ))}
        {/* Linhas por cima das barras (mesma técnica do burndown: halo na cor
            do painel por baixo de cada linha colorida, pra elas continuarem
            legíveis mesmo se cruzarem/sobrepuserem entre si). */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {SERIES.map((s) => (
            <polyline
              key={`halo-${s.key}`}
              points={pointsFor(s.key)}
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
              key={s.key}
              points={pointsFor(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "4 3" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>

      <div className="flex gap-1 text-[9px]" style={{ color: "var(--db-text-dim)" }}>
        {wip.bars.map((bar, i) => (
          <span key={i} className="flex-1 truncate text-center">
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}
