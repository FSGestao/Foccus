import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { nextFechamentoStreak, shouldTriggerFechamento, todayISO } from "@/lib/assistant/compute";

// Espelha as colunas `asst_*` e o histórico do Assistente em `public.profiles`
// (0001_schema.sql) — diferente do tema (ainda só localStorage, ver
// theme-store.ts), essas configurações e contadores precisam sobreviver entre
// sessões/dispositivos, então moram no banco desde o início.
type ProfileState = {
  loaded: boolean;
  userId: string | null;
  // Nome informado pelo admin no convite (profiles.user_name) — a fonte de
  // verdade pro nome de exibição, distinta do nome da conta Google usada só
  // como reserva quando isso ainda não foi preenchido.
  userName: string;
  // 'admin' | 'user' (profiles.role) — controla só a visibilidade do item
  // "Administração" no menu do avatar; o acesso de verdade já é revalidado
  // no servidor (proxy.ts + assertCallerIsAdmin em cada Server Action), isso
  // aqui não é a camada de segurança.
  role: "admin" | "user";

  asstGargaloAtivo: boolean;
  asstGargaloLimite: number;
  asstQuickwinAtivo: boolean;
  asstFechamentoAtivo: boolean;
  asstFechamentoHora: string;
  asstLimpezaAtivo: boolean;
  asstLimpezaDias: number;

  assistantBannerDismissedDate: string | null;
  gargaloComboCount: number;
  gargaloComboDate: string | null;
  quickWinDismissedDate: string | null;
  lastActivityAt: string | null;
  fechamentoShownDate: string | null;
  fechamentoStreak: number;
  fechamentoLastDate: string | null;

  // Só em memória (nunca persistido) — igual ao legado, é um flag calculado
  // a cada checagem periódica (ver checkQuickWinTrigger no AppShell), não um
  // dado que precise sobreviver a um refresh.
  quickWinBannerActive: boolean;
  setQuickWinBannerActive: (v: boolean) => void;

  init: () => Promise<void>;
  updateSettings: (patch: Partial<{
    asst_gargalo_ativo: boolean;
    asst_gargalo_limite: number;
    asst_quickwin_ativo: boolean;
    asst_fechamento_ativo: boolean;
    asst_fechamento_hora: string;
    asst_limpeza_ativo: boolean;
    asst_limpeza_dias: number;
  }>) => Promise<void>;
  dismissGargaloBanner: () => Promise<void>;
  dismissQuickWinBanner: () => Promise<void>;
  registerActivity: () => void;
  recordGargaloCombo: () => Promise<boolean>;
  checkFechamentoTrigger: (anyModalOpen: boolean) => Promise<boolean>;
};

let lastActivityPersistAt = 0;

export const useProfileStore = create<ProfileState>((set, get) => ({
  loaded: false,
  userId: null,
  userName: "",
  role: "user",

  asstGargaloAtivo: true,
  asstGargaloLimite: 10,
  asstQuickwinAtivo: true,
  asstFechamentoAtivo: true,
  asstFechamentoHora: "17:30",
  asstLimpezaAtivo: true,
  asstLimpezaDias: 30,

  assistantBannerDismissedDate: null,
  gargaloComboCount: 0,
  gargaloComboDate: null,
  quickWinDismissedDate: null,
  lastActivityAt: null,
  fechamentoShownDate: null,
  fechamentoStreak: 0,
  fechamentoLastDate: null,

  quickWinBannerActive: false,
  setQuickWinBannerActive: (v) => set((s) => (s.quickWinBannerActive === v ? s : { quickWinBannerActive: v })),

  init: async () => {
    if (get().loaded) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error || !data) {
      set({ loaded: true, userId: user.id });
      return;
    }
    set({
      loaded: true,
      userId: user.id,
      userName: data.user_name ?? "",
      role: data.role === "admin" ? "admin" : "user",
      asstGargaloAtivo: data.asst_gargalo_ativo,
      asstGargaloLimite: data.asst_gargalo_limite,
      asstQuickwinAtivo: data.asst_quickwin_ativo,
      asstFechamentoAtivo: data.asst_fechamento_ativo,
      asstFechamentoHora: data.asst_fechamento_hora,
      asstLimpezaAtivo: data.asst_limpeza_ativo,
      asstLimpezaDias: data.asst_limpeza_dias,
      assistantBannerDismissedDate: data.assistant_banner_dismissed_date,
      gargaloComboCount: data.gargalo_combo_count,
      gargaloComboDate: data.gargalo_combo_date,
      quickWinDismissedDate: data.quick_win_dismissed_date,
      lastActivityAt: data.last_activity_at,
      fechamentoShownDate: data.fechamento_shown_date,
      fechamentoStreak: data.fechamento_streak,
      fechamentoLastDate: data.fechamento_last_date,
    });
  },

  updateSettings: async (patch) => {
    const { userId } = get();
    if (!userId) return;
    const localPatch: Partial<ProfileState> = {};
    if ("asst_gargalo_ativo" in patch) localPatch.asstGargaloAtivo = patch.asst_gargalo_ativo;
    if ("asst_gargalo_limite" in patch) localPatch.asstGargaloLimite = patch.asst_gargalo_limite;
    if ("asst_quickwin_ativo" in patch) localPatch.asstQuickwinAtivo = patch.asst_quickwin_ativo;
    if ("asst_fechamento_ativo" in patch) localPatch.asstFechamentoAtivo = patch.asst_fechamento_ativo;
    if ("asst_fechamento_hora" in patch) localPatch.asstFechamentoHora = patch.asst_fechamento_hora;
    if ("asst_limpeza_ativo" in patch) localPatch.asstLimpezaAtivo = patch.asst_limpeza_ativo;
    if ("asst_limpeza_dias" in patch) localPatch.asstLimpezaDias = patch.asst_limpeza_dias;
    set(localPatch);

    const supabase = createClient();
    await supabase.from("profiles").update(patch).eq("id", userId);
  },

  dismissGargaloBanner: async () => {
    const { userId } = get();
    if (!userId) return;
    const today = todayISO();
    set({ assistantBannerDismissedDate: today });
    const supabase = createClient();
    await supabase.from("profiles").update({ assistant_banner_dismissed_date: today }).eq("id", userId);
  },

  dismissQuickWinBanner: async () => {
    const { userId } = get();
    if (!userId) return;
    const today = todayISO();
    set({ quickWinDismissedDate: today });
    const supabase = createClient();
    await supabase.from("profiles").update({ quick_win_dismissed_date: today }).eq("id", userId);
  },

  // Chamado a cada edição de tarefa (ver tasks-store.ts) — marca o board como
  // "vivo" pro gatilho de Vitórias Rápidas. Persiste no banco no máximo uma
  // vez por minuto (não precisa de precisão maior que isso e evita um write
  // a cada tecla/troca de status).
  registerActivity: () => {
    const { userId } = get();
    if (!userId) return;
    const nowIso = new Date().toISOString();
    set({ lastActivityAt: nowIso });
    const now = Date.now();
    if (now - lastActivityPersistAt < 60_000) return;
    lastActivityPersistAt = now;
    const supabase = createClient();
    void supabase.from("profiles").update({ last_activity_at: nowIso }).eq("id", userId);
  },

  // "Combo de Fluxo": no máximo uma vez por dia, pra não banalizar a
  // recompensa. Retorna true quando um combo novo foi registrado (pra quem
  // chamou poder disparar o toast de comemoração).
  recordGargaloCombo: async () => {
    const { userId, gargaloComboDate, gargaloComboCount } = get();
    if (!userId) return false;
    const today = todayISO();
    if (gargaloComboDate === today) return false;
    const nextCount = (gargaloComboCount || 0) + 1;
    set({ gargaloComboCount: nextCount, gargaloComboDate: today });
    const supabase = createClient();
    await supabase.from("profiles").update({ gargalo_combo_count: nextCount, gargalo_combo_date: today }).eq("id", userId);
    return true;
  },

  checkFechamentoTrigger: async (anyModalOpen) => {
    const { userId, asstFechamentoAtivo, fechamentoShownDate, asstFechamentoHora, fechamentoLastDate, fechamentoStreak } = get();
    if (!userId) return false;
    if (!shouldTriggerFechamento({ ativo: asstFechamentoAtivo, fechamentoShownDate, fechamentoHora: asstFechamentoHora, anyModalOpen })) {
      return false;
    }
    const today = todayISO();
    const streak = nextFechamentoStreak(fechamentoLastDate, fechamentoStreak);
    set({ fechamentoShownDate: today, fechamentoStreak: streak, fechamentoLastDate: today });
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ fechamento_shown_date: today, fechamento_streak: streak, fechamento_last_date: today })
      .eq("id", userId);
    return true;
  },
}));
