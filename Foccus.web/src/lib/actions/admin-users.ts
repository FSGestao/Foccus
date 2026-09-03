"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { success: true } | { success: false; error: string };

async function assertCallerIsAdmin() {
  // Não confia só no proxy.ts (que já bloqueia /admin/* por role) — revalida aqui
  // dentro da própria Server Action, já que ela pode em tese ser chamada de outros
  // lugares no futuro.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }

  return user;
}

// Convida um e-mail (allowlist), não cria mais a conta na hora — login é
// Google, então o Supabase gera o auth.users sozinho no primeiro login. A
// conta de verdade (auth.users + profiles) só nasce quando esse e-mail loga
// com Google pela primeira vez (ver src/app/auth/callback/route.ts), que
// confere esta allowlist antes de deixar a conta existir.
export async function inviteUserAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const caller = await assertCallerIsAdmin();

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const userName = String(formData.get("userName") ?? "").trim();

    if (!email) {
      return { success: false, error: "Informe um e-mail." };
    }

    // Client com a chave secreta (sb_secret_...) — só usado aqui, dentro de código
    // server-only, nunca chega ao navegador.
    const admin = createAdminClient();

    // upsert (não insert): reconvidar um e-mail que já existe na allowlist reseta
    // consumed_at pra null, mesmo que já tivesse sido usado antes — cobre o caso de
    // um admin apagar a conta de alguém (Authentication > Users) e querer liberar o
    // acesso de novo, sem precisar mexer no SQL Editor.
    const { error: inviteError } = await admin.from("allowed_emails").upsert(
      {
        email,
        user_name: userName,
        invited_by: caller.id,
        consumed_at: null,
      },
      { onConflict: "email" },
    );

    if (inviteError) {
      return { success: false, error: inviteError.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}
