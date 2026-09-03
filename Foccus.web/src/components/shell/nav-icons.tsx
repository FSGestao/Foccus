// Ícones SVG inline portados de navIcon() em Foccus.dc.html:1840-1854 (mesmas
// formas, só reescritas de React.createElement pra JSX). Um por item de
// navegação da sidebar.

const svgProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type NavKey = "list" | "projects" | "people" | "waiting" | "kanban" | "dashboard" | "notes";

export function NavIcon({ name }: { name: NavKey }) {
  switch (name) {
    case "list":
      return (
        <svg {...svgProps}>
          <rect x={2} y={2.5} width={3} height={3} rx={0.8} />
          <line x1={7} y1={4} x2={14} y2={4} />
          <rect x={2} y={9.5} width={3} height={3} rx={0.8} />
          <line x1={7} y1={11} x2={14} y2={11} />
        </svg>
      );
    case "projects":
      return (
        <svg {...svgProps}>
          <rect x={1.5} y={1.5} width={5.5} height={5.5} rx={1} />
          <rect x={9} y={1.5} width={5.5} height={5.5} rx={1} />
          <rect x={1.5} y={9} width={5.5} height={5.5} rx={1} />
          <rect x={9} y={9} width={5.5} height={5.5} rx={1} />
        </svg>
      );
    case "people":
      return (
        <svg {...svgProps}>
          <circle cx={8} cy={5} r={2.8} />
          <path d="M2.5 14c0-2.8 2.5-4.4 5.5-4.4S13.5 11.2 13.5 14" />
        </svg>
      );
    case "waiting":
      return (
        <svg {...svgProps}>
          <circle cx={8} cy={8} r={6} />
          <line x1={8} y1={8} x2={8} y2={4.8} />
          <line x1={8} y1={8} x2={10.5} y2={9.5} />
        </svg>
      );
    case "kanban":
      return (
        <svg {...svgProps}>
          <rect x={2} y={3} width={4.5} height={10} rx={1} />
          <rect x={9.5} y={3} width={4.5} height={7} rx={1} />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...svgProps}>
          <rect x={1.5} y={1.5} width={5} height={8} rx={1} />
          <rect x={9.5} y={1.5} width={5} height={5} rx={1} />
          <rect x={9.5} y={9} width={5} height={5.5} rx={1} />
          <rect x={1.5} y={12} width={5} height={2.5} rx={1} />
        </svg>
      );
    case "notes":
      return (
        <svg {...svgProps}>
          <path d="M3 1.5h7l3 3v10h-10z" />
          <path d="M10 1.5v3h3" />
          <line x1={5} y1={8} x2={11} y2={8} />
          <line x1={5} y1={11} x2={11} y2={11} />
        </svg>
      );
  }
}
