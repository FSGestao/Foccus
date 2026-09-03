"use client";

// Porta de Foccus.dc.html:1267-1285. Só lista os atalhos que existem de fato
// nesta versão web — as linhas de seleção múltipla por arraste/Shift/Ctrl do
// legado ficaram fora (essa UI de seleção em massa não foi portada).
const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: "/", desc: "Focar barra de busca" },
  { keys: "N", desc: "Criar nova tarefa" },
  { keys: "Esc", desc: "Fechar modais / limpar seleção" },
  { keys: "?", desc: "Abrir este guia de atalhos" },
];

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
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
        aria-label="Atalhos de Teclado"
        className="w-full max-w-sm rounded-[10px] p-6"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(18px) saturate(160%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-base font-semibold" style={{ color: "var(--pb-text)" }}>
            ⌨ Atalhos de Teclado
          </h2>
          <button type="button" onClick={onClose} title="Fechar modal" className="cursor-pointer bg-transparent text-sm" style={{ color: "var(--pb-text-dim)", border: "none" }}>
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2.5 text-sm">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between">
              <kbd
                className="rounded px-1.5 py-0.5 font-mono text-xs"
                style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}
              >
                {s.keys}
              </kbd>
              <span style={{ color: "var(--pb-text)" }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
