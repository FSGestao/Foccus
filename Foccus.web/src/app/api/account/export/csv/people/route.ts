import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "@/lib/people/types";
import { toCSV } from "@/lib/csv/csv";

// Export CSV de pessoas — mesmas colunas que /api/account/import/people
// aceita de volta, pra dar pra editar numa planilha e reimportar.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase.from("people").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const people = (data ?? []) as Person[];

  const rows: string[][] = [["Nome", "Papel", "Empresa", "Setor", "Status"]];
  for (const p of people) {
    rows.push([p.name, p.role ?? "", p.company ?? "", p.sector ?? "", p.status]);
  }

  return new NextResponse(toCSV(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="foccus-pessoas-${user.id}.csv"`,
    },
  });
}
