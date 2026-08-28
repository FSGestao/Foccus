-- Habilita Realtime (sincronização entre abas/dispositivos) nas tabelas de dado do usuário.
alter publication supabase_realtime add table public.tasks, public.projects, public.people, public.project_notes;
