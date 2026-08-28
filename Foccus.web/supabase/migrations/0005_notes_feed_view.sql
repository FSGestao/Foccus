-- View que junta anotações de projeto (project_notes) com o campo `notes` de cada
-- tarefa, pra alimentar a view "Anotações" sem duplicar dado em tabela própria.
-- security_invoker=true faz a view rodar com o RLS de quem consulta, não do dono da view.
create view public.notes_feed
  with (security_invoker = true) as
  select id, user_id, project_id, title, text, recorded_at, reference_date, 'manual'::text as source, null::uuid as task_id
  from public.project_notes
  union all
  select id, user_id, project_id, title, notes as text, updated_at as recorded_at, null::date as reference_date, 'task'::text as source, id as task_id
  from public.tasks
  where notes is not null and length(trim(notes)) > 0;
