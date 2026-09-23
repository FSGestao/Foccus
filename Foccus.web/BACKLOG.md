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

## 3. Domínio próprio no Resend (e-mail de convite)

O e-mail de convite (`/admin/users`, resolvido em 2026-09-23 com
`RESEND_API_KEY`) sai do remetente compartilhado `onboarding@resend.dev`
porque o Foccus não tem domínio próprio verificado no Resend ainda. Funciona,
mas tem mais chance de cair em spam do que um remetente com domínio próprio
verificado (SPF/DKIM).

**Pré-requisito**: domínio próprio + adicionar/verificar ele no painel do
Resend (Domains → Add Domain, alguns registros DNS). Depois é só trocar o
`FROM` em `src/lib/email/invite-email.ts`.

---

Quando o usuário topar mexer em algum desses, retomar por aqui.
