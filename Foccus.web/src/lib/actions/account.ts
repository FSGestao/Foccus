"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { success: true } | { success: false; error: string };

// Exclusão de conta (LGPD, art. 18, VI) — apaga as linhas do próprio usuário
// nas tabelas de dados, depois a conta em auth.users (o cascade da FK em
// profiles.id -> auth.users já apagaria profiles sozinho nesse momento).
// Chamado a partir de /account.
export async function deleteMyAccountAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const confirmText = String(formData.get("confirm") ?? "").trim();
  if (confirmText !== "EXCLUIR") {
    return { success: false, error: 'Digite "EXCLUIR" pra confirmar.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Não autenticado." };
  }

  // Client normal (RLS-scoped) basta aqui — as policies de delete_own de cada
  // tabela já restringem à linha do próprio usuário.
  const deletions = await Promise.all([
    supabase.from("tasks").delete().eq("user_id", user.id),
    supabase.from("projects").delete().eq("user_id", user.id),
    supabase.from("people").delete().eq("user_id", user.id),
    supabase.from("project_notes").delete().eq("user_id", user.id),
  ]);
  const deleteError = deletions.find((d) => d.error)?.error;
  if (deleteError) {
    return { success: false, error: `Falha ao apagar dados: ${deleteError.message}` };
  }

  // Apagar auth.users (e por cascade, profiles) exige o client privilegiado —
  // RLS não deixa ninguém, nem o próprio dono, apagar a própria linha em
  // profiles ou a própria conta de autenticação.
  const admin = createAdminClient();
  const { error: userError } = await admin.auth.admin.deleteUser(user.id);
  if (userError) {
    return { success: false, error: `Falha ao apagar a conta: ${userError.message}` };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
