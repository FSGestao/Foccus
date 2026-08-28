import { createBrowserClient } from "@supabase/ssr";

// Client de navegador — usado em Client Components (stores Zustand, formulários,
// mutações otimistas). A chave aqui é a publicável (sb_publishable_...), segura pra
// expor: quem protege os dados de verdade é o RLS no banco, não o sigilo desta chave.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
