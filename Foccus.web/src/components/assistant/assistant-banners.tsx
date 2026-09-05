"use client";

import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { computeGargaloBreach, computeQuickWinCandidates } from "@/lib/assistant/compute";
import { GargaloBanner } from "./gargalo-banner";
import { QuickWinBanner } from "./quick-win-banner";

// Data local, não UTC — ver mesma correção em lib/assistant/compute.ts.
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Assistente proativo (Foccus.dc.html:154-160): o banner fica acima do
// conteúdo de QUALQUER view (não só a Minha Lista) — por isso é um
// componente à parte, incluído no topo de cada página, em vez de morar
// dentro de task-list-page.tsx como antes. Gargalo tem prioridade sobre
// Vitórias Rápidas — os dois nunca aparecem juntos.
export function AssistantBanners() {
  const tasks = useTasksStore((s) => s.tasks);
  const profile = useProfileStore();
  const today = todayISO();

  const { count: emProgressoCount, breach: gargaloBreach } = computeGargaloBreach(
    tasks,
    profile.asstGargaloAtivo,
    profile.asstGargaloLimite,
  );
  const showGargaloBanner = profile.loaded && gargaloBreach && profile.assistantBannerDismissedDate !== today;

  const quickWinCandidates = computeQuickWinCandidates(tasks);
  const showQuickWinBanner =
    profile.loaded &&
    !showGargaloBanner &&
    profile.asstQuickwinAtivo &&
    profile.quickWinBannerActive &&
    quickWinCandidates.length > 0 &&
    profile.quickWinDismissedDate !== today;

  if (showGargaloBanner) return <GargaloBanner emProgressoCount={emProgressoCount} />;
  if (showQuickWinBanner) return <QuickWinBanner candidates={quickWinCandidates} />;
  return null;
}
