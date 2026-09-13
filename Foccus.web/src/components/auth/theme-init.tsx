"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/theme/theme-store";

// Login fica fora do AppShell (não passa por lá antes de autenticar), então
// precisa chamar o init do tema por conta própria — senão a página sempre
// renderiza no claro, mesmo pra quem já usa o app no escuro.
export function ThemeInit() {
  const init = useThemeStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return null;
}
