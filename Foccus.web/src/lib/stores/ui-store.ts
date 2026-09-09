import { create } from "zustand";

// Estado de UI compartilhado entre o AppShell (sidebar, atalhos de teclado) e
// as telas — evita prop-drilling através do layout. Os modais "globais" (Nova
// Tarefa, Atalhos, Assistente, Fechamento) moram aqui porque o atalho `N`/`?`
// e o Escape precisam abri-los/fechá-los de qualquer tela, não só da Minha
// Lista.
type UiState = {
  newTaskModalOpen: boolean;
  newPersonModalOpen: boolean;
  shortcutsModalOpen: boolean;
  assistantModalOpen: boolean;
  fechamentoModalOpen: boolean;
  adminUsersModalOpen: boolean;

  openNewTaskModal: () => void;
  closeNewTaskModal: () => void;
  openNewPersonModal: () => void;
  closeNewPersonModal: () => void;
  toggleShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  openAssistantModal: () => void;
  closeAssistantModal: () => void;
  openFechamentoModal: () => void;
  closeFechamentoModal: () => void;
  openAdminUsersModal: () => void;
  closeAdminUsersModal: () => void;
  anyModalOpen: () => boolean;
  closeAllModals: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  newTaskModalOpen: false,
  newPersonModalOpen: false,
  shortcutsModalOpen: false,
  assistantModalOpen: false,
  fechamentoModalOpen: false,
  adminUsersModalOpen: false,

  openNewTaskModal: () => set({ newTaskModalOpen: true }),
  closeNewTaskModal: () => set({ newTaskModalOpen: false }),
  openNewPersonModal: () => set({ newPersonModalOpen: true }),
  closeNewPersonModal: () => set({ newPersonModalOpen: false }),
  toggleShortcutsModal: () => set((s) => ({ shortcutsModalOpen: !s.shortcutsModalOpen })),
  closeShortcutsModal: () => set({ shortcutsModalOpen: false }),
  openAssistantModal: () => set({ assistantModalOpen: true }),
  closeAssistantModal: () => set({ assistantModalOpen: false }),
  openFechamentoModal: () => set({ fechamentoModalOpen: true }),
  closeFechamentoModal: () => set({ fechamentoModalOpen: false }),
  openAdminUsersModal: () => set({ adminUsersModalOpen: true }),
  closeAdminUsersModal: () => set({ adminUsersModalOpen: false }),

  anyModalOpen: () => {
    const s = get();
    return (
      s.newTaskModalOpen ||
      s.newPersonModalOpen ||
      s.shortcutsModalOpen ||
      s.assistantModalOpen ||
      s.fechamentoModalOpen ||
      s.adminUsersModalOpen
    );
  },
  closeAllModals: () =>
    set({
      newTaskModalOpen: false,
      newPersonModalOpen: false,
      shortcutsModalOpen: false,
      assistantModalOpen: false,
      fechamentoModalOpen: false,
      adminUsersModalOpen: false,
    }),
}));
