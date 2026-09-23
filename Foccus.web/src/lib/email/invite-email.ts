import "server-only";

// E-mail de convite (pedido do usuário, 2026-09-23) — chamado por
// inviteUserAction (src/lib/actions/admin-users.ts) depois que o e-mail entra
// na allowlist. Usa a API REST do Resend direto via fetch (sem SDK — evita
// dependência nova só pra uma chamada). Sem domínio próprio verificado no
// Resend, o remetente é onboarding@resend.dev (funciona pra qualquer
// destinatário no plano grátis, só não permite customizar o "From").
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM = "Foccus <onboarding@resend.dev>";
const LOGIN_URL = "https://foccus-web.vercel.app/login";

// Mesma paleta de --pb-accent/--pb-bg/--pb-bg-gradient do app (globals.css),
// em hex/rgba literal — e-mail não lê custom properties. `background-color`
// sempre vem antes do `background-image` gradiente (fallback pra clientes
// como Outlook desktop, que ignoram gradiente mas respeitam a cor sólida).
const ACCENT = "#0a7a85";
const TEXT = "#0b2530";
const TEXT_MUTED = "#5b7480";
const BG_SOLID = "#eef6f7";
const BG_GRADIENT = "linear-gradient(135deg, rgba(14,154,167,0.16) 0%, #eef6f7 45%, rgba(255,166,0,0.12) 100%)";

export type SendInviteEmailResult = { sent: true } | { sent: false; error: string };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Logo recriada em HTML/CSS (mesmo desenho de src/app/icon.svg: quadrado
// teal arredondado com "F" branco) — em vez de <img>, pra sempre aparecer
// mesmo em clientes que bloqueiam imagem externa por padrão (Gmail/Outlook).
const LOGO_BADGE = `
  <table role="presentation" cellpadding="0" cellspacing="0" style="display: inline-table; vertical-align: middle;">
    <tr>
      <td width="32" height="32" style="width: 32px; height: 32px; background: #ffffff; border-radius: 8px; text-align: center; vertical-align: middle; font-family: Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 800; color: ${ACCENT};">
        F
      </td>
    </tr>
  </table>
`;

const STEPS = [
  "Clique no botão abaixo e entre com sua conta Google, usando este mesmo e-mail.",
  "Pronto — sua conta é criada automaticamente no primeiro acesso, sem senha nem cadastro.",
  "Organize suas tarefas, projetos e prazos, tudo num só lugar.",
];

function renderSteps(): string {
  return STEPS.map(
    (step, i) => `
      <tr>
        <td width="26" valign="top" style="padding: 0 10px 14px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td width="22" height="22" style="width: 22px; height: 22px; background: ${ACCENT}; border-radius: 50%; text-align: center; vertical-align: middle; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; color: #ffffff;">
                ${i + 1}
              </td>
            </tr>
          </table>
        </td>
        <td valign="top" style="padding: 0 0 14px; font-size: 14px; line-height: 1.6; color: ${TEXT};">
          ${escapeHtml(step)}
        </td>
      </tr>
    `,
  ).join("");
}

export async function sendInviteEmail(to: string, name: string): Promise<SendInviteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY não configurada." };
  }

  const safeTo = escapeHtml(to);
  const greeting = name ? `Olá, ${escapeHtml(name)}!` : "Olá!";

  const html = `
    <div style="background-color: ${BG_SOLID}; background-image: ${BG_GRADIENT}; padding: 32px 16px; font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid rgba(14,100,110,0.12); box-shadow: 0 8px 24px rgba(11,37,48,0.08);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${ACCENT};">
          <tr>
            <td style="padding: 18px 28px;">
              ${LOGO_BADGE}
              <span style="display: inline-block; vertical-align: middle; margin-left: 10px; color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 0.02em;">Foccus</span>
            </td>
          </tr>
        </table>

        <div style="padding: 28px;">
          <h1 style="font-size: 18px; margin: 0 0 12px; color: ${TEXT};">${greeting}</h1>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px; color: ${TEXT};">
            O <strong>Foccus</strong> é o sistema de gestão de tarefas, projetos e prazos da sua equipe — tudo num só
            lugar, sem planilha solta ou anotação perdida. Você foi convidado a acessar com o e-mail
            <strong>${safeTo}</strong>.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 0 24px;">
            ${renderSteps()}
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
            <tr>
              <td style="background: ${ACCENT}; border-radius: 8px;">
                <a href="${LOGIN_URL}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none;">
                  Entrar no Foccus
                </a>
              </td>
            </tr>
          </table>

          <p style="font-size: 12px; line-height: 1.6; margin: 0; color: ${TEXT_MUTED}; border-top: 1px solid rgba(14,100,110,0.12); padding-top: 16px;">
            Se você não esperava este convite, pode ignorar este e-mail — nenhuma conta é criada até o primeiro login.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: "Você foi convidado para o Foccus",
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { sent: false, error: `Resend respondeu ${res.status}: ${body}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Falha ao enviar e-mail." };
  }
}
