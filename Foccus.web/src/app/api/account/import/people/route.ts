import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCSV, rowsToRecords } from "@/lib/csv/csv";
import type { PersonStatus } from "@/lib/people/types";

const VALID_STATUS: PersonStatus[] = ["ACTIVE", "INACTIVE"];

// Importa pessoas de um CSV com as colunas do export ao lado
// (/api/account/export/csv/people): Nome, Papel, Empresa, Setor, Status.
// Só "Nome" é obrigatório — cada linha vira uma pessoa NOVA (não tenta casar
// com pessoa existente pelo nome, pra não sobrescrever cadastro por engano).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const text = await request.text();
  if (!text.trim()) {
    return NextResponse.json({ error: "Arquivo CSV vazio." }, { status: 400 });
  }

  const records = rowsToRecords(parseCSV(text));
  const warnings: string[] = [];
  const toInsert: { user_id: string; name: string; role: string | null; company: string | null; sector: string | null; status: PersonStatus }[] = [];

  records.forEach((record, i) => {
    const line = i + 2; // +1 do header, +1 pra contar a partir de 1
    const name = (record["Nome"] ?? "").trim();
    if (!name) {
      warnings.push(`Linha ${line}: sem Nome, ignorada.`);
      return;
    }
    const statusRaw = (record["Status"] ?? "").trim().toUpperCase() as PersonStatus;
    const status = VALID_STATUS.includes(statusRaw) ? statusRaw : "ACTIVE";
    toInsert.push({
      user_id: user.id,
      name,
      role: record["Papel"]?.trim() || null,
      company: record["Empresa"]?.trim() || null,
      sector: record["Setor"]?.trim() || null,
      status,
    });
  });

  if (toInsert.length === 0) {
    return NextResponse.json({ imported: 0, warnings: [...warnings, "Nenhuma linha válida encontrada."] });
  }

  const { error } = await supabase.from("people").insert(toInsert);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: toInsert.length, warnings });
}
