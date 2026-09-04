// Tint de coluna do Kanban "com cores" (Foccus.dc.html:1585-1598:
// hexToRgb + kanbanColTint) — degradê e borda calculados a partir de uma cor
// hex sólida (status/projeto/prioridade/prazo).

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const norm = hex.replace("#", "");
  const num = parseInt(norm, 16);
  if (norm.length !== 6 || Number.isNaN(num)) return { r: 148, g: 163, b: 184 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function kanbanColTint(hex: string): { colBg: string; colBorder: string } {
  const { r, g, b } = hexToRgb(hex);
  return {
    colBg: `linear-gradient(180deg, rgba(${r},${g},${b},0.16), rgba(${r},${g},${b},0.02)), var(--pb-glass)`,
    colBorder: `rgba(${r},${g},${b},0.28)`,
  };
}
