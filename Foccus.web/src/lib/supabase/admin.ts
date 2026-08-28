import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client privilegiado (service_role / sb_secret_...) — ignora RLS por completo.
// `import "server-only"` faz o build FALHAR se algum Client Component importar este
// arquivo por engano, em vez de vazar a chave secreta pro bundle do navegador em
// silêncio. Só é usado nas Server Actions de administração de usuários
// (src/lib/actions/admin-users.ts).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
