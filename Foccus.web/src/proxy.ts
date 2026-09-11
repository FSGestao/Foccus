import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renomeou middleware.ts -> proxy.ts (e a função exportada middleware -> proxy).
// Roda em runtime Node.js sempre (não é mais configurável) — o que é bom pra nós,
// já que o cookie handling do @supabase/ssr funciona melhor em Node do que em Edge.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() valida a assinatura do JWT a cada request (diferente de getSession(),
  // que pode devolver um token expirado sem revalidar) — é a checagem recomendada
  // pra proteger rotas em middleware/proxy.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const { pathname } = request.nextUrl;
  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    // Rota de integração externa (src/app/api/integrations/tasks/route.ts)
    // tem sua própria autenticação por chave (INTEGRATION_API_KEY) — o
    // chamador nunca tem cookie de sessão do Supabase, então sem isso o
    // proxy redirecionava toda chamada pra /login antes mesmo de a rota
    // rodar (achado ao testar em produção, 2026-09-11).
    pathname.startsWith("/api/integrations");

  if (!claims && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Acesso revogado (ver 0010_deactivate_users.sql) — o claim vem do hook de
  // JWT, então não precisa de consulta extra ao banco aqui.
  if (claims && !isPublicPath) {
    const disabled = (claims.app_metadata as { user_disabled?: boolean } | undefined)?.user_disabled;
    if (disabled) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "account_disabled");
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    const role = (claims?.app_metadata as { user_role?: string } | undefined)?.user_role;
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = claims ? "/" : "/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
