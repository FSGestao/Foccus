// Helper compartilhado por error-reporter.tsx (listeners globais) e
// error-boundary.tsx (render crash) — envia pra /api/log-error sem nunca
// lançar (monitorar erro não pode, ele mesmo, quebrar a tela).
export function reportClientError(message: string, stack?: string, context?: Record<string, unknown>) {
  try {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        stack,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        context,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silencioso de propósito
  }
}
