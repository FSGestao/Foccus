"use client";

import { buildGantt } from "@/lib/dashboard/compute";
import type { Task } from "@/lib/tasks/types";
import type { Project } from "@/lib/projects/types";

// Espaço pro nome da tarefa/projeto — era 160px fixo (w-40), cortava até
// título curto no meio ("quebrado", pedido do usuário 2026-09-09).
const LABEL_WIDTH = 240;

const BAR_STYLE: Record<string, React.CSSProperties> = {
  done: { background: "var(--db-green)" },
  progress: {
    background:
      "repeating-linear-gradient(45deg, var(--db-teal), var(--db-teal) 9px, var(--db-teal-soft) 9px, var(--db-teal-soft) 18px)",
  },
  blocked: { background: "#ef4444" },
  todo: { background: "transparent", border: "1.5px dashed var(--db-text-dim)" },
};

// Legenda dos status (pedido do usuário, 2026-09-09) — mesma ordem de fluxo
// usada em STATUS_OPTIONS (lib/tasks/constants.ts), só com os 4 status que o
// Gantt de fato usa (buildGantt não distingue Aguardando/Cancelada aqui).
const LEGEND_ITEMS: { status: keyof typeof BAR_STYLE; label: string }[] = [
  { status: "todo", label: "A fazer" },
  { status: "progress", label: "Em andamento" },
  { status: "blocked", label: "Bloqueada" },
  { status: "done", label: "Concluída" },
];

export function DashboardGantt({
  scopeTasks,
  projects,
  filterMode,
}: {
  scopeTasks: Task[];
  projects: Project[];
  filterMode: "all" | "inbox" | string;
}) {
  const gantt = buildGantt(scopeTasks, projects, filterMode);

  if (gantt.isEmpty) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--db-text-muted)" }}>
        Sem tarefas com datas para mostrar no Gantt.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl p-4" style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}>
      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--db-text-muted)" }}>
        {LEGEND_ITEMS.map((item) => (
          <span key={item.status} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm" style={BAR_STYLE[item.status]} /> {item.label}
          </span>
        ))}
      </div>
      {/* Régua por dia (era por semana) e coluna de nome bem mais larga (era
          160px, cortava até nome curto no meio) — pedido do usuário,
          2026-09-09. Os dois usam a mesma largura (LABEL_WIDTH), senão a
          régua desalinha das barras. */}
      <div className="relative h-5" style={{ marginLeft: LABEL_WIDTH }}>
        {gantt.days.map((d, i) => {
          // Cada marcação era ancorada pela esquerda (left:X%, texto crescendo
          // pra direita) — isso invadia o espaço da PRÓXIMA marcação sempre
          // que o espaçamento era mais estreito que o próprio texto, grudando
          // as datas mesmo com o espaçamento matematicamente uniforme
          // (usuário seguiu vendo "28/09 30/09" grudados mesmo depois do
          // espaçamento corrigido — a causa era essa, não a distribuição).
          // Centralizar cada marcação no seu próprio ponto (só a primeira
          // fica ancorada na borda esquerda, e só quando uma marcação cai
          // mesmo perto dos 100% ela ancora pela direita — o passo fixo de
          // buildGantt não força mais a última bater exatamente no fim, então
          // decidir pela posição real, não pelo índice, evita ancorar errado
          // quando ela para bem antes de 100%) é a técnica padrão de eixo de
          // gráfico, resolve de vez.
          const isFirst = i === 0;
          const isNearRightEdge = d.leftPct >= 99;
          return (
            <span
              key={i}
              className="absolute whitespace-nowrap text-[10px]"
              style={{
                left: `${d.leftPct}%`,
                color: "var(--db-text-dim)",
                transform: isFirst ? undefined : isNearRightEdge ? "translateX(-100%)" : "translateX(-50%)",
              }}
            >
              {d.label}
            </span>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {gantt.barRows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <span
              className="flex shrink-0 items-center gap-1.5 truncate text-xs"
              style={{ color: "var(--db-text)", width: LABEL_WIDTH }}
              title={row.label}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: row.dotColor }} />
              {row.label}
            </span>
            <div className="relative h-4 flex-1" style={{ background: "var(--db-panel-strong)", borderRadius: 4 }}>
              <div
                title={row.tooltip}
                className="absolute top-1/2 h-4 -translate-y-1/2 rounded"
                style={{ left: `${row.leftPct}%`, width: `${row.widthPct}%`, ...BAR_STYLE[row.status] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
