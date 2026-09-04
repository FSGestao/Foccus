import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { NewTaskInput, Task } from "@/lib/tasks/types";
import { useProfileStore } from "@/lib/stores/profile-store";
import { computeEmProgressoCount } from "@/lib/assistant/compute";

type ToastState = {
  id: number;
  message: string;
  onUndo?: () => void;
} | null;

type TasksState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  userId: string | null;
  selectedTaskId: string | null;
  toast: ToastState;

  init: () => Promise<void>;
  quickAdd: (title: string) => Promise<void>;
  createTask: (input: NewTaskInput) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>, note?: string) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  dismissToast: () => void;
  openTask: (id: string | null) => void;
  showComboToast: () => void;
  showInfoToast: (message: string) => void;
  bulkUpdate: (ids: string[], patch: Partial<Task>, note?: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
};

let toastCounter = 0;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

// Store client-side (Zustand, já era dependência instalada sem uso). Cada ação
// chama o client de navegador direto em `tasks` — RLS (0002_rls.sql) já garante
// que só as linhas do próprio usuário são lidas/afetadas, não precisa de Server
// Action pra isso (diferente do fluxo de admin, que usa service-role pra ignorar
// RLS de propósito).
export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: true,
  error: null,
  userId: null,
  selectedTaskId: null,
  toast: null,

  init: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false, error: "Não autenticado." });
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ tasks: (data ?? []) as Task[], userId: user.id, loading: false, error: null });
  },

  quickAdd: async (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await get().createTask({ title: trimmed });
  },

  createTask: async ({ title, priority, project_id }) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: title.trim(),
        priority: priority ?? "P3",
        status: "TODO",
        project_id: project_id ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? "Falha ao criar tarefa." });
      return;
    }
    set((state) => ({ tasks: [data as Task, ...state.tasks] }));
  },

  updateTask: async (id, patch, note) => {
    const supabase = createClient();
    const current = get().tasks.find((t) => t.id === id);
    if (!current) return;

    const fullPatch: Partial<Task> = { ...patch, updated_at: new Date().toISOString() };
    if (note) {
      fullPatch.history = [
        ...(current.history ?? []),
        { date: new Date().toISOString(), desc: note },
      ];
    }

    // "Combo de Fluxo" (Foccus.dc.html:2012-2024): se esta atualização tirou
    // "Em Progresso" de cima do limite configurado, comemora — no máximo uma
    // vez por dia. Calculado antes do set() otimista, com o "antes"/"depois"
    // da mudança de status.
    const profile = useProfileStore.getState();
    if (patch.status && profile.loaded && profile.asstGargaloAtivo) {
      const before = computeEmProgressoCount(get().tasks);
      const after = computeEmProgressoCount(get().tasks.map((t) => (t.id === id ? { ...t, ...fullPatch } : t)));
      if (before > profile.asstGargaloLimite && after <= profile.asstGargaloLimite) {
        profile.recordGargaloCombo().then((didCombo) => {
          if (didCombo) get().showComboToast();
        });
      }
    }
    profile.registerActivity();

    // Otimista: aplica local antes da resposta do servidor, pra edição inline
    // (prioridade, data, checklist) parecer instantânea.
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...fullPatch } : t)),
    }));

    const { error } = await supabase.from("tasks").update(fullPatch).eq("id", id);
    if (error) {
      // Reverte pro estado anterior em caso de falha.
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? current : t)),
        error: error.message,
      }));
    }
  },

  showComboToast: () => {
    get().showInfoToast('🎉 Combo de Fluxo! Você limpou o gargalo de "Em Progresso" hoje.');
  },

  showInfoToast: (message) => {
    const thisToastId = ++toastCounter;
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { id: thisToastId, message } });
    toastTimer = setTimeout(() => {
      set((state) => (state.toast?.id === thisToastId ? { toast: null } : {}));
    }, 4000);
  },

  // Ações em massa (Foccus.dc.html: applyBulkProjectValue/applyBulkPriorityValue/
  // applyBulkComplete) — reaproveita updateTask por id, que já cuida do
  // otimista + histórico + rollback individualmente; N updates em paralelo é
  // rápido o bastante pra escala de uma lista pessoal.
  bulkUpdate: async (ids, patch, note) => {
    await Promise.all(ids.map((id) => get().updateTask(id, patch, note)));
  },

  // Diferente de deleteTask (1 toast por chamada): aqui é 1 toast só pro lote
  // inteiro, com "Desfazer" reinserindo todas as linhas de uma vez.
  bulkDelete: async (ids) => {
    if (!ids.length) return;
    const supabase = createClient();
    const snapshots = get().tasks.filter((t) => ids.includes(t.id));
    if (!snapshots.length) return;

    set((state) => ({
      tasks: state.tasks.filter((t) => !ids.includes(t.id)),
      selectedTaskId: state.selectedTaskId && ids.includes(state.selectedTaskId) ? null : state.selectedTaskId,
    }));

    const { error } = await supabase.from("tasks").delete().in("id", ids);
    if (error) {
      set((state) => ({ tasks: [...snapshots, ...state.tasks], error: error.message }));
      return;
    }

    const thisToastId = ++toastCounter;
    if (toastTimer) clearTimeout(toastTimer);
    set({
      toast: {
        id: thisToastId,
        message: `${snapshots.length} tarefa(s) excluída(s).`,
        onUndo: async () => {
          const { error: reinsertError } = await supabase.from("tasks").insert(snapshots);
          if (!reinsertError) {
            set((state) => ({ tasks: [...snapshots, ...state.tasks], toast: null }));
          }
        },
      },
    });
    toastTimer = setTimeout(() => {
      set((state) => (state.toast?.id === thisToastId ? { toast: null } : {}));
    }, 6000);
  },

  toggleDone: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const isDone = task.status === "DONE";
    await get().updateTask(
      id,
      {
        status: isDone ? "TODO" : "DONE",
        completed_at: isDone ? null : new Date().toISOString(),
      },
      isDone ? "Reaberta" : "Marcada como concluída",
    );
  },

  deleteTask: async (id) => {
    const supabase = createClient();
    const snapshot = get().tasks.find((t) => t.id === id);
    if (!snapshot) return;

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    }));

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      // Apagar de verdade falhou — devolve a linha pra lista, sem oferecer
      // "desfazer" (nunca chegou a sumir do banco).
      set((state) => ({ tasks: [snapshot, ...state.tasks], error: error.message }));
      return;
    }

    // Diferente do legado (undo em memória, sobre um blob de localStorage): aqui
    // o delete já é definitivo no Postgres, então "desfazer" reinsere a mesma
    // linha (mesmo id) enquanto o toast estiver de pé.
    const thisToastId = ++toastCounter;
    if (toastTimer) clearTimeout(toastTimer);

    set({
      toast: {
        id: thisToastId,
        message: `Tarefa "${snapshot.title}" excluída.`,
        onUndo: async () => {
          const { error: reinsertError } = await supabase.from("tasks").insert(snapshot);
          if (!reinsertError) {
            set((state) => ({ tasks: [snapshot, ...state.tasks], toast: null }));
          }
        },
      },
    });

    toastTimer = setTimeout(() => {
      set((state) => (state.toast?.id === thisToastId ? { toast: null } : {}));
    }, 6000);
  },

  dismissToast: () => set({ toast: null }),

  openTask: (id) => set({ selectedTaskId: id }),
}));
