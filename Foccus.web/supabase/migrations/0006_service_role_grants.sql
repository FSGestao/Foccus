-- Garante que o role service_role (usado só server-side, nunca no client) tem
-- privilégio de tabela nas tabelas do schema public. service_role já tem o
-- atributo BYPASSRLS por padrão em todo projeto Supabase — isso aqui não afeta
-- RLS pra nenhum outro role (anon/authenticated continuam presos às policies
-- de 0002_rls.sql normalmente). Corrige "permission denied for table X" visto
-- ao usar o client admin (service-role) pra gravar em profiles.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Cobre tabelas/sequences futuras criadas por este mesmo role (postgres), sem
-- precisar repetir este grant a cada nova migration.
alter default privileges for role postgres in schema public
  grant all on tables to service_role;
alter default privileges for role postgres in schema public
  grant all on sequences to service_role;
