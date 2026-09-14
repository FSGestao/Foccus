"use client";

import { useState } from "react";
import { HOW_TO_SECTIONS } from "@/lib/help/content";

// Mesmo layout de modal do resto do sistema (glass card centralizado, blur no
// fundo), mas em formato carrossel — pedido do usuário, 2026-09-14: "pílulas
// de info" que o usuário vai passando pro lado até terminar, uma seção por
// vez, em vez de tudo rolando numa lista só. Serve dois gatilhos com o mesmo
// componente: o popup automático de boas-vindas (1x por usuário, ver
// app-shell.tsx) e o item "Como usar" do menu lateral — o conteúdo é sempre o
// mesmo (src/lib/help/content.ts), só muda quem chamou onClose.
export function HowToModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const total = HOW_TO_SECTIONS.length;
  const isLast = step === total - 1;
  const section = HOW_TO_SECTIONS[step];

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
        aria-label="Como usar o Foccus"
        className="flex w-full max-w-xl flex-col gap-5 rounded-xl p-8"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(24px) saturate(200%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
          maxHeight: "min(680px, 88vh)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">🧭</span>
          <div>
            <h2 className="m-0 text-base font-semibold" style={{ color: "var(--pb-text)" }}>
              Como usar o Foccus
            </h2>
            <p className="m-0 text-[12px]" style={{ color: "var(--pb-text-muted)" }}>
              {step + 1} de {total} — pode reabrir a qualquer momento pelo menu.
            </p>
          </div>
        </div>

        {/* Pílulas de progresso: clicáveis, pulam direto pra seção — a
            atual fica mais larga/preenchida, as outras viram traço fino. */}
        <div className="flex gap-1.5">
          {HOW_TO_SECTIONS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Ir para "${s.title}"`}
              aria-current={i === step}
              className="h-1.5 flex-1 rounded-full transition-all"
              style={{
                background: i === step ? "var(--pb-accent)" : i < step ? "var(--pb-accent-bg)" : "var(--pb-border)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <div key={section.title} className="flex min-h-[260px] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none"
              style={{ background: "var(--pb-accent-bg)" }}
            >
              {section.icon}
            </span>
            <span className="text-[16px] font-bold" style={{ color: "var(--pb-text)" }}>
              {section.title}
            </span>
          </div>

          {/* Passos numerados com selo redondo (não <ol> nativo — o reset do
              Tailwind zera list-style, os números somem) — cada um indentado
              a partir do selo, pra ficar fácil de escanear (pedido do
              usuário, 2026-09-14: texto "confuso", pediu identação). */}
          <div className="flex flex-col gap-3.5 pl-0.5">
            {section.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ background: "var(--pb-accent-bg)", color: "var(--pb-accent)" }}
                >
                  {i + 1}
                </span>
                <p className="m-0 text-[14px] leading-relaxed" style={{ color: "var(--pb-text)" }}>
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-md px-3.5 py-2.5 text-sm font-medium"
            style={{
              cursor: step === 0 ? "default" : "pointer",
              color: step === 0 ? "var(--pb-text-dim)" : "var(--pb-text)",
              background: "transparent",
              border: "1px solid var(--pb-border)",
              opacity: step === 0 ? 0.5 : 1,
            }}
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onClose() : setStep((s) => Math.min(total - 1, s + 1)))}
            className="flex-1 cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold"
            style={{ color: "#fff", background: "var(--pb-accent)", border: "none" }}
          >
            {isLast ? "OK, entendi" : "Avançar →"}
          </button>
        </div>
      </div>
    </div>
  );
}
