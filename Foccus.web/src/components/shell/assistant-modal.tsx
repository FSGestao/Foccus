"use client";

import { useProfileStore } from "@/lib/stores/profile-store";

// Porta de Foccus.dc.html:1287-1393 — mesmos 4 cards (Destruidor de
// Gargalos, Vitórias Rápidas, Ritual de Fechamento, Limpeza de Primavera).
// "Limpeza de Primavera" é só o toggle de configuração mesmo no legado: não
// existe lá nenhum banner/gatilho ativo pra ela ainda, então aqui também é
// só o interruptor, fiel ao original.
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="relative inline-block h-5 w-[34px] flex-shrink-0 cursor-pointer" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-0 w-0 opacity-0" />
      <span
        className="absolute inset-0 rounded-full transition-colors"
        style={{ background: checked ? "var(--pb-accent)" : "var(--pb-border)" }}
      >
        <span
          className="absolute bottom-[3px] left-[3px] h-3.5 w-3.5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(14px)" : "translateX(0)" }}
        />
      </span>
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg p-4" style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}>
      {children}
    </div>
  );
}

export function AssistantModal({ onClose, emProgressoCount }: { onClose: () => void; emProgressoCount: number }) {
  const p = useProfileStore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
      title="Clique fora para fechar"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Configurações do Assistente"
        className="flex w-full max-w-[540px] flex-col gap-5 rounded-xl p-7"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(24px) saturate(200%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="m-0 flex items-center gap-2 text-lg font-bold" style={{ color: "var(--pb-text)" }}>
            <span>✨</span> Configurações do Assistente Inteligente
          </h2>
          <button type="button" onClick={onClose} title="Fechar modal" className="cursor-pointer bg-transparent text-base" style={{ color: "var(--pb-text-dim)", border: "none" }}>
            ✕
          </button>
        </div>

        <p className="m-0 text-sm leading-relaxed" style={{ color: "var(--pb-text-muted)" }}>
          O assistente proativo analisa seu Kanban e sugere ações para melhorar seu fluxo, evitar gargalos e celebrar
          conquistas. Os cards abaixo explicam cada mecanismo e deixam os parâmetros à sua escolha.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <div className="min-w-[140px] flex-1 rounded-lg p-3" style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}>
            <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
              🎉 Combos de Fluxo
            </div>
            <div className="mt-0.5 text-lg font-bold" style={{ color: "var(--pb-accent)" }}>
              {p.gargaloComboCount}
            </div>
          </div>
          <div className="min-w-[140px] flex-1 rounded-lg p-3" style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}>
            <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
              🔥 Nível de Foco
            </div>
            <div className="mt-0.5 text-lg font-bold" style={{ color: "var(--pb-accent)" }}>
              {p.fechamentoStreak} {p.fechamentoStreak === 1 ? "dia" : "dias"}
            </div>
          </div>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-2">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--pb-text)" }}>
                  🚦 Destruidor de Gargalos
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--pb-text-dim)" }}>
                  Avisa quando muitas tarefas se acumulam em &quot;Em Progresso&quot; e some sozinho quando você resolve — resolver
                  no mesmo dia soma um Combo de Fluxo.
                </div>
              </div>
              <ToggleSwitch
                checked={p.asstGargaloAtivo}
                onChange={(v) => p.updateSettings({ asst_gargalo_ativo: v })}
                label="Ativar Destruidor de Gargalos"
              />
            </div>
            <div className="text-[11.5px]" style={{ color: "var(--pb-text-dim)" }}>
              Agora: {emProgressoCount} tarefa(s) em &quot;Em Progresso&quot; (limite atual: {p.asstGargaloLimite}).
            </div>
            {p.asstGargaloAtivo && (
              <div className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--pb-text)" }}>
                Alertar se houver mais de
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={p.asstGargaloLimite}
                  onChange={(e) => p.updateSettings({ asst_gargalo_limite: parseInt(e.target.value, 10) || 10 })}
                  className="w-[60px] rounded p-1 text-[12.5px]"
                  style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface)", color: "var(--pb-text)" }}
                />
                tarefas paradas.
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--pb-text)" }}>
                  ⚡ Vitórias Rápidas (Quick Wins)
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--pb-text-dim)" }}>
                  Se o board ficar 4h sem nenhuma mudança, sugere até 3 tarefas rápidas pra destravar o dia.
                </div>
              </div>
              <ToggleSwitch
                checked={p.asstQuickwinAtivo}
                onChange={(v) => p.updateSettings({ asst_quickwin_ativo: v })}
                label="Ativar Vitórias Rápidas"
              />
            </div>
            {p.asstQuickwinAtivo && (
              <div className="text-[12.5px]" style={{ color: "var(--pb-text-dim)" }}>
                Considera &quot;rápida&quot; a tarefa TODO com estimativa até 15 min (campo no detalhe da tarefa) ou Prioridade
                Baixa (P4).
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--pb-text)" }}>
                  🌙 Ritual de Fechamento
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--pb-text-dim)" }}>
                  Abre um resumo do dia no horário abaixo e conta quantos dias seguidos você fez o ritual (Nível de Foco).
                </div>
              </div>
              <ToggleSwitch
                checked={p.asstFechamentoAtivo}
                onChange={(v) => p.updateSettings({ asst_fechamento_ativo: v })}
                label="Ativar Ritual de Fechamento"
              />
            </div>
            {p.asstFechamentoAtivo && (
              <div className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--pb-text)" }}>
                Exibir resumo após as
                <input
                  type="time"
                  value={p.asstFechamentoHora}
                  onChange={(e) => p.updateSettings({ asst_fechamento_hora: e.target.value })}
                  className="w-[100px] rounded p-1 text-[12.5px]"
                  style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface)", color: "var(--pb-text)" }}
                />
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--pb-text)" }}>
                  🧹 Limpeza de Primavera
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--pb-text-dim)" }}>
                  Encoraja a exclusão de tarefas que estão no Backlog há muito tempo.
                </div>
              </div>
              <ToggleSwitch
                checked={p.asstLimpezaAtivo}
                onChange={(v) => p.updateSettings({ asst_limpeza_ativo: v })}
                label="Ativar Limpeza de Primavera"
              />
            </div>
            {p.asstLimpezaAtivo && (
              <div className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--pb-text)" }}>
                Alertar tarefas sem alteração por
                <input
                  type="number"
                  min={7}
                  max={365}
                  value={p.asstLimpezaDias}
                  onChange={(e) => p.updateSettings({ asst_limpeza_dias: parseInt(e.target.value, 10) || 30 })}
                  className="w-[60px] rounded p-1 text-[12.5px]"
                  style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface)", color: "var(--pb-text)" }}
                />
                dias.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
