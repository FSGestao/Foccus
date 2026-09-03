import { create } from "zustand";

type Theme = "light" | "dark";

const STORAGE_KEY = "foccus_web_theme";

type ThemeState = {
  theme: Theme;
  hydrated: boolean;
  init: () => void;
  toggleTheme: () => void;
};

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// Zustand simples (mesmo padrão de tasks-store.ts) — só guarda o tema e
// sincroniza com localStorage. Sincronizar com a coluna `profiles.theme` (já
// existe no schema, ver 0001_schema.sql) fica pra uma fatia futura; por agora é
// só preferência local do navegador, igual ao `foccus_theme` do legado.
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  hydrated: false,

  init: () => {
    if (get().hydrated) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const theme: Theme = stored === "dark" ? "dark" : "light";
    applyTheme(theme);
    set({ theme, hydrated: true });
  },

  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next });
  },
}));
