"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useUiStore } from "@/lib/stores/ui-store";

// Porta de Foccus.dc.html:153-166 (Proactive Assistant Banner). No Foccus.web
// virou popup (mesmo layout do FechamentoModal) em vez de faixa no topo da
// tela. "Ver essas tarefas" abre a Minha Lista já filtrada em Em andamento +
// Aguardando. Fechar de qualquer jeito (botões, clique fora, Esc)
// dispensa o alerta até amanhã — senão ele reabriria a cada troca de tela.
export function GargaloBanner({ emProgressoCount }: { emProgressoCount: number }) {
  const router = useRouter();
  const dismiss = useProfileStore((s) => s.dismissGargaloBanner);
  const setListFocusGargalo = useUiStore((s) => s.setListFocusGargalo);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={() => dismiss()}
      title="Clique fora para fechar"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Alerta de Trânsito no Fluxo"
        className="flex w-full max-w-[440px] flex-col gap-4 rounded-xl p-7 text-center"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(24px) saturate(200%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
        }}
      >
        <div className="text-3xl leading-none">🚦</div>
        <div>
          <h2 className="m-0 mb-1.5 text-[17px] font-bold" style={{ color: "var(--pb-text)" }}>
            Alerta de Trânsito no Fluxo
          </h2>
          <p className="m-0 text-[13.5px] leading-relaxed" style={{ color: "var(--pb-text-muted)" }}>
            Você tem {emProgressoCount} tarefas travadas em &quot;Em Progresso&quot;. Antes de começar algo novo, que tal
            limparmos esse gargalo?
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              dismiss();
              setListFocusGargalo(true);
              router.push("/");
            }}
            className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold"
            style={{ color: "#fff", background: "var(--pb-accent)", border: "none" }}
          >
            Ver essas tarefas
          </button>
          <button
            type="button"
            onClick={() => dismiss()}
            className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium"
            style={{ background: "transparent", color: "var(--pb-text-dim)", border: "1px solid var(--pb-border)" }}
          >
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
}
