import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Dois fluxos passam por aqui:
// 1) token_hash — fallback de quem clica no link mágico do e-mail (fica
//    adormecido enquanto o login é só Google, mas não é removido: volta a valer
//    assim que o OTP por e-mail for reativado, sem precisar reescrever nada).
// 2) code — retorno do OAuth (Google). Depois de trocar o code pela sessão,
//    valida se o e-mail está na allowlist de convite antes de deixar a conta
//    "existir" de verdade (ver 0007_allowed_emails.sql).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(`${origin}/login?error=invalid_link`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.redirect(`${origin}/login?error=invalid_link`);
    }

    // RLS de profiles só deixa o próprio usuário ver a própria linha
    // (id = auth.uid()) — se vier vazio, essa é a primeira vez desse ID.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const email = user.email.toLowerCase();
    const admin = createAdminClient();
    const { data: invite } = await admin
      .from("allowed_emails")
      .select("email, user_name, consumed_at")
      .eq("email", email)
      .maybeSingle();

    if (!invite || invite.consumed_at) {
      // E-mail nunca convidado, ou convite já usado por outro login — não deixa
      // um auth.users órfão pra trás.
      await supabase.auth.signOut();
      await admin.auth.admin.deleteUser(user.id);
      return NextResponse.redirect(`${origin}/login?error=not_invited`);
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: user.id,
      email,
      role: "user",
      user_name: invite.user_name,
    });

    if (profileError) {
      await supabase.auth.signOut();
      await admin.auth.admin.deleteUser(user.id);
      return NextResponse.redirect(`${origin}/login?error=provisioning_failed`);
    }

    await admin
      .from("allowed_emails")
      .update({ consumed_at: new Date().toISOString() })
      .eq("email", email);

    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`);
}
