import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Monitoramento de erro sem serviço externo (ver 0011_error_logs.sql) — o
// cliente (error-reporter.tsx / error-boundary.tsx) manda pra cá render
// crashes, exceções não tratadas e promises rejeitadas; grava via
// createAdminClient() porque a tabela não tem policy pra `authenticated`.
export async function POST(request: NextRequest) {
  let body: { message?: unknown; stack?: unknown; url?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = String(body.message ?? "").slice(0, 2000);
  if (!message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Best-effort: se a sessão do usuário estiver disponível, associa o erro a
  // ela; se não, grava mesmo assim (ex.: erro na tela de login) com user_id
  // nulo — monitorar erro não deve exigir estar logado.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // segue sem user_id
  }

  const admin = createAdminClient();
  await admin.from("error_logs").insert({
    user_id: userId,
    message,
    stack: typeof body.stack === "string" ? body.stack.slice(0, 8000) : null,
    url: typeof body.url === "string" ? body.url.slice(0, 500) : null,
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    context:
      body.context && typeof body.context === "object" ? (body.context as Record<string, unknown>) : null,
  });

  return NextResponse.json({ ok: true });
}
