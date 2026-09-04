"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserDisabledAction, cancelInviteAction } from "@/lib/actions/admin-users";

// Botão de desativar/reativar acesso de um usuário já provisionado (linha da
// tabela "Usuários cadastrados" em /admin/users).
export function ToggleUserDisabledButton({ userId, disabled }: { userId: string; disabled: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await setUserDisabledAction(userId, !disabled);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-sm font-medium underline disabled:opacity-50"
        style={{ color: disabled ? "#16a34a" : "#ef4444" }}
      >
        {isPending ? "..." : disabled ? "Reativar" : "Desativar"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

// Botão de cancelar um convite ainda não usado (linha da tabela "Convites
// pendentes" em /admin/users).
export function CancelInviteButton({ email }: { email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Cancelar o convite de ${email}?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelInviteAction(email);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-sm font-medium underline text-red-600 disabled:opacity-50"
      >
        {isPending ? "..." : "Cancelar"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
