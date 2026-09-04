"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";

// Nome de exibição do usuário: prioriza `profiles.user_name` (o nome
// informado no cadastro/convite inicial — ver auth/callback/route.ts), com o
// nome/e-mail da conta Google como reserva pra quem ainda não tem isso
// preenchido. Usado no avatar, no cumprimento do header e em "Lista de
// <nome>" — um hook só pra não repetir esse fallback em cada tela.
export function useDisplayName() {
  const profileUserName = useProfileStore((s) => s.userName);
  const [googleName, setGoogleName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setGoogleName((user.user_metadata?.full_name as string | undefined) ?? null);
      setEmail(user.email ?? null);
    });
  }, []);

  const fullName = profileUserName.trim() || googleName || email || "Você";
  const firstName = fullName.split(/\s+/)[0] || "Você";
  const parts = fullName.trim().split(/\s+/);
  const initials =
    parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (fullName[0]?.toUpperCase() ?? "?");

  return { fullName, firstName, initials, email };
}
