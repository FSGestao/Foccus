export const metadata = { title: "Política de Privacidade — Foccus" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-12 text-sm leading-relaxed">
      <h1 className="text-xl font-semibold">Política de Privacidade</h1>
      <p className="text-zinc-500">Última atualização: setembro de 2026.</p>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">1. O que o Foccus coleta</h2>
        <p>
          O Foccus é uma ferramenta pessoal de gestão de tarefas e projetos. Para funcionar, ele
          guarda:
        </p>
        <ul className="list-disc pl-5">
          <li>Nome e e-mail da sua conta Google, usados só para login e identificação.</li>
          <li>
            O conteúdo que você cria dentro do sistema: tarefas, projetos, pessoas cadastradas
            e anotações.
          </li>
        </ul>
        <p>Não coletamos dados de navegação, localização, nem nenhuma informação além dessas.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">2. Como os dados são usados</h2>
        <p>
          Exclusivamente para o funcionamento do próprio sistema — exibir suas tarefas, permitir
          login e manter seus dados sincronizados entre dispositivos. Nada é vendido,
          compartilhado com terceiros ou usado para publicidade.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">3. Isolamento entre usuários</h2>
        <p>
          Cada pessoa só acessa os próprios dados. As regras de acesso ao banco de dados
          (Row Level Security) impedem, no nível do banco, que um usuário veja ou altere
          informações de outro — não é só uma checagem de tela.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">4. Onde os dados ficam</h2>
        <p>
          Os dados são armazenados no Supabase (infraestrutura sobre PostgreSQL). O acesso é
          restrito à sua conta autenticada por login Google.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">5. Seus direitos (LGPD)</h2>
        <p>Você pode, a qualquer momento, dentro do sistema (em &quot;Minha conta&quot;):</p>
        <ul className="list-disc pl-5">
          <li>Exportar uma cópia de todos os seus dados em formato JSON.</li>
          <li>Excluir permanentemente sua conta e todos os seus dados.</li>
        </ul>
        <p>
          Um administrador também pode revogar o seu acesso ao sistema (sem apagar os dados) ou,
          a seu pedido, apagar sua conta manualmente.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">6. Contato</h2>
        <p>
          Dúvidas sobre esta política ou sobre seus dados: fale com o administrador que te
          convidou para o sistema.
        </p>
      </section>
    </div>
  );
}
