# Foccus

Este repositório tem **dois projetos irmãos**, independentes entre si:

- **`Foccus.dc/`** — o sistema original: gestão de tarefas/pauta em arquivo único
  `.dc.html` (motor de template customizado, ver `support.js`), executável direto
  na máquina do usuário. Sem backend — estado fica em `localStorage` do navegador.
  **Não é versionado no git** (está no `.gitignore` da raiz, de propósito — roda só
  localmente, nunca vai pro GitHub/Vercel). Os arquivos existem normalmente em
  `Foccus.dc/`, só não são rastreados. Tudo abaixo desta seção ("Estrutura", "Regra
  de versionamento", "Como testar") é sobre este projeto.
- **`Foccus.web/`** — a reescrita em Next.js + Supabase do mesmo sistema, com
  backend de verdade (multiusuário, Google OAuth, RLS). É o único projeto deste
  repo que segue com commits/push/deploy (GitHub + Vercel). Tem convenções
  próprias, documentadas em `Foccus.web/AGENTS.md`; a regra de versionamento
  abaixo **não** se aplica a ele.

## Estrutura (`Foccus.dc/`)
- `Foccus.dc.html` + `support.js` (raiz de `Foccus.dc/`) — sistema principal, com
  os dados/tarefas reais do usuário.
- `Foccus_Template/Foccus_Template.dc.html` + `Foccus_Template/support.js` — versão
  compartilhável, mesmas funcionalidades, sem dados pessoais.
- `serve_foccus.ps1` — sobe `python -m http.server 8000` na raiz de `Foccus.dc/`,
  para testar localmente (`http://localhost:8000/Foccus.dc.html`).
- `CONTROLE_DE_VERSOES.txt` — changelog obrigatório (ver regra abaixo).
- `versions/<versão>/` — snapshot de cada versão fechada.
- `outros/` — arquivos não essenciais ao funcionamento (histórico, testes soltos,
  fragmentos antigos). Não usar nada daqui como fonte de verdade.

## Regra de versionamento — OBRIGATÓRIA, sempre (só para `Foccus.dc/`)

**Todo ajuste** feito no sistema (principal e/ou template), por menor que seja,
precisa passar pelos 4 passos abaixo antes de ser considerado concluído:

1. **Incrementar a versão**: `2.0.0 → 2.1.0 → 2.2.0 → ...` (não pule números, não
   reaproveite uma versão já fechada).
2. **Atualizar `APP_VERSION`**: a constante fica perto do topo do
   `<script data-dc-script>` em cada arquivo `.dc.html` tocado. Atualize nos dois
   arquivos (`Foccus.dc.html` e `Foccus_Template/Foccus_Template.dc.html`) se o
   ajuste afetou ambos; só no que foi tocado, caso contrário.
3. **Registrar no `CONTROLE_DE_VERSOES.txt`**: adicionar uma entrada nova NO TOPO
   (logo abaixo da regra, acima da entrada anterior), no formato:
   ```
   v<versão> — <data>
   Pasta: /versions/<versão>/
   Ajustes:
   - <descrição de cada ajuste feito, um por linha>
   ```
4. **Criar a pasta da versão**: copiar os arquivos finais para
   `versions/<versão>/`, mantendo a mesma estrutura relativa:
   ```
   versions/<versão>/Foccus.dc.html
   versions/<versão>/support.js
   versions/<versão>/Foccus_Template/Foccus_Template.dc.html
   versions/<versão>/Foccus_Template/support.js
   ```

Não entregue um ajuste como "pronto" sem ter feito os 4 passos. Se o usuário pedir
vários ajustes na mesma conversa, eles fecham como UMA única versão nova (não uma
por ajuste individual), a menos que o usuário peça o contrário.

## Como testar (`Foccus.dc/`)
Suba o servidor a partir de dentro de `Foccus.dc/` (`serve_foccus.ps1` ou
`python -m http.server 8000`) e valide via Playwright (`playwright-core` já está em
`Foccus.dc/node_modules`) — screenshot + checagem de `console` sem erros — antes de
fechar a versão.
