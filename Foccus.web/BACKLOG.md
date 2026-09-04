# Backlog — Foccus.web

Itens de prontidão pra produção identificados e conscientemente adiados —
cada um depende de uma conta/decisão/cartão do dono do projeto, não dá pra
implementar sozinho. Ver contexto completo na conversa de 2026-09 (sessão
"prontidão pra produção" do Claude Code).

## 1. Supabase de produção separado

Hoje o app roda no mesmo projeto Supabase usado em desenvolvimento. O ideal
é ter um projeto separado só pra produção, com suas próprias chaves
(`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
`SUPABASE_SERVICE_ROLE_KEY` diferentes em produção no Vercel).

**Pré-requisito**: criar o projeto novo no painel do Supabase (ou dar acesso
a ele), decidir a migração dos dados atuais.

## 2. Plano pago do Supabase

O projeto atual está no free tier — pausa por inatividade e tem limites
baixos de storage/conexões, problemático pra uso real com outras pessoas.

**Pré-requisito**: inserir cartão no painel do Supabase e fazer o upgrade.

## 3. E-mail de boas-vindas

Quando um admin convida alguém em `/admin/users`, a pessoa não recebe
nenhum e-mail — só descobre o acesso se avisada por fora do sistema.

**Pré-requisito**: conta e API key de um provedor de e-mail (ex.: Resend,
SendGrid). Depois disso é só código (chamar a API no
`inviteUserAction`, `src/lib/actions/admin-users.ts`).

---

Quando o usuário topar mexer em algum desses, retomar por aqui.
