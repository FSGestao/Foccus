"use client";

import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/stores/profile-store";

// Porta de Foccus.dc.html:153-166 (Proactive Assistant Banner). Renderizado
// na Minha Lista — é a tela de entrada do sistema, mesmo lugar onde o
// legado mais mostra esse banner em uso normal.
export function GargaloBanner({ emProgressoCount }: { emProgressoCount: number }) {
  const router = useRouter();
  const dismiss = useProfileStore((s) => s.dismissGargaloBanner);

  return (
    <div
      className="mb-5 flex items-start gap-4 rounded-xl p-4"
      style={{
        background: "var(--pb-glass-card)",
        backdropFilter: "blur(16px) saturate(160%)",
        border: "1px solid var(--pb-accent)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div className="text-2xl leading-none">🚦</div>
      <div className="flex-1">
        <h3 className="m-0 mb-1.5 text-[15px] font-bold" style={{ color: "var(--pb-accent)" }}>
          Alerta de Trânsito no Fluxo
        </h3>
        <p className="m-0 text-[13px] leading-relaxed" style={{ color: "var(--pb-text)" }}>
          Você tem {emProgressoCount} tarefas travadas em &quot;Em Progresso&quot;. Antes de começar algo novo, que tal
          limparmos esse gargalo?
        </p>
      </div>
      <div className="flex flex-none gap-2">
        <button
          type="button"
          onClick={() => router.push("/kanban")}
          className="cursor-pointer rounded-md px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ background: "var(--pb-accent)", color: "#fff", border: "none" }}
        >
          Ver no Kanban
        </button>
        <button
          type="button"
          onClick={() => dismiss()}
          className="cursor-pointer rounded-md px-3 py-1.5 text-[12.5px] font-medium"
          style={{ background: "transparent", color: "var(--pb-text-dim)", border: "1px solid var(--pb-border)" }}
        >
          Ignorar
        </button>
      </div>
    </div>
  );
}
