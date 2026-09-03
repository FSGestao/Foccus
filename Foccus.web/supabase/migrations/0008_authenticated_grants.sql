-- Mesma causa do 0006, mas faltando pro role authenticated: tabelas criadas via
-- SQL Editor (fora do Table Editor do Supabase) não recebem GRANT automático pra
-- nenhum role além do dono (postgres). RLS (0002) decide QUAIS LINHAS um usuário
-- autenticado pode ver/mexer, mas sem este GRANT ele nem chega a tentar — cai
-- direto em "permission denied for table X" (42501), independente da policy.
-- Descoberto ao debugar login com Google não reconhecendo perfil já existente.

grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;

-- allowed_emails fica coberta por este grant também, mas continua bloqueada na
-- prática: RLS nela (0007) não tem NENHUMA policy, então um authenticated comum
-- segue sem enxergar nenhuma linha ali, grant ou não — só quem tem BYPASSRLS
-- (service_role) acessa de verdade.

-- Cobre tabelas futuras criadas pelo mesmo role (postgres), sem precisar repetir
-- este grant a cada nova migration — mesmo padrão do 0006.
alter default privileges for role postgres in schema public
  grant all on tables to authenticated;
