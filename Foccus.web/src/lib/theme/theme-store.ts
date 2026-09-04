import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

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

// Zustand simples (mesmo padrão de tasks-store.ts) — guarda o tema e
// sincroniza com localStorage (pra aplicar sem esperar rede) e com
// `profiles.theme` no Supabase (pra viajar entre dispositivos/sessões, igual
// à conta do usuário).
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  hydrated: false,

  init: () => {
    if (get().hydrated) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const theme: Theme = stored === "dark" ? "dark" : "light";
    applyTheme(theme);
    set({ theme, hydrated: true });

    // A preferência salva na conta vence a do localStorage deste navegador
    // específico (é o que permite abrir em outro dispositivo e já vir no
    // tema certo) — só troca se realmente vier diferente, pra não "piscar"
    // tema à toa quando já bate com o local.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          const remote = data?.theme;
          if ((remote === "light" || remote === "dark") && remote !== get().theme) {
            applyTheme(remote);
            window.localStorage.setItem(STORAGE_KEY, remote);
            set({ theme: remote });
          }
        });
    });
  },

  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) void supabase.from("profiles").update({ theme: next }).eq("id", user.id);
    });
  },
}));
