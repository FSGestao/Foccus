// Changelog mostrado aos usuários (release-notes-modal.tsx) — cada versão
// tocada em `package.json` que valha a pena avisar ganha uma entrada aqui,
// separada em "melhorias" (feature nova) e "correções" (bug resolvido).
// Não é 1:1 com CONTROLE_DE_VERSOES.txt do Foccus.dc/ (esse é só do
// Foccus.web, e a linguagem aqui é pra usuário final, não changelog técnico).
export type ReleaseNote = {
  version: string;
  date: string; // YYYY-MM-DD
  improvements: string[];
  fixes: string[];
};

// Mais recente primeiro.
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.10.0",
    date: "2026-09-23",
    improvements: [
      "Exportação e importação de tarefas, projetos e pessoas em CSV (tela Minha conta).",
      'Novo gadget de cronômetro flutuante: mostra o tempo rodando, lista as tarefas "A fazer", "Em andamento" e "Aguardando" e permite iniciar, pausar e parar o cronômetro sem abrir a tarefa. Ao parar, pergunta se a tarefa foi concluída.',
      "A linha da tarefa agora mostra o tempo do cronômetro (rodando ou já registrado) quando há espaço — o nome da tarefa continua tendo prioridade.",
      "Cadastro de Pessoa ganhou os campos opcionais Empresa e Setor.",
    ],
    fixes: [],
  },
  {
    version: "1.9.0",
    date: "2026-09-17",
    improvements: [
      'O card de "Nova tarefa" agora tem um campo de Data, além de nome, prioridade e projeto.',
    ],
    fixes: [
      'O botão "Cadastrar nova pessoa" foi removido do menu lateral (o cadastro de pessoas continua disponível na tela de Pessoas).',
    ],
  },
  {
    version: "1.8.0",
    date: "2026-09-14",
    improvements: [
      'Guia "Como usar": um passo a passo rápido sobre tarefas, projetos, pessoas, filtros e Dashboard — aparece uma vez pra todo mundo e fica sempre disponível no menu lateral.',
    ],
    fixes: [],
  },
  {
    version: "1.7.2",
    date: "2026-09-14",
    improvements: ["Este card: sempre que houver melhorias ou correções novas, elas aparecem aqui no seu próximo acesso."],
    fixes: [],
  },
  {
    version: "1.6.1",
    date: "2026-09-14",
    improvements: [],
    fixes: [
      'Um valor com vírgula/ponto na Estimativa (minutos) ou no % de conclusão não trava mais o salvamento da tarefa.',
      "Falha ao salvar agora avisa por alguns segundos e some sozinha, em vez de ficar presa no topo da tela.",
      'No gráfico de WIP, as barras e a linha "Sem status ou sem data" ficaram bem mais visíveis, com números no eixo e ao passar o mouse.',
    ],
  },
  {
    version: "1.6.0",
    date: "2026-09-14",
    improvements: [
      "Cronômetro manual em cada tarefa: inicie/pause pra medir o tempo real gasto e comparar com a estimativa.",
      'Nova aba "WIP" no Painel do Projeto, com o total de tarefas por dia e a evolução por status.',
    ],
    fixes: [],
  },
];

function parseVersion(v: string): number[] {
  return v.split(".").map((n) => parseInt(n, 10) || 0);
}

// true se `a` é mais nova que `b` (comparação numérica por partícula, não
// alfabética — "1.10.0" > "1.9.0").
export function isVersionNewer(a: string, b: string): boolean {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

// Entradas que o usuário ainda não confirmou (profiles.last_seen_release),
// mais recente primeiro. `lastSeen` null (usuário nunca viu o card antes,
// incluindo quem já usava o sistema antes dessa feature existir) mostra o
// changelog inteiro — é exatamente o "correções e ajustes precisam ser
// mostrados" que gerou esse pedido.
export function getUnseenReleaseNotes(lastSeen: string | null): ReleaseNote[] {
  if (!lastSeen) return RELEASE_NOTES;
  return RELEASE_NOTES.filter((n) => isVersionNewer(n.version, lastSeen));
}
