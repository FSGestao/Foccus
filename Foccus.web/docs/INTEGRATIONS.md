# Integração com o sistema de gestão de desenvolvimento pessoal

Ponte entre o Foccus e o sistema web próprio de gestão de desenvolvimento
pessoal: tarefas criadas lá entram no Foccus apontando pra um projeto, data e
prioridade; andamento das tarefas no Foccus é avisado de volta em tempo real.

Autenticação é uma chave única e central (`INTEGRATION_API_KEY`), mas cada
tarefa é sempre atribuída a um usuário real do Foccus (via `owner_email`) —
não existe conta de serviço genérica dona das tarefas. Isso preserva o
isolamento normal por usuário (cada um só vê/gerencia as próprias tarefas,
como em qualquer outro fluxo do Foccus).

## 1. Entrada — criar tarefa no Foccus

```
POST https://foccus-web.vercel.app/api/integrations/tasks
Authorization: Bearer <INTEGRATION_API_KEY>
Content-Type: application/json
```

Corpo:

| Campo | Obrigatório | Descrição |
|---|---|---|
| `title` | sim | Título da tarefa. |
| `owner_email` | sim | Email do usuário do Foccus dono da tarefa (precisa já existir como perfil no Foccus). |
| `project_id` | não | UUID de um projeto do Foccus — precisa pertencer a `owner_email`. |
| `priority` | não (default `P3`) | `P1` \| `P2` \| `P3` \| `P4`. |
| `due_date` | não | Data ISO (`AAAA-MM-DD`). |
| `description` | não | Texto livre. |
| `external_id` | não, mas recomendado | ID da tarefa no sistema de origem — usado pra mapear o webhook de status de volta (ver seção 2). |

Tarefa nasce sempre com `status = TODO`, igual ao fluxo de criação manual do
Foccus.

Resposta de sucesso (`201`):
```json
{ "ok": true, "id": "uuid-da-tarefa-no-foccus" }
```

Erros: `401` (chave inválida/ausente), `404` (`owner_email` não é um usuário
do Foccus), `422` (campo inválido — ex. `priority` fora de `P1..P4`,
`project_id` não pertence ao dono), `503` (integração ainda não tem
`INTEGRATION_API_KEY` configurada no Foccus).

## 2. Saída — status da tarefa muda no Foccus

Sempre que `status`, `progress_pct` ou `due_date` de uma tarefa mudam (seja
pelo app do Foccus, seja por essa própria integração), um trigger no banco
dispara um `POST` pra URL configurada:

```
POST <webhook_url>
X-Foccus-Webhook-Secret: <webhook_secret>
Content-Type: application/json

{
  "task_id": "uuid-no-foccus",
  "external_id": "id-no-outro-sistema-ou-null",
  "title": "...",
  "status": "DONE",
  "progress_pct": 100,
  "due_date": "2026-09-20",
  "updated_at": "2026-09-11T14:32:00Z"
}
```

`status` possíveis: `INBOX`, `TODO`, `IN_PROGRESS`, `WAITING`, `BLOCKED`,
`DONE`, `CANCELLED`.

**Ainda não configurado** — `webhook_url`/`webhook_secret` ficam vazios até o
endpoint receptor existir do outro lado; enquanto isso o trigger não faz
nada (sem erro, sem retry acumulando). Pra ativar, rodar no SQL Editor do
Supabase (`Database → SQL Editor`):

```sql
update public.integration_settings set value = 'https://seu-sistema.com/webhooks/foccus' where key = 'webhook_url';
update public.integration_settings set value = 'um-segredo-aleatorio-forte'          where key = 'webhook_secret';
```

O outro sistema deve validar o header `X-Foccus-Webhook-Secret` antes de
confiar no payload.

## Peças no código

- `supabase/migrations/0012_integrations.sql` — coluna `tasks.external_id`,
  tabela `integration_settings`, trigger `tasks_integration_webhook`
  (`pg_net`). Aplicar manualmente no SQL Editor, como as demais migrations
  (ver `supabase/migrations/README.md`).
- `src/app/api/integrations/tasks/route.ts` — endpoint de entrada.
- `INTEGRATION_API_KEY` em `.env.local` (dev) e nas env vars do Vercel
  (produção) — gerar com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
