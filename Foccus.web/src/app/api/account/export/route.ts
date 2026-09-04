import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exportação de dados (LGPD, art. 18) — cada usuário baixa tudo que é dele
// num JSON só. Usa o client normal (cookie da própria sessão), então RLS já
// garante que só vem linha do dono — não precisa filtrar user_id manualmente.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [profile, projects, people, tasks, projectNotes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("projects").select("*"),
    supabase.from("people").select("*"),
    supabase.from("tasks").select("*"),
    supabase.from("project_notes").select("*"),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    profile: profile.data,
    projects: projects.data ?? [],
    people: people.data ?? [],
    tasks: tasks.data ?? [],
    project_notes: projectNotes.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="foccus-dados-${user.id}.json"`,
    },
  });
}
