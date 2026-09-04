-- Fluxo de desativar usuário: admin revoga o acesso de alguém sem apagar a
-- conta (dados continuam intactos, só o login para de funcionar).

alter table public.profiles
  add column disabled boolean not null default false;

-- Hook de JWT (0004 -> 0009) precisa injetar também esse estado, senão o
-- proxy.ts só saberia que o usuário está desativado depois de um refresh de
-- token (até 1h de atraso). Mesma correção da 0009 (SECURITY DEFINER pra
-- ler profiles ignorando RLS nesse contexto) — só adiciona a leitura de
-- `disabled` e o claim `app_metadata.user_disabled`.
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
  user_disabled boolean;
begin
  select role, disabled into user_role, user_disabled
  from public.profiles where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if jsonb_typeof(claims->'app_metadata') is null then
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  end if;

  claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(coalesce(user_role, 'user')));
  claims := jsonb_set(claims, '{app_metadata, user_disabled}', to_jsonb(coalesce(user_disabled, false)));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;
