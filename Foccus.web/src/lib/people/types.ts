// Espelha as colunas de `public.people` (Foccus.web/supabase/migrations/0001_schema.sql).

export type PersonStatus = "ACTIVE" | "INACTIVE";

export type Person = {
  id: string;
  user_id: string;
  name: string;
  role: string | null;
  status: PersonStatus;
  created_at: string;
};

export type NewPersonInput = {
  name: string;
  role?: string;
};
