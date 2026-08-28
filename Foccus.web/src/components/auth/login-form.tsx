"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      // shouldCreateUser:false é a trava principal: só quem o admin já cadastrou
      // consegue pedir um código. Sem isso, qualquer e-mail poderia se autocadastrar.
      options: { shouldCreateUser: false },
    });

    setLoading(false);
    if (error) {
      setError(
        "Não foi possível enviar o código. Confirme que este e-mail foi cadastrado por um administrador.",
      );
      return;
    }
    setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setLoading(false);
    if (error) {
      setError("Código inválido ou expirado. Tente novamente.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (step === "email") {
    return (
      <form onSubmit={handleSendCode} className="flex flex-col gap-4 w-full max-w-sm">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-foreground text-background rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar código"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyCode} className="flex flex-col gap-4 w-full max-w-sm">
      <p className="text-sm text-zinc-500">
        Enviamos um código de 6 dígitos para <strong>{email}</strong>.
      </p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-sm font-medium">
          Código
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          autoFocus
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          className="border rounded-md px-3 py-2 text-sm tracking-widest text-center"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-foreground text-background rounded-md py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Verificando..." : "Entrar"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setError(null);
        }}
        className="text-sm text-zinc-500 underline"
      >
        Usar outro e-mail
      </button>
    </form>
  );
}
