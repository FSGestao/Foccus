"use client";

import { useProfileStore } from "@/lib/stores/profile-store";
import { useTasksStore } from "@/lib/stores/tasks-store";
import type { QuickWinCandidate } from "@/lib/assistant/compute";

// Porta de Foccus.dc.html:168-186 (Quick Wins Banner).
export function QuickWinBanner({ candidates }: { candidates: QuickWinCandidate[] }) {
  const dismiss = useProfileStore((s) => s.dismissQuickWinBanner);
  const openTask = useTasksStore((s) => s.openTask);
  const toggleDone = useTasksStore((s) => s.toggleDone);

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
      <div className="text-2xl leading-none">⚡</div>
      <div className="flex-1">
        <h3 className="m-0 mb-1.5 text-[15px] font-bold" style={{ color: "var(--pb-accent)" }}>
          Dia pesado? Comece por aqui
        </h3>
        <p className="m-0 mb-2.5 text-[13px] leading-relaxed" style={{ color: "var(--pb-text)" }}>
          O board está parado há um tempo. Aqui estão tarefas rápidas pra ganhar impulso:
        </p>
        <div className="flex flex-col gap-1.5">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
              style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)" }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDone(c.id);
                }}
                aria-label={`Concluir ${c.title}`}
                title="Marcar como concluída"
                className="flex h-[18px] w-[18px] flex-none cursor-pointer items-center justify-center rounded-full p-0 text-[11px] leading-none"
                style={{ background: "transparent", border: "1px solid var(--pb-border)", color: "var(--pb-text-dim)" }}
              >
                ✓
              </button>
              <span onClick={() => openTask(c.id)} className="flex-1 cursor-pointer text-[12.5px]" style={{ color: "var(--pb-text)" }}>
                {c.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => dismiss()}
        aria-label="Ignorar sugestão de vitórias rápidas"
        title="Ignorar por hoje"
        className="flex-none cursor-pointer rounded-md px-3 py-1.5 text-[12.5px] font-medium"
        style={{ background: "transparent", color: "var(--pb-text-dim)", border: "1px solid var(--pb-border)" }}
      >
        Ignorar
      </button>
    </div>
  );
}
