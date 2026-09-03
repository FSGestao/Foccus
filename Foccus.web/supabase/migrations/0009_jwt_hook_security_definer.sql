-- Corrige o hook de JWT (0004): a função rodava como SECURITY INVOKER (padrão do
-- Postgres), então o SELECT em profiles executava sujeito à RLS da 0002
-- (`id = auth.uid()`). O hook é chamado por supabase_auth_admin fora de uma
-- sessão de usuário normal — auth.uid() não resolve pro usuário sendo
-- autenticado nesse contexto, então a RLS bloqueia a leitura silenciosamente (0
-- linhas, sem erro) e a função sempre caía no fallback coalesce(..., 'user').
-- Resultado: o token sempre saía com app_metadata.user_role='user', mesmo pra
-- quem já é admin no banco — descoberto debugando /admin/users nunca abrir.
--
-- SECURITY DEFINER faz a função rodar com o privilégio de quem a criou (postgres,
-- que bypassa RLS por ser superuser) em vez de quem chama — contorna a RLS só
-- pra esta leitura pontual e controlada, sem abrir profiles pra mais ninguém
-- (nada muda pro authenticated comum, que continua preso à policy da 0002).
-- set search_path fixo é boa prática em toda função SECURITY DEFINER, pra evitar
-- que alguém sequestre a função criando um objeto de mesmo nome num schema antes
-- no search_path.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  user_role text;
begin
  select role into user_role from public.profiles where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if jsonb_typeof(claims->'app_metadata') is null then
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  end if;

  claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(coalesce(user_role, 'user')));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Grants da 0004 (execute só pra supabase_auth_admin) continuam valendo — CREATE
-- OR REPLACE não os altera.
