"use client";

import type { Person } from "@/lib/people/types";

export function PersonCard({
  person,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  person: Person;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const inactive = person.status === "INACTIVE";

  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-4 text-sm"
      style={{
        background: "var(--pb-glass-card)",
        border: "1px solid var(--pb-border)",
        color: "var(--pb-text)",
        opacity: inactive ? 0.6 : 1,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
        >
          {person.name[0]?.toUpperCase()}
        </span>
        <span className="flex-1 truncate font-semibold">{person.name}</span>
      </div>

      {person.role && (
        <span className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
          {person.role}
        </span>
      )}

      <div className="flex justify-between text-xs">
        <button type="button" onClick={onToggleStatus} style={{ color: "var(--pb-text-muted)" }}>
          {inactive ? "reativar" : "marcar inativa"}
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={onEdit} style={{ color: "var(--pb-accent)" }}>
            editar
          </button>
          <button type="button" onClick={onDelete} style={{ color: "var(--pb-red)" }}>
            excluir
          </button>
        </div>
      </div>
    </div>
  );
}
