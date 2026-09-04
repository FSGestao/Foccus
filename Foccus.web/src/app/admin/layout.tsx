import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Segunda camada de proteção além do proxy.ts — se algum dia o proxy for
// contornado/removido por engano, esta checagem ainda impede acesso não-admin.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4 flex items-center gap-6">
        <h1 className="text-lg font-semibold">Administração — Foccus</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/users" className="underline">
            Usuários
          </Link>
          <Link href="/admin/errors" className="underline">
            Erros
          </Link>
        </nav>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
