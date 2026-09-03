"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center gap-2 border rounded-md py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Redirecionando..." : "Entrar com Google"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
