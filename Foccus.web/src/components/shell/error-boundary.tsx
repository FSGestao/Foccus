"use client";

import { Component, type ReactNode } from "react";
import { reportClientError } from "@/lib/error-reporting";

// Error Boundary precisa ser componente de classe (React não tem o
// equivalente em hooks) — envolve o conteúdo de dentro do app-shell, então
// um crash de render em qualquer tela não derruba o header/sidebar junto.
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    reportClientError(error.message, error.stack, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center"
          style={{ color: "var(--pb-text)" }}
        >
          <h1 className="text-lg font-semibold">Algo deu errado</h1>
          <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
            A tela travou de forma inesperada. O erro já foi registrado — tente recarregar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ background: "var(--pb-accent)", color: "#fff" }}
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
