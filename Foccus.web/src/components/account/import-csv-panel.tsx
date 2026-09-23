"use client";

import { useRef, useState } from "react";

type ImportResult = { imported: number; warnings: string[] } | { error: string };

const TARGETS = [
  { key: "tasks", label: "Tarefas", endpoint: "/api/account/import/tasks" },
  { key: "projects", label: "Projetos", endpoint: "/api/account/import/projects" },
  { key: "people", label: "Pessoas", endpoint: "/api/account/import/people" },
] as const;

// Importação de CSV (pedido do usuário, 2026-09-23) — cada linha do arquivo
// vira um registro NOVO (não tenta casar/atualizar pelo nome), então
// reimportar o mesmo CSV duas vezes duplica. As colunas esperadas são as
// mesmas do export CSV ao lado (botões "Baixar" na seção acima).
export function ImportCsvPanel() {
  const [results, setResults] = useState<Partial<Record<(typeof TARGETS)[number]["key"], ImportResult>>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleFile(target: (typeof TARGETS)[number], file: File) {
    setLoading(target.key);
    setResults((prev) => ({ ...prev, [target.key]: undefined }));
    try {
      const text = await file.text();
      const res = await fetch(target.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/csv; charset=utf-8" },
        body: text,
      });
      const json = (await res.json()) as ImportResult;
      setResults((prev) => ({ ...prev, [target.key]: json }));
    } catch {
      setResults((prev) => ({ ...prev, [target.key]: { error: "Falha ao ler/enviar o arquivo." } }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {TARGETS.map((target) => {
        const result = results[target.key];
        return (
          <div key={target.key} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 shrink-0 text-sm" style={{ color: "var(--pb-text)" }}>
                {target.label}
              </span>
              <input
                ref={(el) => {
                  inputRefs.current[target.key] = el;
                }}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(target, file);
                }}
                className="text-xs"
                style={{ color: "var(--pb-text-muted)" }}
              />
              {loading === target.key && (
                <span className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
                  Importando...
                </span>
              )}
            </div>
            {result && "error" in result && (
              <p className="text-xs" style={{ color: "var(--pb-red)" }}>
                {result.error}
              </p>
            )}
            {result && "imported" in result && (
              <div className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
                <p>{result.imported} registro(s) importado(s).</p>
                {result.warnings.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {result.warnings.map((w, i) => (
                      <li key={i}>⚠ {w}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
