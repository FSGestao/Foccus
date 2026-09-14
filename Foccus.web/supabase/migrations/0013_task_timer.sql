-- Cronômetro manual por tarefa (pedido do usuário, 2026-09-14): permite medir
-- o tempo realmente gasto numa tarefa e comparar com `estimated_minutes`.
--
-- `tracked_seconds` acumula o tempo já fechado (cada Pausar soma a sessão
-- inteira de uma vez). `timer_started_at` fica preenchido só enquanto o
-- cronômetro está rodando (Iniciar grava o timestamp, Pausar zera pra null
-- depois de somar o intervalo em tracked_seconds) — igual ao padrão
-- start/accumulate já usado em completed_at/history, sem tabela separada de
-- sessões porque a UI (task-detail-panel) só mostra o total acumulado.
alter table public.tasks add column if not exists tracked_seconds integer not null default 0 check (tracked_seconds >= 0);
alter table public.tasks add column if not exists timer_started_at timestamptz;
