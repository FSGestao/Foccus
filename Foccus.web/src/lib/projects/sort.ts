import type { Project } from "./types";

const PRIORITY_RANK: Record<Project["priority"], number> = { P1: 0, P2: 1, P3: 2, P4: 3 };

// P1 na frente, depois P2, P3, P4, a pedido do usuário (2026-09-04). Dentro da
// mesma prioridade mantém a ordem em que a lista já veio (mais recente
// primeiro — ver projects-store.ts) porque Array.sort é estável.
export function sortProjectsByPriority(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}
