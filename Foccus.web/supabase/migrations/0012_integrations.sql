-- Integração com o sistema externo de gestão de desenvolvimento pessoal
-- (ver docs/INTEGRATIONS.md). Duas pontas:
--   1. Entrada: POST /api/integrations/tasks cria tarefas atribuídas a um
--      usuário real do Foccus (por email), não um usuário de serviço único.
--   2. Saída: trigger nesta migration dispara um webhook (pg_net) sempre que
--      status/progresso/prazo de uma tarefa muda, pro outro sistema saber o
--      andamento. A URL/segredo ainda não existem (o outro sistema não tem
--      endpoint pronto) — ficam numa tabela de config, não hardcoded, e o
--      trigger não faz nada enquanto 'webhook_url' estiver vazia. Configurar
--      depois com:
--        update public.integration_settings set value = 'https://...' where key = 'webhook_url';
--        update public.integration_settings set value = 'segredo-aqui'  where key = 'webhook_secret';

-- 1) Vínculo com o registro do outro sistema, pra mapear o webhook de volta.
alter table public.tasks add column if not exists external_id text;
create index if not exists tasks_external_id_idx on public.tasks(external_id) where external_id is not null;

-- 2) Configuração do webhook de saída — sem policy pra authenticated/anon
-- (mesmo padrão de error_logs na 0011), só service_role (createAdminClient
-- ou o trigger abaixo, que roda como security definer) lê/escreve.
create table public.integration_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
insert into public.integration_settings (key, value) values
  ('webhook_url', null),
  ('webhook_secret', null)
on conflict (key) do nothing;
alter table public.integration_settings enable row level security;

-- 3) Webhook de saída via pg_net (já disponível em todo projeto Supabase).
create extension if not exists pg_net;

create or replace function public.notify_task_integration_webhook()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_secret text;
begin
  -- Em update, só notifica se algo relevante pro outro sistema mudou —
  -- evita disparo a cada toque irrelevante (ex.: renomear a tarefa).
  if TG_OP = 'UPDATE'
     and NEW.status is not distinct from OLD.status
     and NEW.progress_pct is not distinct from OLD.progress_pct
     and NEW.due_date is not distinct from OLD.due_date then
    return NEW;
  end if;

  select value into v_url from public.integration_settings where key = 'webhook_url';
  if v_url is null or v_url = '' then
    return NEW; -- integração de saída ainda não configurada, no-op
  end if;
  select value into v_secret from public.integration_settings where key = 'webhook_secret';

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Foccus-Webhook-Secret', coalesce(v_secret, '')
    ),
    body := jsonb_build_object(
      'task_id', NEW.id,
      'external_id', NEW.external_id,
      'title', NEW.title,
      'status', NEW.status,
      'progress_pct', NEW.progress_pct,
      'due_date', NEW.due_date,
      'updated_at', NEW.updated_at
    )
  );

  return NEW;
end;
$$;

drop trigger if exists tasks_integration_webhook on public.tasks;
create trigger tasks_integration_webhook
  after insert or update on public.tasks
  for each row execute function public.notify_task_integration_webhook();
