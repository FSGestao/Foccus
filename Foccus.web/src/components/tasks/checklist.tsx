"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/tasks/types";

export function Checklist({
  items,
  onChange,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, { id: crypto.randomUUID(), text, done: false }]);
    setDraft("");
  }

  function toggleItem(id: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggleItem(item.id)}
            className="shrink-0"
          />
          <span
            className="flex-1"
            style={item.done ? { color: "var(--pb-text-dim)", textDecoration: "line-through" } : { color: "var(--pb-text)" }}
          >
            {item.text}
          </span>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-xs"
            style={{ color: "var(--pb-text-dim)" }}
          >
            remover
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="Novo sub-item..."
          className="flex-1 rounded-md px-2 py-1 text-sm"
          style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-md px-2 py-1 text-sm"
          style={{ background: "var(--pb-surface-subtle)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
