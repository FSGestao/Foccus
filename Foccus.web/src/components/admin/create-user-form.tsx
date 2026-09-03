"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { inviteUserAction } from "@/lib/actions/admin-users";

export function CreateUserForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(inviteUserAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border rounded-md px-3 py-2 text-sm"
          placeholder="pessoa@exemplo.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="userName" className="text-sm font-medium">
          Nome (opcional)
        </label>
        <input
          id="userName"
          name="userName"
          type="text"
          className="border rounded-md px-3 py-2 text-sm"
          placeholder="Nome de exibição"
        />
      </div>
      {state && !state.success && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">
          Convite criado. A conta é ativada no primeiro login dessa pessoa com Google.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-foreground text-background rounded-md py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Convidando..." : "Convidar usuário"}
      </button>
    </form>
  );
}
