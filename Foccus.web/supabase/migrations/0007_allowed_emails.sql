-- Allowlist de convite — substitui o pré-provisionamento direto em auth.users
-- (que só fazia sentido pro fluxo OTP). Com login Google, o Supabase sempre gera
-- um auth.users novo no primeiro login; o admin não cria mais a conta, só
-- autoriza o e-mail. A conta real (auth.users + profiles) nasce sozinha no
-- primeiro login bem-sucedido daquele e-mail, feito em
-- src/app/auth/callback/route.ts.

create table public.allowed_emails (
  email text primary key,
  user_name text not null default '',
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

alter table public.allowed_emails enable row level security;
-- De propósito, nenhuma policy: nem authenticated nem anon devem ler/escrever
-- aqui (evita um usuário comum descobrir quem mais foi convidado). Só
-- service_role acessa — mesmo padrão de "sem policy de insert/delete" já usado
-- em profiles na 0002_rls.sql. Toda leitura/escrita passa por
-- createAdminClient() em código server-only (src/lib/actions/admin-users.ts e
-- src/app/auth/callback/route.ts).
