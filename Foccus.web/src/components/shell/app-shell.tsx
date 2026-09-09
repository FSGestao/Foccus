"use client";

import { useEffect, useState } from "react";
import type { Priority } from "@/lib/tasks/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useThemeStore } from "@/lib/theme/theme-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { useSearchStore } from "@/lib/stores/search-store";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { usePeopleStore } from "@/lib/stores/people-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import {
  computeDailyEfficiency,
  computeDoneTasksToday,
  computeEmProgressoCount,
  QUICK_WIN_IDLE_MS,
} from "@/lib/assistant/compute";
import { useDisplayName } from "@/lib/hooks/use-display-name";
import { NavIcon, type NavKey } from "./nav-icons";
import { SearchOverlay } from "./search-overlay";
import { ShortcutsModal } from "./shortcuts-modal";
import { AssistantModal } from "./assistant-modal";
import { FechamentoModal } from "./fechamento-modal";
import { NewTaskModal } from "@/components/tasks/new-task-modal";
import { PersonModal } from "@/components/people/person-modal";
import { AdminUsersModal } from "@/components/admin/admin-users-modal";

// Header + sidebar mini-rail, portados de Foccus.dc.html:49-150 (mesma paleta,
// mesma largura de rail 56/200px). Itens com `href: null` ainda não têm tela
// própria — ficam visíveis (fiel ao layout do sistema completo) porém
// desabilitados, com tooltip "em breve", pra não virar link morto.
const NAV_ITEMS: { key: NavKey; label: string; href: string | null }[] = [
  { key: "list", label: "Minha Lista", href: "/" },
  { key: "projects", label: "Projetos", href: "/projects" },
  { key: "people", label: "Pessoas", href: "/people" },
  { key: "notes", label: "Anotações", href: "/notes" },
  { key: "waiting", label: "Aguardando", href: "/waiting" },
  { key: "kanban", label: "Kanban", href: "/kanban" },
  { key: "calendar", label: "Calendário", href: "/calendar" },
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, init: initTheme, toggleTheme } = useThemeStore();
  const ui = useUiStore();
  const searchQuery = useSearchStore((s) => s.query);
  const setSearchQuery = useSearchStore((s) => s.setQuery);
  const tasks = useTasksStore((s) => s.tasks);
  const initTasks = useTasksStore((s) => s.init);
  const createTask = useTasksStore((s) => s.createTask);
  const initProjects = useProjectsStore((s) => s.init);
  const initPeople = usePeopleStore((s) => s.init);
  const createPerson = usePeopleStore((s) => s.createPerson);
  const profile = useProfileStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const { fullName, firstName: userFirstName, initials, email } = useDisplayName();

  useEffect(() => {
    initTheme();
    // A busca cruza tasks/projects/people — carrega os três aqui, uma vez,
    // pra funcionar em qualquer tela (cada store idempotente o suficiente pra
    // ser re-inicializado de novo por uma página específica sem problema).
    initTasks();
    initProjects();
    initPeople();
    useProfileStore.getState().init();

    // Atalhos de teclado (Foccus.dc.html:1860-1880): Esc fecha modais e
    // desseleciona a tarefa aberta; `/` foca a busca; `N` abre Nova Tarefa;
    // `?` abre o guia de atalhos. Lê o estado via getState() (não subscreve)
    // pra não precisar recriar o listener a cada render.
    function onKeyDown(e: KeyboardEvent) {
      const tag = document.activeElement?.tagName.toLowerCase() ?? "";
      const isInput =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;

      if (e.key === "Escape") {
        useUiStore.getState().closeAllModals();
        useTasksStore.getState().openTask(null);
      } else if (e.key === "/" && !isInput) {
        e.preventDefault();
        document.getElementById("foccus-search-input")?.focus();
        (document.getElementById("foccus-search-input") as HTMLInputElement | null)?.select();
      } else if (
        (e.key === "n" || e.key === "N") &&
        !isInput &&
        !useTasksStore.getState().selectedTaskId &&
        !useUiStore.getState().anyModalOpen()
      ) {
        e.preventDefault();
        useUiStore.getState().openNewTaskModal();
      } else if (e.key === "?" && !isInput) {
        e.preventDefault();
        useUiStore.getState().toggleShortcutsModal();
      }
    }
    window.addEventListener("keydown", onKeyDown);

    // Assistente proativo (Foccus.dc.html:1927-1995): checa a cada 60s (e uma
    // vez de cara) se é hora do Ritual de Fechamento ou se o board ficou
    // parado tempo suficiente pra sugerir Vitórias Rápidas.
    function tickAssistant() {
      const p = useProfileStore.getState();
      if (!p.loaded) return;
      p.checkFechamentoTrigger(useUiStore.getState().anyModalOpen() || !!useTasksStore.getState().selectedTaskId).then(
        (triggered) => {
          if (triggered) useUiStore.getState().openFechamentoModal();
        },
      );
      if (p.asstQuickwinAtivo) {
        const idleMs = Date.now() - (p.lastActivityAt ? new Date(p.lastActivityAt).getTime() : Date.now());
        p.setQuickWinBannerActive(idleMs >= QUICK_WIN_IDLE_MS);
      }
    }
    tickAssistant();
    const assistantTimer = setInterval(tickAssistant, 60_000);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearInterval(assistantTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebarWidth = menuOpen ? 200 : 56;
  const emProgressoCount = computeEmProgressoCount(tasks);
  const { progressPct, doneTasks, totalTasks } = computeDailyEfficiency(tasks);
  const doneTasksToday = computeDoneTasksToday(tasks);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Navegação forçada (não router.push): reseta todas as stores Zustand em
    // memória (tasks/projects/people/profile ficariam com dados do usuário
    // anterior se a SPA continuasse viva) — intencional, não um descuido.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--pb-bg)",
        backgroundImage: "var(--pb-bg-gradient)",
        backgroundAttachment: "fixed",
        color: "var(--pb-text)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--pb-glass)",
          borderBottom: "1px solid var(--pb-border)",
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "0 24px",
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              title="Alternar menu lateral"
              aria-label="Menu de navegação"
              style={{
                cursor: "pointer",
                padding: 6,
                borderRadius: 6,
                border: "1px solid var(--pb-border)",
                background: "var(--pb-surface-subtle)",
                color: "var(--pb-text)",
                display: "flex",
              }}
            >
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <line x1={2} y1={4} x2={14} y2={4} />
                <line x1={2} y1={8} x2={14} y2={8} />
                <line x1={2} y1={12} x2={14} y2={12} />
              </svg>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "var(--pb-accent)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                F
              </span>
              <span>Foccus</span>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 440, margin: "0 12px", position: "relative" }}>
            <input
              id="foccus-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchQuery("");
              }}
              placeholder="Buscar tarefas, projetos, pessoas..."
              style={{
                width: "100%",
                height: 32,
                padding: "4px 10px",
                fontSize: 12.5,
                color: "var(--pb-text)",
                background: "var(--pb-surface-subtle)",
                border: "1px solid var(--pb-border)",
                borderRadius: 6,
              }}
            />
            <SearchOverlay />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={ui.toggleShortcutsModal}
              title="Guia de Atalhos de Teclado (Pressione ?)"
              style={{
                cursor: "pointer",
                fontSize: 12,
                color: "var(--pb-text-muted)",
                background: "var(--pb-surface)",
                border: "1px solid var(--pb-border)",
                borderRadius: 6,
                padding: "5px 9px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ⌨
            </button>
            <button
              type="button"
              onClick={ui.openAssistantModal}
              title="Configurações do Assistente Inteligente"
              style={{
                cursor: "pointer",
                fontSize: 12,
                color: "var(--pb-accent)",
                background: "var(--pb-surface)",
                border: "1px solid var(--pb-accent)",
                borderRadius: 6,
                padding: "5px 9px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>✨</span>
              <span>Assistente</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              title="Alternar entre modo claro e escuro"
              style={{
                cursor: "pointer",
                fontSize: 12,
                color: "var(--pb-text-muted)",
                background: "var(--pb-surface)",
                border: "1px solid var(--pb-border)",
                borderRadius: 6,
                padding: "5px 10px",
              }}
            >
              {theme === "dark" ? "Modo claro" : "Modo escuro"}
            </button>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setAvatarMenuOpen((v) => !v)}
                title={`${fullName} (clique para opções da conta)`}
                style={{
                  cursor: "pointer",
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: "var(--pb-accent)",
                  color: "#fff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {initials}
              </button>

              {avatarMenuOpen && (
                <>
                  <div
                    onClick={() => setAvatarMenuOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 29 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      zIndex: 30,
                      minWidth: 200,
                      // Fundo sólido (era --pb-glass-strong, translúcido com
                      // blur) — mesmo ajuste do search-overlay.tsx: o vidro se
                      // misturava com o conteúdo da página atrás, confuso.
                      background: "var(--pb-surface)",
                      border: "1px solid var(--pb-border)",
                      borderRadius: 10,
                      boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div style={{ padding: "4px 8px 8px", borderBottom: "1px solid var(--pb-border)" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--pb-text)" }}>{fullName}</div>
                      {email && (
                        <div style={{ fontSize: 11.5, color: "var(--pb-text-muted)", marginTop: 2 }}>{email}</div>
                      )}
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setAvatarMenuOpen(false)}
                      style={{
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--pb-text)",
                        borderRadius: 6,
                        padding: "6px 8px",
                      }}
                    >
                      Minha conta
                    </Link>
                    {profile.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          ui.openAdminUsersModal();
                        }}
                        style={{
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--pb-text)",
                          background: "transparent",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 8px",
                        }}
                      >
                        Administração
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#ef4444",
                        background: "transparent",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 8px",
                      }}
                    >
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Global Progress Bar — eficiência diária (Foccus.dc.html:90-93) */}
        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Eficiência diária"
          title={`Eficiência diária: ${progressPct}% das tarefas de hoje concluídas (${doneTasks}/${totalTasks})`}
          style={{ height: 2, background: "var(--pb-border)" }}
        >
          <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--pb-accent)", transition: "width 0.4s ease" }} />
        </div>
      </header>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          title="Clique para fechar o menu"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 18 }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          // Header (sticky) tem 50px de conteúdo + 2px da barra de progresso =
          // 52px. O aside é `fixed` (fora do fluxo normal), então sem esse
          // offset ele começa em y:0 igual ao header e fica embaixo dele
          // (z-index 19 < 20) — cortando o topo do rail.
          top: 52,
          left: 0,
          bottom: 0,
          width: sidebarWidth,
          background: "var(--pb-glass)",
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          borderRight: "1px solid var(--pb-border)",
          zIndex: 19,
          padding: "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          transition: "width .15s ease",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {/* Um único bloco (Foccus.dc.html: sidebarActionStyle) — antes cada
            botão vivia num wrapper à parte, somando o gap do aside a mais um
            padding/borda individuais e deixando o rail "esticado". */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            paddingBottom: 8,
            borderBottom: "1px solid var(--pb-border)",
            marginBottom: 4,
          }}
        >
          <button
            type="button"
            onClick={ui.openNewTaskModal}
            title="Criar nova tarefa"
            style={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              color: "#fff",
              background: "var(--pb-accent)",
              border: "none",
              borderRadius: 6,
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: menuOpen ? "flex-start" : "center",
              width: "100%",
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 600 }}>+</span>
            {menuOpen && <span>Tarefa</span>}
          </button>

          <button
            type="button"
            onClick={ui.openNewPersonModal}
            title="Cadastrar nova pessoa"
            style={{
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
              color: "var(--pb-text)",
              background: "var(--pb-surface-subtle)",
              border: "1px solid var(--pb-border)",
              borderRadius: 6,
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: menuOpen ? "flex-start" : "center",
              width: "100%",
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 600 }}>+</span>
            {menuOpen && <span>Pessoa</span>}
          </button>
        </div>

        {menuOpen && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--pb-text-dim)",
              padding: "4px 8px 0",
            }}
          >
            Vistas
          </div>
        )}

        <nav
          aria-label="Menu principal"
          style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: menuOpen ? "stretch" : "center" }}
        >
          {NAV_ITEMS.map((item) => {
            const disabled = item.href === null;
            const active = !disabled && item.href === pathname;
            const commonStyle: React.CSSProperties = {
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 10px",
              textDecoration: "none",
              fontSize: 13,
              borderRadius: 6,
              color: disabled ? "var(--pb-text-dim)" : active ? "var(--pb-accent)" : "var(--pb-text)",
              fontWeight: active ? 600 : 400,
              background: active ? "var(--pb-accent-bg)" : "transparent",
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.55 : 1,
            };
            const content = (
              <>
                <span style={{ display: "inline-flex", flex: "none" }} aria-hidden>
                  <NavIcon name={item.key} />
                </span>
                {menuOpen && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>}
              </>
            );

            if (disabled) {
              return (
                <span key={item.key} title={`${item.label} (em breve)`} aria-disabled style={commonStyle}>
                  {content}
                </span>
              );
            }
            return (
              <Link key={item.key} href={item.href!} title={item.label} style={commonStyle}>
                {content}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={{ marginLeft: sidebarWidth, transition: "margin-left .15s ease" }}>{children}</main>

      {/* Modais globais — moram aqui (não em cada tela) porque os atalhos
          N/?/Esc e o botão "+ Tarefa" da sidebar precisam funcionar de
          qualquer rota. */}
      {ui.newTaskModalOpen && (
        <NewTaskModal
          onClose={ui.closeNewTaskModal}
          onSubmit={(title: string, priority: Priority, project_id: string | null) =>
            createTask({ title, priority, project_id })
          }
        />
      )}
      {ui.newPersonModalOpen && (
        <PersonModal onClose={ui.closeNewPersonModal} onSubmit={(patch) => createPerson(patch)} />
      )}
      {ui.shortcutsModalOpen && <ShortcutsModal onClose={ui.closeShortcutsModal} />}
      {ui.assistantModalOpen && <AssistantModal onClose={ui.closeAssistantModal} emProgressoCount={emProgressoCount} />}
      {ui.fechamentoModalOpen && (
        <FechamentoModal
          onClose={ui.closeFechamentoModal}
          userFirstName={userFirstName}
          doneTasksToday={doneTasksToday}
          fechamentoStreak={profile.fechamentoStreak}
        />
      )}
      {ui.adminUsersModalOpen && <AdminUsersModal onClose={ui.closeAdminUsersModal} />}
    </div>
  );
}
