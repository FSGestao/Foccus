import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-xl font-semibold">Entrar no Foccus</h1>
      {message && <p className="text-sm text-red-600 max-w-sm text-center">{message}</p>}
      <GoogleLoginButton />
      <p className="text-xs text-zinc-500">
        Ao entrar, você concorda com os{" "}
        <Link href="/terms" className="underline">
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link href="/privacy" className="underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
