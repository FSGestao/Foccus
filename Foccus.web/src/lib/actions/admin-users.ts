"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { success: true } | { success: false; error: string };

export type AdminProfileRow = {
  id: string;
  email: string;
  user_name: string | null;
  role: "admin" | "user";
  disabled: boolean;
  created_at: string;
};

export type AdminInviteRow = {
  email: string;
  user_name: string | null;
  created_at: string;
};

type AdminUsersData = { profiles: AdminProfileRow[]; invites: AdminInviteRow[] };
type AdminUsersDataResult = { success: true; data: AdminUsersData } | { success: false; error: string };

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

// Revoga (ou devolve) o acesso de alguém sem apagar a conta — os dados
// (tarefas, projetos etc.) continuam intactos. Bloqueia login pelo claim
// `app_metadata.user_disabled` do hook de JWT (0010_deactivate_users.sql),
// verificado no proxy.ts.
export async function setUserDisabledAction(userId: string, disabled: boolean): Promise<ActionResult> {
  try {
    const caller = await assertCallerIsAdmin();

    if (userId === caller.id && disabled) {
      return { success: false, error: "Você não pode desativar a própria conta." };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ disabled }).eq("id", userId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}

// Cancela um convite ainda não usado (remove da allowlist antes do primeiro
// login). Convite já consumido não aparece mais na lista de pendentes, então
// não tem como ser cancelado por aqui — nesse caso é `setUserDisabledAction`.
export async function cancelInviteAction(email: string): Promise<ActionResult> {
  try {
    await assertCallerIsAdmin();

    const admin = createAdminClient();
    const { error } = await admin
      .from("allowed_emails")
      .delete()
      .eq("email", email)
      .is("consumed_at", null);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}

// Lê usuários cadastrados + convites pendentes pro AdminUsersModal (mesmas
// duas consultas que /admin/users já fazia como Server Component — aqui vira
// Server Action porque o modal é aberto por cima da tela atual, sem navegar).
export async function getAdminUsersDataAction(): Promise<AdminUsersDataResult> {
  try {
    await assertCallerIsAdmin();
    const admin = createAdminClient();

    const [{ data: profiles, error: profilesError }, { data: invites, error: invitesError }] = await Promise.all([
      admin
        .from("profiles")
        .select("id, email, user_name, role, disabled, created_at")
        .order("created_at", { ascending: false }),
      admin
        .from("allowed_emails")
        .select("email, user_name, created_at, consumed_at")
        .is("consumed_at", null)
        .order("created_at", { ascending: false }),
    ]);

    if (profilesError) return { success: false, error: profilesError.message };
    if (invitesError) return { success: false, error: invitesError.message };

    return {
      success: true,
      data: { profiles: (profiles ?? []) as AdminProfileRow[], invites: (invites ?? []) as AdminInviteRow[] },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}

// Promove/rebaixa alguém entre 'user' e 'admin' — a peça que faltava (antes só
// dava pra trocar direto no banco). Duas travas além da checagem de admin:
// ninguém altera o próprio papel por aqui (evita se trancar fora sem querer),
// e não é possível remover o último admin do sistema — embora bloquear a
// autoalteração já torne isso praticamente impossível (quem está chamando é
// admin e nunca é o alvo), a checagem fica como segunda camada, mesmo espírito
// do assertCallerIsAdmin não confiar só no proxy.ts.
export async function setUserRoleAction(userId: string, role: "admin" | "user"): Promise<ActionResult> {
  try {
    const caller = await assertCallerIsAdmin();

    if (userId === caller.id) {
      return { success: false, error: "Você não pode alterar o próprio papel." };
    }

    const admin = createAdminClient();

    if (role === "user") {
      const { count, error: countError } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .neq("id", userId);
      if (countError) return { success: false, error: countError.message };
      if (!count || count < 1) {
        return { success: false, error: "Não é possível remover o último administrador." };
      }
    }

    const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}
