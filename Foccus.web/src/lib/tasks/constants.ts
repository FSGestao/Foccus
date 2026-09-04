import type { Priority, TaskStatus } from "./types";

export const PRIORITY_OPTIONS: Priority[] = ["P1", "P2", "P3", "P4"];

// Mesmas cores do legado (Foccus.dc.html, PRIORITY_COLOR) — mantidas como
// referência visual reconhecível pra quem já usa o sistema atual.
export const PRIORITY_COLOR: Record<Priority, string> = {
  P1: "#ef4444",
  P2: "#f97316",
  P3: "#eab308",
  P4: "#6b7280",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  INBOX: "Inbox",
  TODO: "A Fazer",
  IN_PROGRESS: "Em andamento",
  WAITING: "Aguardando",
  BLOCKED: "Bloqueada",
  DONE: "Concluída",
  CANCELLED: "Cancelada",
};

// Ícone e cor por status (Foccus.dc.html: STATUS_ICON/STATUS_COLOR) — usados
// tanto no select de Status do painel de detalhe quanto no badge de cada
// linha da lista, pra identificar o status de relance.
export const STATUS_ICON: Record<TaskStatus, string> = {
  INBOX: "📥",
  TODO: "○",
  IN_PROGRESS: "◐",
  WAITING: "⏳",
  BLOCKED: "⛔",
  DONE: "✓",
  CANCELLED: "⨯",
};

export const STATUS_COLOR: Record<TaskStatus, string> = {
  INBOX: "var(--pb-text-dim)",
  TODO: "var(--pb-text-dim)",
  IN_PROGRESS: "var(--pb-accent)",
  WAITING: "var(--pb-yellow)",
  BLOCKED: "#ef4444",
  DONE: "#10b981",
  CANCELLED: "var(--pb-text-dim)",
};

// Cor sólida (hex) por status, usada só pro tint das colunas do Kanban "com
// cores" (Foccus.dc.html: STATUS_TINT_HEX) — precisa ser hex de verdade (não
// var(--pb-*)) porque vira rgba() pro degradê de fundo da coluna.
export const STATUS_TINT_HEX: Record<TaskStatus, string> = {
  INBOX: "#94a3b8",
  TODO: "#38bdf8",
  IN_PROGRESS: "#0e9aa7",
  WAITING: "#ffa600",
  BLOCKED: "#ef4444",
  DONE: "#22c55e",
  CANCELLED: "#94a3b8",
};

// INBOX fica de fora das opções do select — igual ao legado desde a v3.4.0
// (DOCUMENTACAO_TECNICA.md v3.4.0), tarefas novas já nascem TODO.
export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: `${STATUS_ICON.TODO} ${STATUS_LABEL.TODO}` },
  { value: "IN_PROGRESS", label: `${STATUS_ICON.IN_PROGRESS} ${STATUS_LABEL.IN_PROGRESS}` },
  { value: "WAITING", label: `${STATUS_ICON.WAITING} ${STATUS_LABEL.WAITING}` },
  { value: "BLOCKED", label: `${STATUS_ICON.BLOCKED} ${STATUS_LABEL.BLOCKED}` },
  { value: "DONE", label: `${STATUS_ICON.DONE} ${STATUS_LABEL.DONE}` },
  { value: "CANCELLED", label: `${STATUS_ICON.CANCELLED} ${STATUS_LABEL.CANCELLED}` },
];
