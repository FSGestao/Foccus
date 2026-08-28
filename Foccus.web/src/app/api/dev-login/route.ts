import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Atalho SÓ de desenvolvimento pra logar sem depender de e-mail (SMTP ainda não
// configurado — ver TODO em .claude ou pedir pro usuário: falta configurar
// Resend/SMTP no painel do Supabase pra liberar o fluxo real de código por
// e-mail em qualquer dispositivo).
//
// Gera um magic link via Admin API (service-role, nunca exposto ao cliente) e
// redireciona o navegador direto pra ele — pula o envio de e-mail inteiramente.
// Bloqueado com 404 fora de development: isso NUNCA pode existir em produção.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "faltou ?email=" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { origin } = request.nextUrl;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.properties?.action_link) {
    return NextResponse.json(
      { error: error?.message ?? "falha ao gerar link" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(data.properties.action_link);
}
