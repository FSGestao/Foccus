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
  anyModalOpen: () => boolean;
  closeAllModals: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  newTaskModalOpen: false,
  newPersonModalOpen: false,
  shortcutsModalOpen: false,
  assistantModalOpen: false,
  fechamentoModalOpen: false,

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

  anyModalOpen: () => {
    const s = get();
    return (
      s.newTaskModalOpen || s.newPersonModalOpen || s.shortcutsModalOpen || s.assistantModalOpen || s.fechamentoModalOpen
    );
  },
  closeAllModals: () =>
    set({
      newTaskModalOpen: false,
      newPersonModalOpen: false,
      shortcutsModalOpen: false,
      assistantModalOpen: false,
      fechamentoModalOpen: false,
    }),
}));
