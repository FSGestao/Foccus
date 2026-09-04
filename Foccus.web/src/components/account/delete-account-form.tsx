"use client";

import { useActionState } from "react";
import { deleteMyAccountAction } from "@/lib/actions/account";

// Formulário de exclusão de conta — fica dentro de /account. Exige digitar
// "EXCLUIR" pra confirmar, texto extra de segurança já que a ação é
// irreversível (apaga tarefas, projetos, pessoas, anotações e a conta).
export function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteMyAccountAction, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        if (!window.confirm("Excluir sua conta e todos os seus dados? Isso não pode ser desfeito.")) {
          e.preventDefault();
        }
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--pb-text)" }}>
        Digite <strong>EXCLUIR</strong> pra confirmar
        <input
          name="confirm"
          type="text"
          required
          autoComplete="off"
          style={{
            background: "var(--pb-bg)",
            border: "1px solid var(--pb-border)",
            color: "var(--pb-text)",
            borderRadius: 6,
            padding: "6px 10px",
            maxWidth: 220,
          }}
        />
      </label>
      {state && !state.success && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        style={{ background: "#ef4444" }}
      >
        {pending ? "Excluindo..." : "Excluir minha conta"}
      </button>
    </form>
  );
}
