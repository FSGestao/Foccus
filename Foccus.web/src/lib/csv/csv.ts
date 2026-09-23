// Encode/parse CSV (RFC 4126-ish: vírgula como separador, aspas duplas pra
// campo com vírgula/quebra de linha/aspas, aspas duplicadas dentro do campo).
// Sem lib externa — o projeto não tinha nenhuma (nem papaparse nem csv-parse)
// e o formato é simples o bastante pra não valer a dependência.

export function toCSV(rows: string[][]): string {
  return rows.map((row) => row.map(encodeField).join(",")).join("\r\n");
}

function encodeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  // Normaliza \r\n / \r soltos pra \n antes de percorrer — simplifica o loop
  // (só precisa tratar \n como fim de linha fora de aspas).
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Última linha sem \n final.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

// Linhas -> objetos usando a primeira linha como cabeçalho (trim nos
// cabeçalhos, pra tolerar espaço extra copiado de planilha).
export function rowsToRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const [header, ...rest] = rows;
  const keys = header.map((h) => h.trim());
  return rest.map((row) => {
    const record: Record<string, string> = {};
    keys.forEach((key, i) => {
      record[key] = (row[i] ?? "").trim();
    });
    return record;
  });
}
