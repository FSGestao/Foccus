-- "Novidades do Foccus" (pedido do usuário, 2026-09-14): card mostrado no
-- login com o changelog (src/lib/release-notes/data.ts) que o usuário ainda
-- não confirmou ter visto — precisa sobreviver entre sessões/dispositivos,
-- igual ao resto de `profiles` (ver comentário no topo de profile-store.ts).
-- null = nunca confirmou nenhuma versão (mostra o changelog inteiro).
alter table public.profiles add column if not exists last_seen_release text;
