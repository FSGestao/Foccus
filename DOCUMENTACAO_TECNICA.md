# Documentação Técnica — Foccus

> Guia de referência para quem vai desenvolver no projeto. Objetivo: dar contexto
> suficiente para editar o sistema **sem precisar ler o arquivo inteiro do zero**.
> Para o processo de versionamento (obrigatório a cada ajuste), ver `CLAUDE.md` —
> aqui ele só é resumido, não substituído.
>
> Escrito para a v4.4.0. Ver seção 12 para o histórico completo de versões.

## Índice

1. [Visão geral](#1-visão-geral)
2. [Estrutura de arquivos](#2-estrutura-de-arquivos)
3. [Como rodar localmente](#3-como-rodar-localmente)
4. [O motor de template (`.dc.html` + `support.js`)](#4-o-motor-de-template-dchtml--supportjs)
5. [Anatomia do `Component` (estado e ciclo de vida)](#5-anatomia-do-component-estado-e-ciclo-de-vida)
6. [Modelo de dados](#6-modelo-de-dados)
7. [Constantes e enums](#7-constantes-e-enums)
8. [Sistema de temas e tokens de cor](#8-sistema-de-temas-e-tokens-de-cor)
9. [Mapa de telas (`view`)](#9-mapa-de-telas-view)
10. [Inventário de métodos do `Component`](#10-inventário-de-métodos-do-component)
11. [Persistência de dados](#11-persistência-de-dados)
12. [Histórico de versões](#12-histórico-de-versões)
13. [Decisões de arquitetura e pegadinhas conhecidas](#13-decisões-de-arquitetura-e-pegadinhas-conhecidas)
14. [Testes e ferramentas de desenvolvimento](#14-testes-e-ferramentas-de-desenvolvimento)

---

## 1. Visão geral

Foccus é um sistema de gestão de tarefas/pauta **de arquivo único**, sem backend:

- `Foccus.dc.html` é HTML + CSS + JavaScript num arquivo só, aberto direto no
  navegador (`file://` ou servido por qualquer servidor estático).
- Não há build step para o app em si — editar o `.dc.html` e recarregar a página já
  reflete a mudança. (A *exceção* é `support.js`, ver seção 4.)
- Não há backend, banco de dados ou API. Todo o estado vive em memória (React) e é
  persistido em `localStorage` do navegador (seção 11).
- O motor de template (`.dc.html` + `support.js`) é um framework proprietário
  chamado internamente **dc-runtime**, que compila uma sintaxe parecida com HTML +
  `{{ }}` num componente React. Não é Vue, não é Handlebars, nem JSX — tem
  particularidades próprias documentadas na seção 4.

Existem dois arquivos `.dc.html` no projeto, sempre mantidos em paridade funcional
(mesmas telas e fluxos, ver `CLAUDE.md`):

| Arquivo | Papel |
|---|---|
| `Foccus.dc.html` + `support.js` (raiz) | Sistema principal, com dados de seed que refletem o trabalho real do usuário. |
| `Foccus_Template/Foccus_Template.dc.html` + `Foccus_Template/support.js` | Versão compartilhável/genérica, sem dados pessoais, mantida em paridade funcional total e design de vidro com o principal (sincronizada na v4.5.0). |

## 2. Estrutura de arquivos

```
Foccus/
├── Foccus.dc.html              # sistema principal (template + <script data-dc-script>)
├── support.js                  # motor de template (dc-runtime), GERADO — não editar à mão
├── CLAUDE.md                   # instruções de projeto para agentes/devs (regra de versionamento)
├── CONTROLE_DE_VERSOES.txt     # changelog obrigatório, uma entrada por versão
├── DOCUMENTACAO_TECNICA.md     # este arquivo
├── Guia-de-Uso.html            # manual do usuário final (não-técnico), com prints reais
├── guia-imagens/                # screenshots usados pelo Guia-de-Uso.html
├── serve_foccus.ps1            # sobe um servidor estático simples (ver seção 3)
├── package.json                # só devDependency do Playwright, sem build/scripts do app
├── Foccus_Template/
│   ├── Foccus_Template.dc.html
│   └── support.js
├── versions/
│   └── <versão>/                # snapshot fechado de cada versão (os 4 arquivos acima)
└── outros/                      # material não essencial (testes soltos, histórico, fragmentos) —
                                  # NÃO usar como fonte de verdade, ver CLAUDE.md
```

## 3. Como rodar localmente

Não há passo de instalação/build para o app. Duas formas de abrir:

1. **Direto no navegador**: duplo clique em `Foccus.dc.html` (funciona por `file://`,
   sem servidor). É como o usuário final normalmente abre.
2. **Via servidor estático** (recomendado para testar com Playwright, já que alguns
   comportamentos de `fetch`/CORS diferem em `file://`):
   - `serve_foccus.ps1` tenta subir `python -m http.server 8000` na raiz do
     projeto — mas nesta máquina **não há Python real instalado** (só o stub da
     Microsoft Store, que falha com "Python não foi encontrado"). Alternativa
     usada nesta sessão de desenvolvimento: um servidor Node de ~30 linhas
     (`http.createServer` + mapa de MIME types), já que `node` está disponível.
     Não existe um script desse tipo commitado no projeto — se for reaproveitar,
     escrever um na hora ou usar `npx http-server`/`serve` se disponível.
   - Depois de servido, acessar `http://localhost:8000/Foccus.dc.html`.

Não existe `npm run dev`/`npm start` — o único script em `package.json` é
`test`/`test:ui`, que roda Playwright (ver seção 14).

## 4. O motor de template (`.dc.html` + `support.js`)

`support.js` é **gerado** (primeira linha do arquivo: `// GENERATED from
dc-runtime/src/*.ts — do not edit. Rebuild with 'cd dc-runtime && bun run
build'.`) — o código-fonte TypeScript não está neste repositório, só o bundle
compilado. Não editar `support.js` à mão; ele é comum aos dois `.dc.html` do
projeto (mesma versão do runtime).

O `<x-dc>...</x-dc>` dentro do `.dc.html` é o template; a
`<script type="text/x-dc" data-dc-script>` é a lógica (uma classe
`Component extends DCLogic`). Em runtime, `support.js` faz o parse do HTML,
compila cada nó num "builder" de React, e re-renderiza sempre que
`this.setState(...)` é chamado dentro da classe.

### Sintaxe do template

| Sintaxe | O que faz |
|---|---|
| `{{ expr }}` | Interpola um valor. `expr` é um **caminho de propriedade simples** (`a.b.c`, `arr[0]`, comparações `===`/`!==`/`==`/`!=`, negação `!x`, literais `true`/`false`/`null`/número/string) — **não suporta chamada de função** (`{{ Math.round(x) }}` não funciona; calcular no JS antes e expor um campo já pronto em `renderVals()`). Ver `outros`/changelog v2.0.0 para um bug real causado por isso. |
| `<sc-if value="{{ cond }}" hint-placeholder-val="{{ true/false }}">...</sc-if>` | Condicional. `hint-placeholder-val` é só usado durante streaming/preview, não afeta o comportamento normal — mas é convenção do projeto sempre declará-lo, refletindo o valor "mais provável" inicial. |
| `<sc-for list="{{ arr }}" as="item" hint-placeholder-count="N">...</sc-for>` | Laço. Dentro do bloco, `item` (ou o nome escolhido em `as`) e `$index` ficam disponíveis nos `{{ }}` filhos. `hint-placeholder-count` é só hint de streaming. |
| `onClick="{{ handler }}"`, `onChange`, `onKeyDown`, etc. | Qualquer atributo `on*` vira um handler React (`onClick` → `onClick`, mapeamento completo em `EVENT_MAP` dentro de `support.js`). O valor **sempre** vem de `{{ }}` apontando para uma função já pronta em `renderVals()` (ex.: `onClick="{{ row.onRowClick }}"`) — não dá para inline arrow function no template. |
| `style="{{ expr }}"` ou `style="...;{{ x }}"` | Aceita string CSS pura, string com `{{ }}` interpolado dentro, ou os dois misturados (é comum no projeto montar o `style` inteiro como string no JS e só referenciar `{{ row.rowStyle }}`). |
| `style-hover="prop:val;..."` | Sintaxe própria do projeto (não é CSS nativo) — declara estilos que se aplicam só no `:hover`, sem precisar de uma classe CSS separada. Compilado para uma pseudo-classe pelo runtime. |
| `data-dc-tpl="N"` | Atributo interno que o runtime adiciona a cada nó no parse, para identificar/atualizar elementos durante streaming. É gerado automaticamente ao compilar — não escrever à mão. |

### Regras práticas ao editar

- **Toda variável usada num `{{ }}` ou `on*` do template precisa existir no objeto
  retornado por `renderVals()`** (seção 5) — se o campo não existir, o runtime
  renderiza vazio e loga um aviso no console (`[dc-runtime] ... never resolved`),
  silenciosamente, sem quebrar a página.
- Não há JSX nem componentes internos separados — todas as ~3400 linhas do
  template do Foccus.dc.html vivem dentro de um único `<x-dc>`, com `sc-if`
  controlando qual "tela" (`view`) está visível.
- `x-import`/`dc-import` (import de componentes externos) existem no runtime mas
  **não são usados no Foccus** — o projeto é deliberadamente um arquivo único,
  sem dependências externas de componente.

## 5. Anatomia do `Component` (estado e ciclo de vida)

```js
class Component extends DCLogic {
  constructor() { super(); this.state = { /* ver abaixo */ }; }
  componentDidMount() { /* carrega localStorage */ }
  componentDidUpdate() { /* salva no localStorage, com debounce de 500ms */ }
  renderVals() { /* calcula e retorna TUDO que o template consome */ }
  // + ~70 métodos de ação (seção 10)
}
```

- `this.state` é o único estado do app (sem Redux/Context/etc.). Alterado só via
  `this.setState(patch)` ou `this.setState(prevState => patch)` — mesma API do
  React de classe.
- `renderVals()` (linha **2745** de `Foccus.dc.html`) é o método mais importante do
  arquivo: roda a cada render, lê `this.state`, e devolve um objeto plano com
  **tudo** que os `{{ }}` do template vão consumir — desde strings simples
  (`userFirstName`) até listas inteiras já formatadas para exibição (`visibleTasks`,
  `kanbanColumns`, `projectRows`...) e funções de evento já fechadas sobre o item
  certo (`row.onRowClick`, `row.onDelete`...). Ele **não é reativo** por si — roda
  do zero a cada render, então é comum ver a mesma lógica de filtro/formatação
  repetida entre a view de lista e a de busca, por exemplo.
- Os campos de tema (`themeVarsStyle`, `dbVarsStyle`) também são montados dentro de
  `renderVals()`, concatenando os tokens de `themeTokens()`/`dbThemeTokens()` numa
  string de CSS custom properties aplicada no `style` do wrapper raiz (seção 8).
- `componentDidMount` faz a leitura única do `localStorage` (seção 11);
  `componentDidUpdate` salva a cada mudança de estado, com um `setTimeout` de
  500ms que é limpo e reiniciado a cada nova alteração (debounce simples via
  `this._saveTimer`).

## 6. Modelo de dados

Não há schema formal (TypeScript/JSON Schema) — os shapes abaixo são inferidos da
função de seed (`seedTasks`/`seedProjects`/`seedPeople`, por volta da linha 1483
de `Foccus.dc.html`) e de onde cada campo é lido/escrito.

### Task

```js
{
  id: 't1',                    // string, gerado sequencialmente no seed ('t' + contador)
  title: '',                   // obrigatório
  projectId: null,             // string (id de Project) ou null = "Inbox"
  priority: 'P3',              // 'P1' | 'P2' | 'P3' | 'P4'
  status: 'TODO',              // ver STATUS_LABEL (seção 7)
  dueDate: null,                // 'YYYY-MM-DD' ou null
  description: '', notes: '',   // texto livre
  tags: [],                     // existe no shape, sem UI própria hoje (não usado em nenhuma tela)
  checklist: [],                // [{ id, text, done }], ver checklistDraft abaixo
  checklistDraft: '',           // valor do input "Novo sub-item..." (estado de rascunho, não é dado real)
  followUpDate: null,           // data esperada de retorno, só relevante com status WAITING
  waitingFor: null,             // id de Person
  waitingReason: '',
  blockedBy: null,              // texto livre (motivo do bloqueio), NÃO é id de outra task
  dependsOnTaskId: null,        // existe no shape, sem UI própria hoje
  estimatedMinutes: null,
  progressPct: null,            // 0-100, só editável com status IN_PROGRESS/WAITING (ver taskProgressWeight)
  comments: [],                 // [{ id, author, date, text }] — thread da tela Aguardando
  commentDraft: '',             // estado de rascunho do input de comentário
  createdAt: '', updatedAt: '', completedAt: null,   // 'YYYY-MM-DD'
  parentTaskId: null,           // existe no shape, sem UI própria hoje (sem hierarquia de tarefas na UI)
  history: [{ date, desc }]     // log somente-leitura, populado por updateTask()
}
```

### Project

```js
{
  id: 'simplifica',             // string curta, usada como chave de cor (PROJECT_COLOR) e de rota
  name: 'Simplifica',
  priority: 'P1',                // 'P1'..'P4' — existe no shape, sem exibição de destaque hoje
  status: 'ACTIVE',              // 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  progress: 67,                  // campo de seed, NÃO é a fonte de verdade em runtime —
                                  // o % exibido é sempre recalculado por projectProgressPct()
                                  // a partir das tarefas do projeto (ver taskProgressWeight)
  dueDate: null
}
```

### Person

```js
{
  id: 'renato',
  name: 'Renato',
  role: 'Financeiro',            // texto livre, opcional
  status: 'ACTIVE'                // 'ACTIVE' | 'INACTIVE', via togglePersonStatus() — sem botão de UI
                                  // visível para isso no arquivo principal hoje (ver seção 13)
}
```

### ProjectNote (Anotações)

```js
{
  id: '...',
  projectId: '...',
  title: '', text: '',
  recordedAt: 'YYYY-MM-DD',      // data do registro
  referenceDate: '',             // opcional, data a que o conteúdo se refere
  fromTask: false                // true quando a anotação foi criada de dentro de uma task
                                  // (via selectedTask.onAddNote) — usada para exibir a etiqueta "TAREFA"
}
```

## 7. Constantes e enums

Todas próximas ao topo do bloco de script (por volta da linha 1420-1466 de
`Foccus.dc.html`):

| Constante | Conteúdo |
|---|---|
| `PRIORITY_COLOR` | Cor por prioridade P1-P4 (usada nos círculos ❶❷❸❹). |
| `PROJECT_COLOR` | Cor fixa por `id` de projeto de seed. Sobrescrita em runtime se o usuário tiver `projectColors` salvos no `localStorage` (ver `componentDidMount`). |
| `STATUS_LABEL` | `{ INBOX, TODO, IN_PROGRESS, WAITING, BLOCKED, DONE, CANCELLED }` → rótulo em português. |
| `STATUS_ICON` | Ícone/emoji por status (📥 ○ ◐ ⏳ ⛔ ✓ ⨯). |
| `STATUS_COLOR` | Cor por status, usada no ícone da linha da lista. |
| `STATUS_OPTIONS` | Array `{ value, label }` usado para popular o `<select>` de Status no painel de detalhes. |
| `STATUS_TINT_HEX` / `STATUS_TINT_VAR` | Cor de tingimento das colunas do Kanban avulso (introduzido na v3.7.0), em hex puro e em `var(--pb-*)`. |
| `APP_VERSION` | String da versão atual (`'4.4.0'`) — ver regra de versionamento no `CLAUDE.md`. |
| `STORAGE_KEY` | `'pauta_app_state_v1'` — nome legado (de antes do rebranding para "Foccus"), mantido por compatibilidade com dados já salvos de usuários existentes. **Não renomear sem migrar os dados salvos.** |

## 8. Sistema de temas e tokens de cor

Dois sistemas de tokens **paralelos e independentes**, ambos calculados dentro de
`renderVals()` e aplicados como CSS custom properties (`--pb-*` / `--db-*`) no
`style` inline de um wrapper:

### `themeTokens(theme)` → `--pb-*`

Aplicado no `<div style="{{ themeVarsStyle }} ...">` que envolve **o app inteiro**
(linha ~43). Cobre `bg`, `bgGradient`, `surface`, `surfaceSubtle`, `glass`,
`glassStrong`, `glassCard`, `glassStrongCard`, `border`, `borderHover`, `text`,
`textMuted`, `textDim`, `accent`, `yellow` (usado para "Aguardando"), `red`,
`blue`, `green`, etc. — ramifica em dois objetos completos (`theme === 'dark' ? {...} : {...}`).

Camadas de "vidro" (introduzidas nas v3.3.0 → v4.2.0, ver histórico):

| Token | Uso pretendido |
|---|---|
| `--pb-surface` / `--pb-surface-subtle` | Sólido — reservado a **campos de formulário** (input/select/textarea) e elementos decorativos pequenos (trilho de barra de progresso). Não usar em containers/cards a partir da v4.0. |
| `--pb-glass` | Vidro "padrão" (translúcido + blur) — moldura/overlay: header, sidebar, modais, drawer antes da v4.2 (upgradado depois). |
| `--pb-glass-strong` | Vidro mais opaco — cards dentro de um container já translúcido (ex.: cartão dentro de coluna do Kanban), evitando "vidro sobre vidro" ilegível. No claro é 0.88 de opacidade — quase indistinguível de sólido isoladamente. |
| `--pb-glass-card` | **(v4.0)** Vidro reforçado para conteúdo "Vidro Total": no escuro é igual a `--pb-glass`; no claro ganha um tingimento diagonal teal/âmbar (`linear-gradient(165deg, rgba(14,154,167,.14), rgba(255,166,0,.06)), rgba(255,255,255,.4)`) para não ficar invisível contra o fundo quase branco. |
| `--pb-glass-strong-card` | **(v4.2)** Mesma lógica do `glass-card`, só que baseada em `glassStrong` — para painéis aninhados *dentro* de um cartão já em `glass-card` (subtarefas expandidas, comentários do Aguardando). |
| `--pb-border-hover` | Usado como borda "normal" (não só de hover) nos elementos que levaram o tratamento de vidro reforçado — mais contraste que `--pb-border` puro. |

Regra de ouro (ver v3.3.0-v4.2.0 no histórico): **nunca empilhar dois níveis de
vidro do mesmo tom sem um deles ser `-strong`/`-card`** — o efeito soma
transparências e o texto perde contraste. Quando em dúvida, seguir o padrão já
usado num caso análogo (linha de lista → `glass-card`; painel aninhado dentro dela
→ `glass-strong-card`; conteúdo realmente denso dentro do painel aninhado →
`--pb-surface` sólido).

### `dbThemeTokens(theme)` → `--db-*`

Sistema **totalmente separado**, escopado à classe CSS `.db-scope` — usado só
dentro da tela Dashboard ("Painel do Projeto"). Cobre `panel`, `panelStrong`,
`border`, `borderStrong`, `text`, `teal`, `amber`, `green`, `blue`, `red`. Desde a
v4.1.0, o **fundo** (`--pb-bg`/`--pb-bg-gradient`) foi unificado com o resto do app
(o Dashboard não define mais `--db-bg`/`--db-bg-gradient` próprios) — mas as
demais cores (`--db-teal`, `--db-amber`...) continuam com sua própria paleta,
ainda que hoje calibrada para bater com `--pb-accent`/`--pb-yellow` do resto do
app (unificados desde a v3.3.0, ver histórico).

A fonte (Inter, via Google Fonts, `<link>` no `<head>`) é global desde a v3.3.0 —
a regra CSS `.db-scope { font-family: 'Inter'... }` que existia à parte foi
removida na v4.1.0 por ser redundante (idêntica à do `body`).

## 9. Mapa de telas (`view`)

`this.state.view` controla qual bloco `<sc-if value="{{ viewX }}">` está visível
dentro do `<main>`. Os valores computados (`viewList`, `viewKanban`, etc.) são
expostos em `renderVals()` a partir de `s.view`. Linhas aproximadas no
`Foccus.dc.html` atual:

| `view` | Flag no template | Linhas aprox. | Notas |
|---|---|---|---|
| `'list'` | `viewList` | 181-475 | Tela inicial ("Minha Lista"). Vidro Total desde a v4.0.0. |
| — (não é uma `view`, é `isSearching`) | `isSearching` | 143-176 | Sobrepõe a view atual quando `state.search` não está vazio. |
| `'kanban'` | `viewKanban` | 477-541 | Kanban avulso, agrupável por status/projeto/urgência/prazo. |
| `'projects'` | `viewProjects` | ~544-588 | Grade de cards de projeto. |
| `'projectDetail'` | `viewProjectDetail` | ~590-617 | Lista de tarefas de um projeto (`state.activeProjectId`). |
| `'people'` | `viewPeople` | ~619-648 | Grade de cards de pessoa. |
| `'waiting'` | `viewWaiting` | 644-703 | Tarefas com status `WAITING`, agrupadas por pessoa. |
| `'dashboard'` | `viewDashboard` | 706-955 | "Painel do Projeto" — token system próprio (`.db-scope`), 4 sub-modos (Kanban/Gantt/Burndown/Visão Geral) via `state.dashboardMode`. |
| `'notes'` | `viewNotes` | ~958-1046 | Anotações. |

Modais e overlays (não são `view`, controlados por flags booleanas próprias em
`state`, ex. `showNewModal`, `showConfirmModal`): Atalhos, Nova Tarefa, Novo
Projeto, Nova Pessoa, Editar Nome, Editar Projeto, Editar Pessoa, Confirmar
Exclusão — linhas ~1231-1367. Drawer de detalhe de tarefa (`state.selectedTaskId`)
— linhas ~1050-1228.

## 10. Inventário de métodos do `Component`

Lista não-exaustiva dos métodos mais relevantes (nome → o que faz). Todos vivem na
classe `Component`, por volta das linhas indicadas (podem deslocar com futuras
edições — usar como ponto de partida, não como referência fixa).

**Ciclo de vida / infraestrutura**
`constructor` (1700, também registra o listener global de teclado — atalhos `/`,
`N`, `?`, `Esc`) · `componentDidMount` (1741) · `componentDidUpdate` (1760) ·
`renderVals` (2745) · `showToast` (1776) · `handleEscape` (1782)

**Tarefas**
`findTask`/`findProject`/`findPerson` (1790-1792) · `updateTask(id, patch, note)`
(1794, aplica um patch e — se `note` for passado — adiciona uma entrada em
`history`) · `toggleDone` (1802) · `deleteTask` (2000, **sem confirmação**, só
toast com "Desfazer") · `handleTaskRowClick(taskId, e)` (1922, decide entre abrir
o drawer ou alternar seleção múltipla conforme `e.shiftKey`/`e.ctrlKey`) ·
`getCurrentVisibleTasks` (1893) · `buildRow(task, opts)` (2288, monta o objeto de
apresentação de uma linha — usado por toda tela que lista tarefas) · `sortTasks`
(2373) · `matchesSearch` (2362) · `quickAddInternal` (3627) ·
`submitNewTaskInternal` (3643) · `isOverdue`/`dateLabelFor`/`taskProgressWeight`
(2270-2279)

**Seleção múltipla e ações em lote**
`setupMarqueeSelection` (1824, listeners de mousedown/mousemove/mouseup no
`document` para o retângulo de seleção) · `applyBulkProjectValue` /
`applyBulkPriorityValue` (1964, 1983) · `applyBulkProject` / `applyBulkPriority` /
`applyBulkComplete` (2005-2066, aplicam a seleção múltipla atual)

**Projetos**
`addProject` / `submitNewProject` (2090, 2093) · `deleteProject` (2106, **com**
confirmação via `showConfirmModal`) · `renameProject` (2153) · `submitEditProject`
(2158)

**Pessoas**
`addPerson` / `submitNewPerson` (2168, 2172) · `deletePerson` (2236, com
confirmação) · `editPerson` / `submitEditPerson` (2246, 2251) ·
`togglePersonStatus` (2261) · `addPersonForSelectedTask` /
`addPersonForNewTask` (2220, 2228, atalho "+ Nova pessoa..." dentro dos
`<select>` de responsável)

**Anotações**
`emptyProjectNoteDraft` (2191) · `addProjectNoteInternal` (2197) ·
`deleteProjectNote` (2212, com confirmação)

**Aguardando**
`addWaitingComment` (1808)

**Kanban / Dashboard**
`handleKanbanDrop(taskId, targetColId, groupBy)` (2403, aplica o resultado de um
drag-and-drop conforme o agrupamento ativo) · `computeDashboardForecast` (2431) ·
`buildDashboardCard` (2452) · `buildDashboardKanban` (2483) · `buildDashboardGantt`
(2511) · `buildDashboardBurndown` (2588) · `computeDashboardStreak` (2663) ·
`buildDashboardOverview` (2678)

**Tema / usuário**
`toggleTheme` (2070, também grava `'foccus_theme'` direto no `localStorage`,
**fora** do blob principal de `STORAGE_KEY`) · `changeName` / `submitEditUser`
(2078, 2081)

## 11. Persistência de dados

Tudo via `localStorage`, sem nenhum backend — três chaves distintas:

| Chave | Conteúdo | Onde é lida/escrita |
|---|---|---|
| `pauta_app_state_v1` (`STORAGE_KEY`) | JSON com `{ tasks, projects, people, projectNotes, theme, projectColors }` — o estado "de dados" completo. | Lido uma vez em `componentDidMount`; escrito em `componentDidUpdate` com debounce de 500ms. |
| `foccus_username` | Nome de exibição do usuário (string simples, fora do blob acima). | Lido no `constructor` (`this.state.userName`); escrito em `submitEditUser`. |
| `foccus_theme` | Redundante com `theme` dentro do blob principal — grava separado em `toggleTheme`, mas quem é lido no boot é o `theme` de dentro de `STORAGE_KEY` (com fallback `'light'`). | Escrito em `toggleTheme`; não é lido em lugar nenhum no boot (`componentDidMount` usa `saved.theme`, não `localStorage.getItem('foccus_theme')`) — **grava mas nunca lê**, resquício de uma implementação anterior. |

Sem esse `localStorage`, o app sempre parte dos dados de **seed**
(`seedTasks`/`seedProjects`/`seedPeople`, linha ~1483) — é por isso que abrir o
arquivo numa aba anônima, num navegador diferente, ou numa sessão de teste
automatizado nova (ex. Playwright com perfil descartável) sempre mostra os
mesmos dados de exemplo, nunca em branco.

## 12. Histórico de versões

Changelog técnico completo e obrigatório em **`CONTROLE_DE_VERSOES.txt`** — este
resumo é só um índice rápido; para o texto integral de cada entrada, ler o
arquivo original.

| Versão | Resumo técnico |
|---|---|
| **2.0.0** | Reconstrução completa do `Foccus.dc.html` (arquivo estava truncado/corrompido por outra sessão). Base do app como está hoje: menu mini-rail, Dashboard de 4 colunas por status de prazo (versão pré-v3.0), Aguardando com thread de comentários, `% de conclusão da tarefa` ponderado no progresso do projeto, correção de mojibake de acentos. |
| **2.1.0** | Anotações reescritas: título/descrição/data de registro editável/data de referência opcional; layout de grade → lista agrupada por projeto; confirmação antes de excluir. |
| **3.0.0** | Dashboard reconstruído como "Painel do Projeto": 3 modos (Kanban/Gantt/Burndown), identidade visual própria (`.db-scope`, teal/âmbar, Inter, glass-morphism) isolada do resto do app, KPI + previsão de conclusão calculada por velocidade real. Burndown implementado em barras CSS (não SVG) para evitar bug de atributo `{{ }}` em geometria SVG. |
| **3.1.0** | Correção de contraste no `<select>` do Dashboard no escuro; linha de Tendência no Burndown (regressão linear); reformulação visual do Kanban do Dashboard (3 colunas coloridas + avatar por card). |
| **3.2.0** | Aba "Visão Geral" no Dashboard: anéis de progresso por projeto, mapa de calor projetos×status, velocity chart, badge de sequência (streak). |
| **3.2.1** | Reordenação de blocos na Visão Geral (Velocidade → Progresso → Mapa de Calor). |
| **3.2.2** | Tags de bloqueio/aguardando nos cards da coluna "Em Progresso" do Dashboard (que agrupa 3 status sem distinção visual). |
| **3.3.0** | **Fase 1 da identidade visual única**: paleta teal/âmbar do Dashboard estendida para `themeTokens()` (app inteiro). Nasce o token `--pb-glass` (moldura/overlay: header, sidebar, modais) mantendo `--pb-surface` sólido no conteúdo denso ("Identidade Adaptada"). Fonte Inter global. |
| **3.4.0** | Remoção do menu/status `Inbox` dedicado da navegação (tarefas `INBOX` viram `TODO` no seed). Cores semânticas nos KPIs de Minha Lista; tokens `--pb-red`/`--pb-blue`/`--pb-green` novos; cores fixas antigas trocadas por tokens. |
| **3.5.0** | **Fase 3**: vidro (`--pb-glass`) aplicado na moldura de Kanban avulso, Projetos, Pessoas, Anotações — conteúdo interno denso continua sólido. |
| **3.6.0** | Vidro no drawer de detalhe da tarefa, barra de ações em lote, toasts. |
| **3.7.0** | Kanban avulso redesenhado no padrão visual do Dashboard: colunas tingidas por cor semântica, avatares nos cards. Nasce `--pb-glass-strong`. Abas secundárias viram cápsula segmentada. |
| **3.8.0** | Todos os `<select>` de filtro/agrupamento padronizados como pílula de vidro. Título de tarefa em peso 600. |
| **3.9.0** | Renomear projeto exposto na UI (lógica já existia, faltava o botão). |
| **4.0.0** *(experimental)* | **"Vidro Total"**, só na Minha Lista: linhas de tarefa viram cartões de vidro individuais (não mais tabela sólida). Nasce `--pb-glass-card` (vidro com tingimento, legível no claro). Degradê de fundo do tema escuro reforçado (token de raiz, afeta o app inteiro). |
| **4.1.0** *(experimental)* | Vidro Total estendido a Aguardando, Detalhe do Projeto, Busca. Upgrade de consistência em Projetos/Pessoas/Anotações para `--pb-glass-card`. Fundo do Dashboard unificado com `--pb-bg`/`--pb-bg-gradient` (deixa de ter receita própria). Remoção da regra CSS `.db-scope` de fonte (redundante). |
| **4.2.0** *(experimental)* | Nasce `--pb-glass-strong-card` para painéis aninhados (subtarefas expandidas, comentários do Aguardando) que ainda usavam `--pb-glass-strong` puro (quase opaco/invisível no claro). Drawer de detalhe da tarefa upgradado de `--pb-glass` para `--pb-glass-card`. |
| **4.3.0** | Reescrita completa do `Guia-de-Uso.html` com prints reais (28 capturas via Playwright) em vez de mockups ilustrativos, cobrindo toda funcionalidade do app. Criação deste documento técnico. |
| **4.4.0** | Criação de `Visao-Executiva.html` — documento executivo de apresentação do sistema (problema, posicionamento, persona, funcionalidades por objetivo, jornada do usuário, diagrama de relação entre as entidades, diferenciais, trajetória e limitações conhecidas). |
| **4.5.0** | Sincronização completa do `Foccus_Template` (design "Vidro Total", nova sidebar retrátil, edição rápida de datas e tooltip de status "Aguardando"). Paridade total restabelecida entre o sistema principal e o template. |

## 13. Decisões de arquitetura e pegadinhas conhecidas

- **`{{ }}` não avalia expressões arbitrárias.** Qualquer cálculo (formatação de
  data, `Math.round`, concatenação condicional) precisa acontecer em
  `renderVals()`/nos métodos de apoio, nunca dentro do atributo/texto do template.
- **`STORAGE_KEY` = `'pauta_app_state_v1'` é um nome legado** do produto antes de
  se chamar Foccus — não renomear sem escrever uma migração, ou dados de usuários
  existentes somem (o app simplesmente não encontra a chave e recai no seed).
- **`foccus_theme` é escrito mas nunca lido** no boot — o tema restaurado vem do
  campo `theme` dentro do blob de `STORAGE_KEY`. Resquício de refatoração; não
  depender dessa chave para nada novo.
- **Campos de dado "mortos"**: `tags`, `dependsOnTaskId`, `parentTaskId` existem no
  shape de Task desde o seed mas não têm UI própria hoje — não são bugs, só
  espaço reservado / funcionalidade não implementada.
- **`Person.status` (`ACTIVE`/`INACTIVE`) e `togglePersonStatus()` existem sem
  botão visível no `Foccus.dc.html` principal** — a lógica está pronta, só falta
  (ou foi removido) o elemento de UI que a aciona. Conferir se ainda existe no
  Template antes de assumir que está morta.
- **Não excluir Projeto/Pessoa/Nota sem checar se o botão está realmente
  conectado**: a v4.1.0 descobriu que `onDelete`/`onEdit` computados em
  `projectRows` (linha ~2925) não tinham nenhum botão de exclusão de projeto
  ligado a eles no `Foccus.dc.html` atual (só o de renomear/✎ existe) — o handler
  existe no JS, mas não há caminho de UI pra chamá-lo hoje nesse arquivo. Antes de
  assumir que uma ação está disponível, procurar o `onClick="{{ ... }}"`
  correspondente no template, não só o método na classe.
- **"Vidro sobre vidro" é um problema visual real e recorrente** (ver v3.5.0,
  v3.7.0, v4.1.0, v4.2.0 no histórico) — ao aplicar um novo `--pb-glass*` em algo
  que já está dentro de outro elemento translúcido, sempre subir um nível de
  opacidade (`glass` → `glass-strong` → `glass-strong-card`) em vez de repetir o
  mesmo tom, ou o conteúdo perde contraste.
- **O `Foccus_Template` não é apenas uma cópia com dados trocados** — em alguns
  pontos tem estrutura de UI diferente (ex.: Projetos/Pessoas como lista densa em
  vez de grade de cards, conforme v3.5.0) e não tem sistema de toast/confirmação
  para tudo (usa `confirm()` nativo do navegador em vários lugares). Não assumir
  que um patch no principal se aplica 1:1 lá — sempre conferir a estrutura local
  antes de replicar.
- **`outros/`** contém versões antigas/fragmentos/testes soltos de sessões
  anteriores (inclusive um antigo nome de produto, "Pauta" — de onde vem o
  `STORAGE_KEY`) — nunca usar como fonte de verdade para nada, é só histórico.

## 14. Testes e ferramentas de desenvolvimento

- **`package.json`** só declara `playwright` como devDependency, com
  `npm run test`/`test:ui` → `playwright test`. Não há linter, formatter, nem
  bundler configurado — não é esse tipo de projeto.
- Existe uma config antiga de Playwright em
  `outros/tests/playwright/playwright.config.js` (`baseURL: localhost:3000`,
  projetos Chrome/Edge) — está em `outros/` (não essencial) e aponta para uma
  porta que não corresponde ao workflow atual; **não confiar nela sem revisar**
  antes de rodar.
- **Workflow de verificação usado nas versões 4.x** (recomendado para qualquer
  ajuste visual): subir um servidor estático na raiz do projeto (seção 3), abrir
  `Foccus.dc.html` com Playwright (`playwright-core`, já presente em
  `node_modules`), navegar pelas telas afetadas, tirar screenshot em claro e
  escuro, e conferir o console (`page.on('console', ...)`) sem erros antes de
  fechar a versão — é o mesmo processo exigido pelo `CLAUDE.md` ("Como testar").
  Não há suíte de testes automatizados fixa no repositório para isso; os scripts
  de verificação são escritos ad-hoc a cada sessão (normalmente descartáveis, fora
  do controle de versão do projeto).
