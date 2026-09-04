-- Monitoramento de erros — versão sem serviço externo (Sentry etc. exigiria
-- conta/DSN próprios). Erros do cliente (render crash, exceção não tratada,
-- promise rejeitada) são enviados por src/app/api/log-error/route.ts e
-- ficam disponíveis só pra admin em /admin/errors.

create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  stack text,
  url text,
  user_agent text,
  context jsonb
);
create index error_logs_created_idx on public.error_logs(created_at desc);

alter table public.error_logs enable row level security;
-- De propósito, nenhuma policy (mesmo padrão de allowed_emails na 0007): nem
-- authenticated nem anon devem ler/escrever direto na tabela. Toda
-- leitura/escrita passa por createAdminClient() em código server-only
-- (src/app/api/log-error/route.ts grava, src/app/admin/errors/page.tsx lê).
