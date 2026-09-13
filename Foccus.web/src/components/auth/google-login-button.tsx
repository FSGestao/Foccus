"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// "G" oficial (4 cores) — mantido fixo independente do tema claro/escuro,
// como recomenda o guia de marca do Google pra botões de login.
function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function GoogleLoginButton() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    // Em caso de sucesso o navegador é redirecionado pro Google — só chega
    // aqui de volta se a chamada falhou antes de sair da página.
    if (error) {
      setLoading(false);
      setError("Não foi possível iniciar o login com Google. Tente novamente.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          cursor: loading ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          padding: "9px 14px",
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--pb-text)",
          background: "var(--pb-surface)",
          border: "1px solid var(--pb-border)",
          borderRadius: 8,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <GoogleIcon />
        {loading ? "Redirecionando..." : "Entrar com Google"}
      </button>
      {error && (
        <p style={{ fontSize: 12.5, color: "var(--pb-red)", textAlign: "center", margin: 0 }}>{error}</p>
      )}
    </div>
  );
}
