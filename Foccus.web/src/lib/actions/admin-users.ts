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
}

export async function createUserAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await assertCallerIsAdmin();

    const email = String(formData.get("email") ?? "").trim();
    const userName = String(formData.get("userName") ?? "").trim();

    if (!email) {
      return { success: false, error: "Informe um e-mail." };
    }

    // Client com a chave secreta (sb_secret_...) — só usado aqui, dentro de código
    // server-only, nunca chega ao navegador.
    const admin = createAdminClient();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createError || !created.user) {
      return {
        success: false,
        error: createError?.message ?? "Falha ao criar o usuário no Supabase Auth.",
      };
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: created.user.id,
      email,
      role: "user",
      user_name: userName,
    });

    if (profileError) {
      return { success: false, error: `Usuário criado, mas falhou ao gravar o perfil: ${profileError.message}` };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}
