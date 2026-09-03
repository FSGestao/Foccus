// Espelha as colunas de `public.projects` (Foccus.web/supabase/migrations/0001_schema.sql).

import type { Priority } from "@/lib/tasks/types";

export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  priority: Priority;
  status: ProjectStatus;
  color: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type NewProjectInput = {
  name: string;
  color: string;
  priority: Priority;
};
