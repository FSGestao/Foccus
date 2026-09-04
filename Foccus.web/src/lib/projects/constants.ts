import type { ProjectStatus } from "./types";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  COMPLETED: "Concluído",
  ARCHIVED: "Arquivado",
};

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = (
  Object.entries(PROJECT_STATUS_LABEL) as [ProjectStatus, string][]
).map(([value, label]) => ({ value, label }));

// Abas de filtro da tela Projetos (Foccus.dc.html:3128-3134) — "all" mostra
// todo mundo, os demais filtram por `status` exatamente como as chaves.
export type ProjectFilter = "all" | ProjectStatus;

export const PROJECT_FILTER_TABS: { key: ProjectFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "ACTIVE", label: "Ativos" },
  { key: "PAUSED", label: "Pausados" },
  { key: "COMPLETED", label: "Concluídos" },
  { key: "ARCHIVED", label: "Arquivados / Inativos" },
];

// Estilo do badge de status no card (Foccus.dc.html:3170) — cor por status,
// não pela cor do projeto.
export const PROJECT_STATUS_BADGE: Record<ProjectStatus, { color: string; background: string; border: string }> = {
  ACTIVE: { color: "var(--pb-accent)", background: "var(--pb-accent-bg)", border: "1px solid var(--pb-accent)" },
  PAUSED: { color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" },
  COMPLETED: { color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" },
  ARCHIVED: {
    color: "var(--pb-text-dim)",
    background: "var(--pb-surface-subtle)",
    border: "1px solid var(--pb-border)",
  },
};

// Paleta sugerida no criar/editar projeto — mesmo espírito do PROJECT_COLOR
// fixo por id do legado, aqui como opções pro usuário escolher livremente.
export const PROJECT_COLOR_SWATCHES = [
  "#6366f1",
  "#0a7a85",
  "#dc2626",
  "#d97706",
  "#15803d",
  "#7c3aed",
  "#db2777",
  "#6b7280",
];
