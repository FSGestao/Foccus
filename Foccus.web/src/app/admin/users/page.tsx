import { createAdminClient } from "@/lib/supabase/admin";
import { CreateUserForm } from "@/components/admin/create-user-form";

export default async function AdminUsersPage() {
  // Lista todo mundo — precisa do client privilegiado porque não existe (e não deve
  // existir) uma policy de RLS que deixe um usuário ver a linha de outro.
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, user_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <section>
        <h2 className="text-base font-medium mb-4">Novo usuário</h2>
        <CreateUserForm />
      </section>

      <section>
        <h2 className="text-base font-medium mb-4">Usuários cadastrados</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">E-mail</th>
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Papel</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2 pr-4">{p.email}</td>
                <td className="py-2 pr-4">{p.user_name || "—"}</td>
                <td className="py-2 pr-4">{p.role}</td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={3} className="py-4 text-zinc-500">
                  Nenhum usuário cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
