import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { NewProjectInput, Project } from "@/lib/projects/types";
import { sortProjectsByPriority } from "@/lib/projects/sort";

type ProjectsState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  userId: string | null;

  init: () => Promise<void>;
  createProject: (input: NewProjectInput) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
};

// Mesmo padrão de tasks-store.ts — client de navegador direto, RLS
// (0002_rls.sql) isola por user_id.
export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: true,
  error: null,
  userId: null,

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
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({
      projects: sortProjectsByPriority((data ?? []) as Project[]),
      userId: user.id,
      loading: false,
      error: null,
    });
  },

  createProject: async ({ name, color, priority }) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();

    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: userId, name: name.trim(), color, priority })
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? "Falha ao criar projeto." });
      return;
    }
    set((state) => ({ projects: sortProjectsByPriority([data as Project, ...state.projects]) }));
  },

  updateProject: async (id, patch) => {
    const supabase = createClient();
    const current = get().projects.find((p) => p.id === id);
    if (!current) return;

    const fullPatch = { ...patch, updated_at: new Date().toISOString() };
    set((state) => ({
      projects: sortProjectsByPriority(state.projects.map((p) => (p.id === id ? { ...p, ...fullPatch } : p))),
    }));

    const { error } = await supabase.from("projects").update(fullPatch).eq("id", id);
    if (error) {
      set((state) => ({
        projects: sortProjectsByPriority(state.projects.map((p) => (p.id === id ? current : p))),
        error: error.message,
      }));
    }
  },

  deleteProject: async (id) => {
    const supabase = createClient();
    const snapshot = get().projects.find((p) => p.id === id);
    if (!snapshot) return;

    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));

    // Tarefas do projeto não são apagadas junto — o schema usa `on delete set
    // null` em tasks.project_id (0001_schema.sql), então elas voltam pra
    // "Inbox" automaticamente, igual ao comportamento do legado.
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      set((state) => ({ projects: [snapshot, ...state.projects], error: error.message }));
    }
  },
}));
