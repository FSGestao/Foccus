// Guia "Como usar" — fonte única de conteúdo usada em dois lugares
// (how-to-modal.tsx): o popup de boas-vindas (1x por usuário, ver
// app-shell.tsx) e o item "Como usar" no menu lateral, abertos a qualquer
// momento. Foco em usabilidade do dia a dia (como fazer X), não em conceitos
// internos do sistema.
export type HowToSection = {
  icon: string;
  title: string;
  steps: string[];
};

export const HOW_TO_SECTIONS: HowToSection[] = [
  {
    icon: "✅",
    title: "Criar e editar tarefas",
    steps: [
      'Digite o título no campo "Criar tarefa rápida" (topo da lista ou "+ Tarefa" na barra lateral) e pressione Enter.',
      "Clique na tarefa pra abrir o painel de detalhe: dá pra mudar projeto, prioridade, status, prazo, descrição, checklist e anotações.",
      "Pra concluir, marque o ✓ na linha da tarefa ou use o botão \"Concluir tarefa\" no painel de detalhe.",
      'Status "Em Andamento" ou "Aguardando" liberam o % de conclusão e o cronômetro (Iniciar/Pausar) no painel de detalhe.',
    ],
  },
  {
    icon: "📁",
    title: "Criar projetos",
    steps: [
      'Vá em "Projetos" no menu lateral e clique em "Novo Projeto".',
      "Dê um nome e escolha uma cor — ela identifica o projeto em todas as telas (Kanban, Gantt, etc.).",
      "Ao criar ou editar uma tarefa, escolha o projeto no campo \"Projeto\" — sem escolher, ela fica em Inbox.",
    ],
  },
  {
    icon: "👤",
    title: "Cadastrar pessoas",
    steps: [
      'Vá em "Pessoas" no menu lateral e clique em "Nova Pessoa", ou crie direto ao marcar uma tarefa como "Aguardando" (opção "+ Nova pessoa..." no campo Aguardando quem).',
      'Toda tarefa com status "Aguardando" fica associada a uma pessoa e some do seu foco até o prazo de retorno.',
    ],
  },
  {
    icon: "🔎",
    title: "Organizar com filtros e busca",
    steps: [
      'Use os filtros acima da lista (P1, Aguardando, Bloqueadas, Atrasadas) pra focar num recorte específico.',
      'Os seletores "Todos os Projetos" e "Todas as Pessoas" restringem a lista a um projeto ou pessoa só.',
      '"Agrupar" reorganiza a lista por projeto, prioridade ou pessoa em vez da ordem padrão.',
      "Pressione / (ou clique na barra de busca) pra achar qualquer tarefa, projeto ou pessoa pelo nome.",
    ],
  },
  {
    icon: "📊",
    title: "Acompanhar pelo Dashboard",
    steps: [
      '"Dashboard" no menu lateral abre o Painel do Projeto, com 5 visões: Kanban, Gantt, Burndown, Visão Geral e WIP.',
      "Kanban e Gantt mostram o andamento por status/prazo; Burndown compara o ritmo real com o ideal.",
      '"Visão Geral" compara projetos entre si; "WIP" mostra quantas tarefas existem por dia e como elas se distribuem entre concluídas, em andamento, futuras e sem status/data.',
      'Filtre o Dashboard inteiro por projeto no seletor "Todos os Projetos" no topo da página.',
    ],
  },
];
