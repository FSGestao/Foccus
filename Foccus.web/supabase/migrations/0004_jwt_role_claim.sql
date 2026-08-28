-- Auth Hook: injeta profiles.role (admin/user) como claim `app_metadata.user_role`
-- direto no JWT, pra middleware (proxy.ts) checar admin/usuário sem precisar de uma
-- consulta extra ao banco em cada request.
--
-- Depois de rodar esta migration, é preciso REGISTRAR o hook no painel (isso não dá
-- pra fazer via SQL, é uma configuração de projeto):
--   Authentication -> Hooks -> "Customize Access Token (JWT) Claims hook"
--   -> Enable -> tipo "Postgres Function" -> escolher public.custom_access_token_hook

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
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

-- Só o processo de autenticação do Supabase pode executar este hook.
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- O hook roda como supabase_auth_admin e precisa conseguir LER profiles.role.
-- (Não revogamos o acesso normal de `authenticated` a profiles — o app usa profiles
-- pra guardar nome/tema/config do Assistente, e isso já é protegido pelas policies
-- de RLS da 0002, não pelo GRANT/REVOKE de tabela.)
grant select on public.profiles to supabase_auth_admin;
