"use client";

// Porta de Foccus.dc.html:1395-1408 (Ritual de Fechamento).
export function FechamentoModal({
  onClose,
  userFirstName,
  doneTasksToday,
  fechamentoStreak,
}: {
  onClose: () => void;
  userFirstName: string;
  doneTasksToday: number;
  fechamentoStreak: number;
}) {
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
        aria-label="Ritual de Fechamento"
        className="flex w-full max-w-[440px] flex-col gap-4 rounded-xl p-7 text-center"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(24px) saturate(200%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
        }}
      >
        <div className="text-3xl leading-none">🌙</div>
        <div>
          <h2 className="m-0 mb-1.5 text-[17px] font-bold" style={{ color: "var(--pb-text)" }}>
            Excelente trabalho hoje, {userFirstName}!
          </h2>
          <p className="m-0 text-[13.5px] leading-relaxed" style={{ color: "var(--pb-text-muted)" }}>
            Você concluiu {doneTasksToday} tarefa(s) hoje. O que ficou em &quot;Em Progresso&quot; pode esperar até amanhã.
          </p>
        </div>
        <div
          className="rounded-lg px-3.5 py-2.5 text-sm font-semibold"
          style={{ background: "var(--pb-accent-bg)", border: "1px solid var(--pb-accent)", color: "var(--pb-accent)" }}
        >
          🔥 Nível de Foco: {fechamentoStreak} {fechamentoStreak === 1 ? "dia seguido" : "dias seguidos"} fazendo o ritual
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold"
          style={{ color: "#fff", background: "var(--pb-accent)", border: "none" }}
        >
          Fechar o dia
        </button>
      </div>
    </div>
  );
}
