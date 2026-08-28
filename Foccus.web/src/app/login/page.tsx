import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-xl font-semibold">Entrar no Foccus</h1>
      <LoginForm />
      {/* TODO(sereno44592@gmail.com): remover este atalho de teste assim que o
          SMTP (Resend) estiver configurado e o login por código via e-mail
          estiver validado ponta a ponta. A rota já se bloqueia sozinha em
          produção, mas o link não deveria continuar aqui indefinidamente. */}
      {process.env.NODE_ENV !== "production" && (
        <a
          href="/api/dev-login?email=sereno44592@gmail.com"
          className="text-xs text-zinc-400 underline"
        >
          [dev] entrar sem e-mail (bypass temporário)
        </a>
      )}
    </div>
  );
}
