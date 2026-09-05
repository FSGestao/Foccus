import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { NewPersonInput, Person } from "@/lib/people/types";

type PeopleState = {
  people: Person[];
  loading: boolean;
  error: string | null;
  userId: string | null;

  init: () => Promise<void>;
  createPerson: (input: NewPersonInput) => Promise<Person | null>;
  updatePerson: (id: string, patch: Partial<Person>) => Promise<void>;
  togglePersonStatus: (id: string) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
};

// Mesmo padrão de tasks-store.ts / projects-store.ts.
export const usePeopleStore = create<PeopleState>((set, get) => ({
  people: [],
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
      .from("people")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ people: (data ?? []) as Person[], userId: user.id, loading: false, error: null });
  },

  createPerson: async ({ name, role }) => {
    const { userId } = get();
    if (!userId) return null;
    const supabase = createClient();

    const { data, error } = await supabase
      .from("people")
      .insert({ user_id: userId, name: name.trim(), role: role?.trim() || null })
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? "Falha ao cadastrar pessoa." });
      return null;
    }
    set((state) => ({ people: [data as Person, ...state.people] }));
    return data as Person;
  },

  updatePerson: async (id, patch) => {
    const supabase = createClient();
    const current = get().people.find((p) => p.id === id);
    if (!current) return;

    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

    const { error } = await supabase.from("people").update(patch).eq("id", id);
    if (error) {
      set((state) => ({
        people: state.people.map((p) => (p.id === id ? current : p)),
        error: error.message,
      }));
    }
  },

  togglePersonStatus: async (id) => {
    const person = get().people.find((p) => p.id === id);
    if (!person) return;
    await get().updatePerson(id, { status: person.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
  },

  deletePerson: async (id) => {
    const supabase = createClient();
    const snapshot = get().people.find((p) => p.id === id);
    if (!snapshot) return;

    set((state) => ({ people: state.people.filter((p) => p.id !== id) }));

    // tasks.waiting_for usa `on delete set null` (0001_schema.sql) — tarefas
    // que apontavam pra essa pessoa ficam sem responsável, não quebram.
    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) {
      set((state) => ({ people: [snapshot, ...state.people], error: error.message }));
    }
  },
}));
