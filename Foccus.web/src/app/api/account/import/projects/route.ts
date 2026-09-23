import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCSV, rowsToRecords } from "@/lib/csv/csv";
import type { ProjectStatus } from "@/lib/projects/types";
import type { Priority } from "@/lib/tasks/types";
import { PROJECT_COLOR_SWATCHES } from "@/lib/projects/constants";

const VALID_STATUS: ProjectStatus[] = ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];
const VALID_PRIORITY: Priority[] = ["P1", "P2", "P3", "P4"];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// Importa projetos de um CSV com as colunas do export ao lado
// (/api/account/export/csv/projects): Nome, Prioridade, Status, Cor, Prazo.
// Só "Nome" é obrigatório — cada linha vira um projeto NOVO (não casa com
// projeto existente pelo nome).
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
  const toInsert: {
    user_id: string;
    name: string;
    priority: Priority;
    status: ProjectStatus;
    color: string;
    due_date: string | null;
  }[] = [];

  records.forEach((record, i) => {
    const line = i + 2;
    const name = (record["Nome"] ?? "").trim();
    if (!name) {
      warnings.push(`Linha ${line}: sem Nome, ignorada.`);
      return;
    }
    const priorityRaw = (record["Prioridade"] ?? "").trim().toUpperCase() as Priority;
    const priority = VALID_PRIORITY.includes(priorityRaw) ? priorityRaw : "P3";
    const statusRaw = (record["Status"] ?? "").trim().toUpperCase() as ProjectStatus;
    const status = VALID_STATUS.includes(statusRaw) ? statusRaw : "ACTIVE";
    const colorRaw = (record["Cor"] ?? "").trim();
    const color = HEX_COLOR.test(colorRaw) ? colorRaw : PROJECT_COLOR_SWATCHES[0];
    toInsert.push({
      user_id: user.id,
      name,
      priority,
      status,
      color,
      due_date: record["Prazo"]?.trim() || null,
    });
  });

  if (toInsert.length === 0) {
    return NextResponse.json({ imported: 0, warnings: [...warnings, "Nenhuma linha válida encontrada."] });
  }

  const { error } = await supabase.from("projects").insert(toInsert);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: toInsert.length, warnings });
}
