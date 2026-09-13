import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { ThemeInit } from "@/components/auth/theme-init";

const ERROR_MESSAGES: Record<string, string> = {
  not_invited:
    "Esse e-mail ainda não foi convidado. Peça pra um administrador te cadastrar.",
  invalid_link: "Link inválido ou expirado. Tente entrar de novo.",
  provisioning_failed: "Falha ao criar sua conta. Tente novamente ou avise um administrador.",
  account_disabled: "Seu acesso foi desativado por um administrador.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERROR_MESSAGES[error] : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: "24px 16px",
        background: "var(--pb-bg)",
        backgroundImage: "var(--pb-bg-gradient)",
        backgroundAttachment: "fixed",
        color: "var(--pb-text)",
      }}
    >
      {/* Mesma paleta --pb-* do resto do app (Foccus.dc.html:49-150 via
          app-shell.tsx) — antes o login ficava fora do tema, preto e branco
          (--background/--foreground padrão do Next.js), destoando do sistema. */}
      <ThemeInit />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "var(--pb-accent)",
            color: "var(--pb-on-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          F
        </span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>Foccus</span>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--pb-glass-strong)",
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          border: "1px solid var(--pb-border)",
          borderRadius: 14,
          boxShadow: "0 12px 36px rgba(0,0,0,0.14)",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: "var(--pb-text)", margin: 0 }}>
            Entrar no Foccus
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--pb-text-muted)", marginTop: 4 }}>
            Gestão de Pauta e Projetos
          </p>
        </div>

        {message && (
          <p style={{ fontSize: 12.5, color: "var(--pb-red)", textAlign: "center", margin: 0 }}>
            {message}
          </p>
        )}

        <GoogleLoginButton />

        <p style={{ fontSize: 11, color: "var(--pb-text-dim)", textAlign: "center", margin: 0 }}>
          Ao entrar, você concorda com os{" "}
          <Link href="/terms" style={{ color: "var(--pb-accent)" }}>
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacy" style={{ color: "var(--pb-accent)" }}>
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
