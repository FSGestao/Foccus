import { AppShell } from "@/components/shell/app-shell";
import { ErrorBoundary } from "@/components/shell/error-boundary";

// Route group (app) — só engloba as telas "de dentro" do sistema (hoje só
// Minha Lista, em page.tsx aqui do lado). /login e /admin/* ficam fora deste
// grupo, sem o AppShell (mantêm o layout simples que já tinham).
export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AppShell>
  );
}
