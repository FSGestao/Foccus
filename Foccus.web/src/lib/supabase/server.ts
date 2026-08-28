import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client de servidor — usado em Server Components e Route Handlers. `cookies()` é
// assíncrono desde o Next 15 e continua assim (sem fallback síncrono) no Next 16.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component (sem permissão de escrever
            // cookie) — inofensivo, porque o proxy.ts já cuida de renovar a sessão
            // a cada request.
          }
        },
      },
    },
  );
}
