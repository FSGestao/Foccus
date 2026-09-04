"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/error-reporting";

// Sem UI — só registra os dois listeners globais que um Error Boundary não
// cobre (ele só pega crash de render): exceção síncrona não tratada e
// promise rejeitada sem .catch. Montado uma vez no layout raiz, então cobre
// login/admin/(app) por igual.
export function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError(event.message, event.error?.stack);
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      reportClientError(`Promise rejeitada: ${message}`, stack);
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
