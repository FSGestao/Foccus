import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/projects/types";
import { toCSV } from "@/lib/csv/csv";

// Export CSV de projetos — mesmas colunas que /api/account/import/projects
// aceita de volta, pra dar pra editar numa planilha e reimportar.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const projects = (data ?? []) as Project[];

  const rows: string[][] = [["Nome", "Prioridade", "Status", "Cor", "Prazo"]];
  for (const p of projects) {
    rows.push([p.name, p.priority, p.status, p.color, p.due_date ?? ""]);
  }

  return new NextResponse(toCSV(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="foccus-projetos-${user.id}.csv"`,
    },
  });
}
