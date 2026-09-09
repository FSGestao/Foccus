import type { Task } from "./types";
import type { Project } from "@/lib/projects/types";
import { relevantDateFor } from "./list-filters";

// Data local, não UTC — ver mesma correção em lib/assistant/compute.ts.
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// atrasada > hoje > tem data > sem data — mesma régua do `sortTasks` legado
// (Foccus.dc.html:2600-2620).
function urgencyRank(task: Task, today: string): number {
  if (!task.due_date) return 3;
  if (task.due_date < today) return 0;
  if (task.due_date === today) return 1;
  return 2;
}

// Não concluídas primeiro (por urgência de data, depois prioridade — 'P1' <
// 'P4' já ordena certo como string). Concluídas/canceladas por último, mais
// recente primeiro.
export function sortTasks(tasks: Task[]): Task[] {
  const today = todayISO();
  const pending = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");
  const done = tasks.filter((t) => t.status === "DONE" || t.status === "CANCELLED");

  pending.sort((a, b) => {
    const rankDiff = urgencyRank(a, today) - urgencyRank(b, today);
    if (rankDiff !== 0) return rankDiff;
    return a.priority.localeCompare(b.priority);
  });

  done.sort((a, b) => {
    const aDate = a.completed_at ?? a.updated_at;
    const bDate = b.completed_at ?? b.updated_at;
    return bDate.localeCompare(aDate);
  });

  return [...pending, ...done];
}

const PRIORITY_RANK: Record<Task["priority"], number> = { P1: 0, P2: 1, P3: 2, P4: 3 };

// Suborganização "Prioridade > Prazo > Projeto" a pedido do usuário
// (2026-09-09) pras visualizações agrupadas por Projeto/Prioridade/Prazo
// (Kanban e Minha Lista) — dentro de cada grupo, ordena por essas 3 chaves em
// cascata (a próxima só desempata quando a anterior empata), em vez da
// urgência de data que sortTasks usa na lista corrida sem agrupamento.
// Concluídas/canceladas continuam por último, mais recente primeiro — mesmo
// critério de sortTasks, só a parte "pendente" muda de régua.
export function sortTasksByPriorityDueProject(tasks: Task[], projects: Project[]): Task[] {
  const projectRank = new Map(projects.map((p) => [p.id, PRIORITY_RANK[p.priority]]));
  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  const pending = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");
  const done = tasks.filter((t) => t.status === "DONE" || t.status === "CANCELLED");

  pending.sort((a, b) => {
    const prioDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (prioDiff !== 0) return prioDiff;

    const dueA = relevantDateFor(a);
    const dueB = relevantDateFor(b);
    if (dueA !== dueB) {
      if (!dueA) return 1; // sem prazo vai por último
      if (!dueB) return -1;
      return dueA < dueB ? -1 : 1;
    }

    // Empate de prioridade e prazo: desempata pela prioridade do projeto
    // (P1 primeiro — mesmo critério de sortProjectsByPriority), depois nome.
    // Sem projeto (Inbox) fica por último, como classificação mais baixa.
    const rankA = a.project_id ? (projectRank.get(a.project_id) ?? 99) : 99;
    const rankB = b.project_id ? (projectRank.get(b.project_id) ?? 99) : 99;
    if (rankA !== rankB) return rankA - rankB;

    const nameA = a.project_id ? (projectName.get(a.project_id) ?? "") : "";
    const nameB = b.project_id ? (projectName.get(b.project_id) ?? "") : "";
    return nameA.localeCompare(nameB);
  });

  done.sort((a, b) => {
    const aDate = a.completed_at ?? a.updated_at;
    const bDate = b.completed_at ?? b.updated_at;
    return bDate.localeCompare(aDate);
  });

  return [...pending, ...done];
}

export function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "DONE" || task.status === "CANCELLED") return false;
  return task.due_date < todayISO();
}

export function isDueToday(task: Task): boolean {
  return task.due_date === todayISO();
}
