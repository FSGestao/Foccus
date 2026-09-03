"use client";

import { useState } from "react";
import type { Person } from "@/lib/people/types";

export function PersonModal({
  person,
  onClose,
  onSubmit,
}: {
  person?: Person;
  onClose: () => void;
  onSubmit: (patch: { name: string; role?: string }) => void;
}) {
  const [name, setName] = useState(person?.name ?? "");
  const [role, setRole] = useState(person?.role ?? "");

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, role: role.trim() });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-[10px] p-6"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
          color: "var(--pb-text)",
        }}
      >
        <h2 className="text-base font-semibold">{person ? "Editar pessoa" : "Nova pessoa"}</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Nome</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") onClose();
            }}
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Papel (opcional)</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ex.: Financeiro"
            className="rounded-md px-3 py-2 text-sm"
            style={{ border: "1px solid var(--pb-border)", background: "var(--pb-surface-subtle)" }}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-sm px-3 py-2">
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-md px-3 py-2 text-sm font-medium"
            style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
          >
            {person ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
