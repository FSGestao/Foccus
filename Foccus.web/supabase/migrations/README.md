# Migrations — Foccus.web

Histórico versionado do schema do Supabase, na ordem em que devem ser
aplicadas. Cada arquivo é uma mudança fechada e comentada; nenhum é editado
depois de já ter sido aplicado em produção — uma correção vira um arquivo
novo (ex.: `0009` corrige um bug do `0004`, não o reescreve).

## Como aplicar

Não há CLI do Supabase vinculado a este projeto (exigiria login/token
próprio do dono da conta), então a aplicação é manual:

1. Abra o projeto em [supabase.com](https://supabase.com/dashboard) →
   **Database → SQL Editor → New query**.
2. Cole o conteúdo do arquivo `NNNN_*.sql` seguinte (o primeiro ainda não
   aplicado) e rode.
3. Repita em ordem até o último arquivo da pasta.

Alguns arquivos têm um passo extra fora do SQL (ex.: `0004`/`0009` exigem
registrar o Hook em **Authentication → Hooks**) — o próprio arquivo avisa no
comentário do topo quando isso é necessário.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `0001_schema.sql` | Tabelas base: profiles, projects, people, tasks, project_notes. |
| `0002_rls.sql` | RLS — cada linha só é visível/editável pelo dono (`user_id`/`id = auth.uid()`). |
| `0003_realtime.sql` | Habilita Realtime nas tabelas do app. |
| `0004_jwt_role_claim.sql` | Hook de JWT: injeta `profiles.role` como claim `app_metadata.user_role`. |
| `0005_notes_feed_view.sql` | View de feed de anotações por projeto. |
| `0006_service_role_grants.sql` | Grants pro service role usado nas Server Actions de admin. |
| `0007_allowed_emails.sql` | Allowlist de convite (login é só Google, sem policy pra `authenticated`/`anon`). |
| `0008_authenticated_grants.sql` | Grants pro role `authenticated` nas tabelas do app. |
| `0009_jwt_hook_security_definer.sql` | Corrige o hook do `0004` (RLS bloqueava a leitura de `role` dentro do hook). |
| `0010_deactivate_users.sql` | Coluna `profiles.disabled` + hook de JWT também injeta `app_metadata.user_disabled`. |
| `0011_error_logs.sql` | Tabela `error_logs` (monitoramento de erro interno, sem serviço externo). |
| `0012_integrations.sql` | `tasks.external_id`, tabela `integration_settings` e trigger de webhook — integração com o sistema de gestão de desenvolvimento pessoal (ver `docs/INTEGRATIONS.md`). |

## Próximo passo (fora do escopo atual)

Formalizar de verdade — `supabase link` + `supabase db push` a partir do
CLI, com o projeto rodando as migrations automaticamente no deploy — exige
vincular este repo a uma conta/token do Supabase. Enquanto isso não
acontece, este arquivo é a fonte de verdade de o que já foi aplicado.
