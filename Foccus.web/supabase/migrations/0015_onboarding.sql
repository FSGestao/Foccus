-- Popup "Como usar" no primeiro acesso (pedido do usuário, 2026-09-14): todo
-- usuário existente precisa ver no próximo login, e todo usuário novo no
-- primeiro — mesma mecânica de "visto/não visto" do release notes
-- (0014_release_notes.sql), mas é um flag simples (o guia não tem versões,
-- é sempre o mesmo conteúdo atual de src/lib/help/content.ts) em vez de um
-- texto de versão.
alter table public.profiles add column if not exists onboarding_seen boolean not null default false;
