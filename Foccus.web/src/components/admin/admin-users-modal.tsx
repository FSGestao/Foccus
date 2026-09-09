"use client";

import { useEffect, useState, useTransition } from "react";
import {
  cancelInviteAction,
  getAdminUsersDataAction,
  inviteUserAction,
  setUserDisabledAction,
  setUserRoleAction,
  type AdminInviteRow,
  type AdminProfileRow,
} from "@/lib/actions/admin-users";
import { useProfileStore } from "@/lib/stores/profile-store";

// "Administração" — só visível pra quem já é admin (item no menu do avatar,
// ver app-shell.tsx). Mesmo padrão visual de ProjectModal/PersonModal (card
// central, fundo com blur), só que maior e com fundo sólido (--pb-surface,
// não --pb-glass) porque aqui dentro tem tabela densa — o mesmo motivo que já
// levou o menu do avatar e o dropdown de busca a saírem do vidro translúcido.
// Substitui /admin/users como caminho principal (a rota continua existindo,
// só não é mais o único jeito de chegar aqui).
export function AdminUsersModal({ onClose }: { onClose: () => void }) {
  const currentUserId = useProfileStore((s) => s.userId);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [invites, setInvites] = useState<AdminInviteRow[]>([]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function reload() {
    setLoading(true);
    setLoadError(null);
    const result = await getAdminUsersDataAction();
    if (!result.success) {
      setLoadError(result.error);
      setLoading(false);
      return;
    }
    setProfiles(result.data.profiles);
    setInvites(result.data.invites);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carrega os dados do painel só ao abrir, uma vez
    reload();
  }, []);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteError(null);
    startTransition(async () => {
      const result = await inviteUserAction(null, (() => {
        const fd = new FormData();
        fd.set("email", email);
        fd.set("userName", inviteName.trim());
        return fd;
      })());
      if (!result.success) {
        setInviteError(result.error);
        return;
      }
      setInviteEmail("");
      setInviteName("");
      await reload();
    });
  }

  function handleCancelInvite(email: string) {
    if (!window.confirm(`Cancelar o convite de ${email}?`)) return;
    setRowError(null);
    startTransition(async () => {
      const result = await cancelInviteAction(email);
      if (!result.success) {
        setRowError(result.error);
        return;
      }
      await reload();
    });
  }

  function handleToggleDisabled(userId: string, disabled: boolean) {
    setRowError(null);
    startTransition(async () => {
      const result = await setUserDisabledAction(userId, !disabled);
      if (!result.success) {
        setRowError(result.error);
        return;
      }
      await reload();
    });
  }

  function handleRoleChange(userId: string, role: "admin" | "user") {
    setRowError(null);
    startTransition(async () => {
      const result = await setUserRoleAction(userId, role);
      if (!result.success) {
        setRowError(result.error);
        return;
      }
      await reload();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-2xl max-h-[85vh] flex-col gap-6 overflow-y-auto rounded-[10px] p-6"
        style={{
          background: "var(--pb-surface)",
          border: "1px solid var(--pb-border)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
          color: "var(--pb-text)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Administração — Usuários</h2>
          <button
            type="button"
            onClick={onClose}
            title="Fechar"
            className="rounded-md px-2 py-1 text-sm"
            style={{ color: "var(--pb-text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {loading && <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>Carregando...</p>}
        {loadError && <p className="text-sm" style={{ color: "var(--pb-red)" }}>{loadError}</p>}

        {!loading && !loadError && (
          <>
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--pb-text-muted)" }}>
                Novo usuário
              </h3>
              <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="pessoa@exemplo.com"
                    className="rounded-md px-3 py-2 text-sm"
                    style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)", minWidth: 220 }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
                    Nome (opcional)
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Nome de exibição"
                    className="rounded-md px-3 py-2 text-sm"
                    style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)", color: "var(--pb-text)", minWidth: 180 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md px-3.5 py-2 text-sm font-medium disabled:opacity-50"
                  style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)", cursor: "pointer" }}
                >
                  Convidar
                </button>
              </form>
              {inviteError && <p className="text-sm" style={{ color: "var(--pb-red)" }}>{inviteError}</p>}
            </section>

            {rowError && <p className="text-sm" style={{ color: "var(--pb-red)" }}>{rowError}</p>}

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold" style={{ color: "var(--pb-text-muted)" }}>
                Convites pendentes
              </h3>
              {invites.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>Nenhum convite pendente.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {invites.map((i) => (
                    <div
                      key={i.email}
                      className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                      style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{i.email}</div>
                        <div className="truncate text-xs" style={{ color: "var(--pb-text-muted)" }}>
                          {i.user_name || "—"} · convidado em {new Date(i.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCancelInvite(i.email)}
                        className="shrink-0 text-sm font-medium disabled:opacity-50"
                        style={{ color: "var(--pb-red)", background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold" style={{ color: "var(--pb-text-muted)" }}>
                Usuários cadastrados
              </h3>
              {profiles.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>Nenhum usuário cadastrado ainda.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {profiles.map((p) => {
                    const isSelf = p.id === currentUserId;
                    return (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                        style={{ background: "var(--pb-bg)", border: "1px solid var(--pb-border)" }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate">
                            {p.email} {isSelf && <span style={{ color: "var(--pb-text-dim)" }}>(você)</span>}
                          </div>
                          <div className="truncate text-xs" style={{ color: "var(--pb-text-muted)" }}>
                            {p.user_name || "—"}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <select
                            value={p.role}
                            disabled={isPending || isSelf}
                            title={isSelf ? "Você não pode alterar o próprio papel" : "Alterar papel"}
                            onChange={(e) => handleRoleChange(p.id, e.target.value as "admin" | "user")}
                            className="rounded-md px-2 py-1 text-sm disabled:opacity-50"
                            style={{ background: "var(--pb-surface)", border: "1px solid var(--pb-border)", color: "var(--pb-text)" }}
                          >
                            <option value="user">Usuário</option>
                            <option value="admin">Admin</option>
                          </select>
                          <span
                            className="text-xs font-medium"
                            style={{ color: p.disabled ? "var(--pb-red)" : "var(--pb-green)" }}
                          >
                            {p.disabled ? "Desativado" : "Ativo"}
                          </span>
                          <button
                            type="button"
                            disabled={isPending || isSelf}
                            title={isSelf ? "Você não pode desativar a própria conta" : undefined}
                            onClick={() => handleToggleDisabled(p.id, p.disabled)}
                            className="text-sm font-medium disabled:opacity-50"
                            style={{
                              color: p.disabled ? "var(--pb-green)" : "var(--pb-red)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {p.disabled ? "Reativar" : "Desativar"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
