// Espelha as colunas de `public.project_notes` (0001_schema.sql).

export type ProjectNote = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string | null;
  text: string;
  recorded_at: string;
  reference_date: string | null;
};

export type NewNoteInput = {
  title?: string;
  text: string;
  project_id: string | null;
  reference_date?: string | null;
  recorded_at?: string;
};
