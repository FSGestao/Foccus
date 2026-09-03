// Espelha as colunas de `public.tasks` (Foccus.web/supabase/migrations/0001_schema.sql).
// Ver Foccus/DOCUMENTACAO_TECNICA.md seção 6 pro shape original do sistema legado
// (Foccus.dc.html) — os nomes aqui são snake_case porque vêm direto do Postgres via
// supabase-js, sem camelCase no meio do caminho.

export type Priority = "P1" | "P2" | "P3" | "P4";

export type TaskStatus =
  | "INBOX"
  | "TODO"
  | "IN_PROGRESS"
  | "WAITING"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type HistoryEntry = {
  date: string;
  desc: string;
};

export type Comment = {
  id: string;
  author: string;
  date: string;
  text: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  tags: string[];
  checklist: ChecklistItem[];
  follow_up_date: string | null;
  waiting_for: string | null;
  waiting_reason: string | null;
  blocked_by: string | null;
  depends_on_task_id: string | null;
  estimated_minutes: number | null;
  progress_pct: number | null;
  due_date: string | null;
  priority: Priority;
  status: TaskStatus;
  parent_task_id: string | null;
  history: HistoryEntry[];
  comments: Comment[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

// Campos aceitos ao criar uma tarefa nova pela tarefa rápida / modal "Nova Tarefa"
// — o resto nasce com o default do banco (status TODO, prioridade P3 etc.), igual
// ao fluxo minimalista de criação do sistema legado (só cresce depois, no painel
// de detalhe).
export type NewTaskInput = {
  title: string;
  priority?: Priority;
  project_id?: string | null;
};
