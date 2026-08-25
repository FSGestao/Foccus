import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // O repo tem dois lockfiles independentes (Foccus.dc.html usa Playwright na raiz;
  // este projeto Next.js tem o seu próprio) — fixa a raiz aqui pra não deixar o
  // Turbopack adivinhar (e escolher errado) qual delas é a raiz do workspace.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
