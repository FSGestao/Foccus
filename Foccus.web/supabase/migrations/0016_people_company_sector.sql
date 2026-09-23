-- Empresa/setor da pessoa (pedido do usuário, 2026-09-23): campos opcionais
-- pra identificar de qual empresa/setor é a pessoa que uma tarefa está
-- aguardando — mostrados no cadastro de Pessoa (não por tarefa, pra reusar
-- entre todas as tarefas que aguardam a mesma pessoa).
alter table public.people add column if not exists company text;
alter table public.people add column if not exists sector text;
