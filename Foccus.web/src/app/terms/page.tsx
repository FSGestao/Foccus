export const metadata = { title: "Termos de Uso — Foccus" };

export default function TermsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-12 text-sm leading-relaxed">
      <h1 className="text-xl font-semibold">Termos de Uso</h1>
      <p className="text-zinc-500">Última atualização: setembro de 2026.</p>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">1. Sobre o Foccus</h2>
        <p>
          O Foccus é uma ferramenta de gestão de tarefas e projetos de uso pessoal, com acesso
          restrito por convite. Só entra quem foi cadastrado por um administrador.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">2. Acesso</h2>
        <p>
          O login é feito exclusivamente pela sua conta Google. O acesso pode ser revogado por
          um administrador a qualquer momento, sem aviso prévio — os dados não são apagados
          nesse caso, só o login para de funcionar.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">3. Responsabilidade sobre o conteúdo</h2>
        <p>
          Você é responsável pelo conteúdo que cadastra (tarefas, projetos, pessoas, anotações).
          Não use o sistema para armazenar dados sensíveis de terceiros sem autorização deles.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">4. Disponibilidade</h2>
        <p>
          O sistema é oferecido &quot;como está&quot;, sem garantia de disponibilidade contínua.
          Faça backups pessoais (exportação de dados em &quot;Minha conta&quot;) se o conteúdo for
          crítico para você.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">5. Alterações</h2>
        <p>
          Estes termos e a Política de Privacidade podem ser atualizados conforme o sistema
          evolui. Alterações relevantes serão comunicadas pelo administrador.
        </p>
      </section>
    </div>
  );
}
