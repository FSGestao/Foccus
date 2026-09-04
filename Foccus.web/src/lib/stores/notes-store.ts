import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { NewNoteInput, ProjectNote } from "@/lib/notes/types";

type NotesState = {
  notes: ProjectNote[];
  loading: boolean;
  error: string | null;
  userId: string | null;

  init: () => Promise<void>;
  createNote: (input: NewNoteInput) => Promise<void>;
  updateNote: (id: string, patch: Partial<ProjectNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

// Mesmo padrão dos outros stores (tasks/projects/people).
export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
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
      .from("project_notes")
      .select("*")
      .order("recorded_at", { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ notes: (data ?? []) as ProjectNote[], userId: user.id, loading: false, error: null });
  },

  createNote: async ({ title, text, project_id, reference_date, recorded_at }) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();

    const { data, error } = await supabase
      .from("project_notes")
      .insert({
        user_id: userId,
        title: title?.trim() || null,
        text: text.trim(),
        project_id,
        reference_date: reference_date || null,
        recorded_at: recorded_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? "Falha ao criar anotação." });
      return;
    }
    set((state) => ({ notes: [data as ProjectNote, ...state.notes] }));
  },

  updateNote: async (id, patch) => {
    const supabase = createClient();
    const current = get().notes.find((n) => n.id === id);
    if (!current) return;

    set((state) => ({ notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));

    const { error } = await supabase.from("project_notes").update(patch).eq("id", id);
    if (error) {
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? current : n)),
        error: error.message,
      }));
    }
  },

  deleteNote: async (id) => {
    const supabase = createClient();
    const snapshot = get().notes.find((n) => n.id === id);
    if (!snapshot) return;

    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));

    const { error } = await supabase.from("project_notes").delete().eq("id", id);
    if (error) {
      set((state) => ({ notes: [snapshot, ...state.notes], error: error.message }));
    }
  },
}));
