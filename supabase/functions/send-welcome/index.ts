import { createClient } from 'npm:@supabase/supabase-js'

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const SITE_URL   = Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'

Deno.serve(async (req) => {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== Deno.env.get('CRON_SECRET')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { user_id, email } = await req.json()

  if (!email || !user_id) {
    return new Response(JSON.stringify({ error: 'Missing user_id or email' }), { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Idempotency — skip if already sent
  const { data: user } = await supabase
    .from('users').select('welcome_sent_at').eq('id', user_id).single()

  if (user?.welcome_sent_at) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 })
  }

  const ok = await sendEmail(email, 'Bem-vindo ao ContentFlow!', welcomeHtml(SITE_URL))

  if (ok) {
    await supabase.from('users')
      .update({ welcome_sent_at: new Date().toISOString() })
      .eq('id', user_id)
    console.log('welcome email sent to', email)
    return new Response(JSON.stringify({ sent: true }), { status: 200 })
  }

  return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 })
})

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'ContentFlow <contato@flowcontent.com.br>', to: [to], subject, html }),
    })
    if (!res.ok) { console.error('resend error:', await res.text()); return false }
    return true
  } catch (e) { console.error('sendEmail error:', e); return false }
}

function base(preheader: string, title: string, body: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f1;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f0f4f1;">
    ${preheader}&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f1;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
                <img src="${siteUrl}/logo-email.svg" alt="ContentFlow" width="186" height="44" style="display:block;border:0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#1e4d35;padding:32px 40px 28px;border-radius:20px 20px 0 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:16px;"><tr>
                      <td style="width:8px;height:8px;background:rgba(255,255,255,0.25);border-radius:50%;"></td>
                      <td width="6"></td>
                      <td style="width:8px;height:8px;background:rgba(255,255,255,0.15);border-radius:50%;"></td>
                      <td width="6"></td>
                      <td style="width:8px;height:8px;background:rgba(255,255,255,0.10);border-radius:50%;"></td>
                    </tr></table>
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:36px 40px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#94a3b8;line-height:1.7;">
                © 2026 ContentFlow &nbsp;·&nbsp;
                <a href="${siteUrl}/contato" style="color:#94a3b8;text-decoration:underline;">Fale conosco</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function p(text: string): string {
  return `<p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#374151;">${text}</p>`
}

function btn(label: string, url: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;"><tr>
    <td style="border-radius:12px;background:#1e4d35;box-shadow:0 4px 14px rgba(30,77,53,0.35);">
      <a href="${url}" style="display:inline-block;padding:15px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${label}&nbsp;&nbsp;→</a>
    </td>
  </tr></table>`
}

function tip(text: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;"><tr>
    <td style="background:#f0f9f4;border-radius:10px;padding:14px 18px;">
      <p style="margin:0;font-size:14px;line-height:1.65;color:#1e4d35;">${text}</p>
    </td>
  </tr></table>`
}

function divider(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
    <tr><td style="height:1px;background:#f1f5f1;"></td></tr>
  </table>`
}

function welcomeHtml(siteUrl: string): string {
  const body = `
    ${p('Oi! Estamos muito felizes em ter você aqui. 👋')}
    ${p('O <strong style="color:#1a2e23;">ContentFlow</strong> cria posts, carrosséis e stories para o seu Instagram em segundos, com linguagem pensada para profissionais de saúde e validação ética automática (CFM, CFO, CFP, CFN).')}
    ${divider()}
    ${tip('💡 <strong>Dica:</strong> configure seu Perfil de Marca antes de gerar o primeiro conteúdo. O resultado fica muito mais personalizado.')}
    ${p('Quando estiver pronto, escolha um tema e gere seu primeiro post:')}
    ${btn('Gerar meu primeiro conteúdo', `${siteUrl}/app`)}
  `
  return base('Bem-vindo! Gere seu primeiro post em menos de 30 segundos.', 'Bem-vindo ao ContentFlow!', body, siteUrl)
}
