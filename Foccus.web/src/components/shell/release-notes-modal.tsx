"use client";

import type { ReleaseNote } from "@/lib/release-notes/data";

// Mesmo layout de modal do resto do sistema (ShortcutsModal/FechamentoModal:
// glass card centralizado, blur no fundo) — pedido do usuário, 2026-09-14:
// "usar o mesmo layout do sistema". `notes` já vem filtrado (só o que o
// usuário ainda não confirmou, mais recente primeiro) e `onClose` marca a
// mais recente delas como vista (ver app-shell.tsx).
export function ReleaseNotesModal({ notes, onClose }: { notes: ReleaseNote[]; onClose: () => void }) {
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
        aria-label="Novidades do Foccus"
        className="flex w-full max-w-md flex-col gap-4 rounded-xl p-6"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(24px) saturate(200%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
          maxHeight: "min(600px, 85vh)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">🆕</span>
          <h2 className="m-0 text-base font-semibold" style={{ color: "var(--pb-text)" }}>
            Novidades do Foccus
          </h2>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {notes.map((note, idx) => (
            <div
              key={note.version}
              className="flex flex-col gap-2.5"
              style={idx > 0 ? { borderTop: "1px solid var(--pb-border)", paddingTop: "1rem" } : undefined}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold" style={{ color: "var(--pb-text)" }}>
                  v{note.version}
                </span>
                <span className="text-[11px]" style={{ color: "var(--pb-text-dim)" }}>
                  {new Date(note.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              </div>

              {note.improvements.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-green)" }}>
                    ✨ Melhorias
                  </span>
                  <ul className="m-0 flex flex-col gap-1 pl-4 text-[13px] leading-relaxed" style={{ color: "var(--pb-text)" }}>
                    {note.improvements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {note.fixes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-accent)" }}>
                    🔧 Correções
                  </span>
                  <ul className="m-0 flex flex-col gap-1 pl-4 text-[13px] leading-relaxed" style={{ color: "var(--pb-text)" }}>
                    {note.fixes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold"
          style={{ color: "#fff", background: "var(--pb-accent)", border: "none" }}
        >
          OK, entendi
        </button>
      </div>
    </div>
  );
}
