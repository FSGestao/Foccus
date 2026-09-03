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
