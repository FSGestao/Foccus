import { create } from "zustand";

// Só a query — os resultados são derivados ao vivo dos stores de tasks/
// projects/people (ver SearchOverlay), não guardados aqui.
type SearchState = {
  query: string;
  setQuery: (q: string) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  setQuery: (q) => set({ query: q }),
}));
