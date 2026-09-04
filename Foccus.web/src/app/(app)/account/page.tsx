"use client";

import { useDisplayName } from "@/lib/hooks/use-display-name";
import { DeleteAccountForm } from "@/components/account/delete-account-form";

// Minha conta — dados pessoais (LGPD art. 9º), exportação (art. 18, II) e
// exclusão (art. 18, VI) dos próprios dados. Acessível pelo menu do avatar.
export default function AccountPage() {
  const { fullName, email } = useDisplayName();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8">
      <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
        Minha conta
      </h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--pb-text-muted)" }}>
          Meus dados
        </h2>
        <p className="text-sm" style={{ color: "var(--pb-text)" }}>
          {fullName} {email && <span style={{ color: "var(--pb-text-muted)" }}>· {email}</span>}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--pb-text-muted)" }}>
          Exportar meus dados
        </h2>
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Baixa um arquivo com o seu perfil, tarefas, projetos, pessoas e anotações — tudo que
          é seu no sistema.
        </p>
        <a
          href="/api/account/export"
          className="self-start rounded-md px-4 py-2 text-sm font-medium"
          style={{
            background: "var(--pb-glass-strong)",
            border: "1px solid var(--pb-border)",
            color: "var(--pb-text)",
          }}
        >
          Baixar meus dados (.json)
        </a>
      </section>

      <section
        className="flex flex-col gap-3 rounded-lg p-4"
        style={{ border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.06)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "#ef4444" }}>
          Zona de perigo
        </h2>
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Excluir sua conta apaga permanentemente suas tarefas, projetos, pessoas e anotações,
          além do próprio login. Não pode ser desfeito.
        </p>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
