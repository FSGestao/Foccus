import { createAdminClient } from "@/lib/supabase/admin";

// Lista os últimos erros de cliente capturados (ver error-reporter.tsx /
// error-boundary.tsx / api/log-error). Só existe pra admin — a tabela
// error_logs não tem policy pra `authenticated`, então lê via service role.
export default async function AdminErrorsPage() {
  const admin = createAdminClient();

  const { data: logs } = await admin
    .from("error_logs")
    .select("id, created_at, user_id, message, stack, url, user_agent")
    .order("created_at", { ascending: false })
    .limit(100);

  const userIds = Array.from(new Set((logs ?? []).map((l) => l.user_id).filter(Boolean))) as string[];
  const emailByUserId = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await admin.from("profiles").select("id, email").in("id", userIds);
    for (const p of profiles ?? []) emailByUserId.set(p.id, p.email);
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div>
        <h2 className="text-base font-medium">Erros recentes</h2>
        <p className="text-sm text-zinc-500">Últimos 100 erros de cliente capturados no sistema.</p>
      </div>

      <div className="flex flex-col gap-3">
        {(logs ?? []).map((log) => (
          <details key={log.id} className="border rounded-md p-3">
            <summary className="cursor-pointer text-sm flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-zinc-500">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
              <span className="font-medium">{log.message}</span>
              {log.user_id && (
                <span className="text-zinc-500">— {emailByUserId.get(log.user_id) ?? log.user_id}</span>
              )}
            </summary>
            <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
              {log.url && <div>URL: {log.url}</div>}
              {log.user_agent && <div>Navegador: {log.user_agent}</div>}
              {log.stack && (
                <pre className="mt-1 whitespace-pre-wrap break-all bg-zinc-50 p-2 rounded">{log.stack}</pre>
              )}
            </div>
          </details>
        ))}
        {(!logs || logs.length === 0) && (
          <p className="text-sm text-zinc-500 py-4">Nenhum erro registrado até agora — bom sinal.</p>
        )}
      </div>
    </div>
  );
}
