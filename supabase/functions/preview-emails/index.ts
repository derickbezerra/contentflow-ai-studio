const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const SITE_URL   = Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'

Deno.serve(async (req) => {
  // Temporary preview function — no auth required (delete after testing)

  const { email } = await req.json().catch(() => ({}))
  if (!email) return new Response(JSON.stringify({ error: 'email required' }), { status: 400 })

  const EMAILS = [
    { subject: '[PREVIEW] Bem-vindo ao ContentFlow!',               html: welcomeHtml(SITE_URL) },
    { subject: '[PREVIEW] Seu período de teste termina em 2 dias',  html: trialD2Html('08 de abril', SITE_URL) },
    { subject: '[PREVIEW] Você ainda não gerou nenhum conteúdo',    html: d3NoGenHtml(SITE_URL) },
    { subject: '[PREVIEW] Ainda dá tempo de continuar no ContentFlow', html: d7NoConvHtml(SITE_URL) },
    { subject: '[PREVIEW] Seu período de teste encerrou',           html: trialExpiredHtml(SITE_URL) },
  ]

  const results = []
  for (const e of EMAILS) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'ContentFlow <contato@flowcontent.com.br>', to: [email], subject: e.subject, html: e.html }),
    })
    results.push({ subject: e.subject, ok: res.ok, status: res.status })
    await new Promise(r => setTimeout(r, 300))
  }

  return new Response(JSON.stringify({ sent: results }), { headers: { 'Content-Type': 'application/json' } })
})

// ── Shared helpers ────────────────────────────────────────────────────────────

function base(preheader: string, title: string, body: string, siteUrl: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- preheader (hidden) -->
  <div style="display:none;font-size:1px;color:#f1f5f2;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f2;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

        <!-- Logo bar -->
        <tr>
          <td style="padding:0 0 20px 0;text-align:center;">
            <a href="${siteUrl}" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:28px;height:28px;background:#2d5c42;border-radius:6px;"></span>
              <span style="font-size:18px;font-weight:700;color:#1a2e23;letter-spacing:-0.3px;">Content<span style="color:#2d5c42;">Flow</span></span>
            </a>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

            <!-- Header stripe -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:linear-gradient(135deg,#2d5c42 0%,#3d6b52 100%);padding:28px 36px;">
                  <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</p>
                </td>
              </tr>
            </table>

            <!-- Body -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding:32px 36px 28px;">
                  ${body}
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 8px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              ContentFlow &bull; <a href="${siteUrl}/contato" style="color:#94a3b8;text-decoration:underline;">Fale conosco</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, url: string) {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;">
    <tr>
      <td style="background:#2d5c42;border-radius:10px;">
        <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">${label} →</a>
      </td>
    </tr>
  </table>`
}

function planTable() {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0 4px;border-collapse:separate;border-spacing:0 8px;">
    <tr>
      <td style="background:#f8faf9;border-radius:10px;padding:14px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="font-size:14px;font-weight:600;color:#1a2e23;">Starter</td>
            <td align="right" style="font-size:14px;color:#475569;">10 gerações/mês &bull; <strong style="color:#1a2e23;">R$47</strong></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#eef6f1;border-radius:10px;padding:14px 16px;border:1.5px solid #2d5c42;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="font-size:14px;font-weight:600;color:#2d5c42;">Growth <span style="font-size:11px;font-weight:500;background:#2d5c42;color:#fff;padding:2px 7px;border-radius:20px;margin-left:6px;">mais popular</span></td>
            <td align="right" style="font-size:14px;color:#475569;">30 gerações/mês &bull; <strong style="color:#1a2e23;">R$97</strong></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#f8faf9;border-radius:10px;padding:14px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="font-size:14px;font-weight:600;color:#1a2e23;">Pro</td>
            <td align="right" style="font-size:14px;color:#475569;">50 gerações/mês &bull; <strong style="color:#1a2e23;">R$127</strong></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">${text}</p>`
}

// ── Email templates ───────────────────────────────────────────────────────────

function welcomeHtml(siteUrl: string) {
  const body = `
    ${p('Oi! Estamos felizes em ter você aqui.')}
    ${p('O ContentFlow cria posts, carrosséis e stories para o seu Instagram em segundos — com linguagem pensada para profissionais de saúde e validação ética automática.')}
    <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#334155;">Para começar, escolha um tema e gere seu primeiro conteúdo:</p>
    ${btn('Gerar meu primeiro conteúdo', `${siteUrl}/app`)}
  `
  return base(
    'Bem-vindo! Gere seu primeiro post agora.',
    'Bem-vindo ao ContentFlow!',
    body,
    siteUrl
  )
}

function trialD2Html(endsAt: string, siteUrl: string) {
  const body = `
    ${p(`Seu acesso gratuito ao ContentFlow encerra em <strong>${endsAt}</strong>.`)}
    ${p('Para continuar gerando conteúdo sem interrupção, escolha um plano:')}
    ${planTable()}
    ${btn('Ver planos e assinar', `${siteUrl}/app`)}
  `
  return base(
    `Seu teste encerra em ${endsAt}. Escolha um plano para continuar.`,
    'Seu período de teste termina em 2 dias',
    body,
    siteUrl
  )
}

function d3NoGenHtml(siteUrl: string) {
  const body = `
    ${p('Você criou sua conta há 3 dias, mas ainda não gerou nenhum post. Tudo bem!')}
    ${p('Veja o que o ContentFlow cria por você em menos de 30 segundos:')}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:4px 0 20px;">
      <tr>
        <td style="background:#f8faf9;border-left:3px solid #2d5c42;border-radius:0 10px 10px 0;padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#2d5c42;text-transform:uppercase;letter-spacing:0.5px;">Exemplo — Post para nutricionista</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;"><strong>Você sabia que 70% das pessoas desidratam sem perceber?</strong> O corpo confunde sede com fome. Resultado: você come mais, fica cansado e sem foco. O simples hábito de beber 2L de água por dia muda isso.</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#334155;">É só escolher o tema e o tipo de conteúdo. Em 30 segundos, o post está pronto.</p>
    ${btn('Gerar meu primeiro conteúdo agora', `${siteUrl}/app`)}
  `
  return base(
    'Ainda não gerou seu primeiro post? Veja como é fácil.',
    'Você ainda não gerou nenhum conteúdo',
    body,
    siteUrl
  )
}

function d7NoConvHtml(siteUrl: string) {
  const body = `
    ${p('Você está há 7 dias no ContentFlow e seu período de teste ainda está ativo.')}
    ${p('Profissionais que usam o ContentFlow consistentemente publicam em média <strong>3x mais conteúdo</strong> — sem gastar horas escrevendo.')}
    ${p('Para não perder o acesso quando o trial encerrar, escolha um plano:')}
    ${planTable()}
    ${btn('Escolher meu plano', `${siteUrl}/app`)}
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">Tem alguma dúvida antes de assinar? Responda este e-mail.</p>
  `
  return base(
    'Seu trial ainda está ativo. Escolha um plano antes de perder o acesso.',
    'Ainda dá tempo de continuar no ContentFlow',
    body,
    siteUrl
  )
}

function trialExpiredHtml(siteUrl: string) {
  const body = `
    ${p('Seu acesso gratuito chegou ao fim. Esperamos que você tenha gostado do ContentFlow!')}
    ${p('Para continuar criando conteúdo de qualidade para o seu Instagram, escolha um plano:')}
    ${planTable()}
    ${btn('Assinar agora', `${siteUrl}/app`)}
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">Dúvidas? Responda este e-mail ou acesse <a href="${siteUrl}/contato" style="color:#2d5c42;text-decoration:none;font-weight:600;">flowcontent.com.br/contato</a>.</p>
  `
  return base(
    'Seu trial encerrou. Assine para continuar gerando conteúdo.',
    'Seu período de teste encerrou',
    body,
    siteUrl
  )
}
