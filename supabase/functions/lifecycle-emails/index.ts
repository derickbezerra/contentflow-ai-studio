import { createClient } from 'npm:@supabase/supabase-js'

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'bezerra@belvy.com.br'
const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'

Deno.serve(async (req) => {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== Deno.env.get('CRON_SECRET')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const results = { trial_d2: 0, trial_expired: 0, d3_no_gen: 0, d7_no_conv: 0, errors: 0 }

  // Welcome email is now handled by DB trigger → send-welcome function

  // ── 1. Trial D-2 ─────────────────────────────────────────────────────────
  const d2Start = new Date(Date.now() + (2 * 24 - 1) * 60 * 60 * 1000).toISOString()
  const d2End   = new Date(Date.now() + (2 * 24 + 1) * 60 * 60 * 1000).toISOString()

  const { data: d2Users } = await supabase
    .from('users').select('id, email, trial_ends_at')
    .eq('plan', 'free').is('trial_d2_sent_at', null)
    .gte('trial_ends_at', d2Start).lte('trial_ends_at', d2End)

  for (const user of d2Users ?? []) {
    const endsAt = new Date(user.trial_ends_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    const ok = await sendEmail(user.email, 'Seu período de teste termina em 2 dias', trialD2Html(endsAt, SITE_URL))
    if (ok) { await supabase.from('users').update({ trial_d2_sent_at: new Date().toISOString() }).eq('id', user.id); results.trial_d2++ }
    else results.errors++
  }

  // ── 3. Trial expirado ────────────────────────────────────────────────────
  const expiredSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: expiredUsers } = await supabase
    .from('users').select('id, email')
    .eq('plan', 'free').is('trial_expired_sent_at', null)
    .not('trial_ends_at', 'is', null)
    .lt('trial_ends_at', new Date().toISOString())
    .gte('trial_ends_at', expiredSince)

  for (const user of expiredUsers ?? []) {
    const ok = await sendEmail(user.email, 'Seu período de teste encerrou', trialExpiredHtml(SITE_URL))
    if (ok) { await supabase.from('users').update({ trial_expired_sent_at: new Date().toISOString() }).eq('id', user.id); results.trial_expired++ }
    else results.errors++
  }

  // ── 4. D+3 sem geração ───────────────────────────────────────────────────
  const { data: d3Users } = await supabase
    .from('users').select('id, email')
    .eq('plan', 'free').eq('generation_count', 0)
    .is('d3_no_generation_sent_at', null).not('trial_ends_at', 'is', null)
    .gt('trial_ends_at', new Date().toISOString())
    .lte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())

  for (const user of d3Users ?? []) {
    const ok = await sendEmail(user.email, 'Você ainda não gerou nenhum conteúdo', d3NoGenHtml(SITE_URL))
    if (ok) { await supabase.from('users').update({ d3_no_generation_sent_at: new Date().toISOString() }).eq('id', user.id); results.d3_no_gen++ }
    else results.errors++
  }

  // ── 5. D+7 sem conversão ─────────────────────────────────────────────────
  const { data: d7Users } = await supabase
    .from('users').select('id, email')
    .eq('plan', 'free').is('d7_no_conversion_sent_at', null)
    .not('trial_ends_at', 'is', null)
    .gt('trial_ends_at', new Date().toISOString())
    .lte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  for (const user of d7Users ?? []) {
    const ok = await sendEmail(user.email, 'Ainda dá tempo de continuar no ContentFlow', d7NoConvHtml(SITE_URL))
    if (ok) { await supabase.from('users').update({ d7_no_conversion_sent_at: new Date().toISOString() }).eq('id', user.id); results.d7_no_conv++ }
    else results.errors++
  }

  console.log('lifecycle-emails:', results)
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } })
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

// ─────────────────────────────────────────────────────────────────────────────
// BASE LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

function base(preheader: string, title: string, body: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f4f1;-webkit-font-smoothing:antialiased;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f0f4f1;">
    ${preheader}&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f1;">
    <tr>
      <td align="center" style="padding:40px 16px 48px;">

        <!-- Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;">

          <!-- ── LOGO ── -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
                <img src="${siteUrl}/logo-email.svg" alt="ContentFlow" width="186" height="44" style="display:block;border:0;" />
              </a>
            </td>
          </tr>

          <!-- ── CARD ── -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">

              <!-- Card Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#1e4d35;padding:32px 40px 28px;border-radius:20px 20px 0 0;">
                    <!-- Decorative dots -->
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                      <tr>
                        <td style="width:8px;height:8px;background:rgba(255,255,255,0.25);border-radius:50%;"></td>
                        <td width="6"></td>
                        <td style="width:8px;height:8px;background:rgba(255,255,255,0.15);border-radius:50%;"></td>
                        <td width="6"></td>
                        <td style="width:8px;height:8px;background:rgba(255,255,255,0.10);border-radius:50%;"></td>
                      </tr>
                    </table>
                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</p>
                  </td>
                </tr>
              </table>

              <!-- Card Body -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:36px 40px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                    ${body}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ── -->
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

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function p(text: string): string {
  return `<p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#374151;">${text}</p>`
}

function btn(label: string, url: string): string {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;">
    <tr>
      <td style="border-radius:12px;background:#1e4d35;box-shadow:0 4px 14px rgba(30,77,53,0.35);">
        <a href="${url}" style="display:inline-block;padding:15px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">${label}&nbsp;&nbsp;→</a>
      </td>
    </tr>
  </table>`
}

function divider(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
    <tr><td style="height:1px;background:#f1f5f1;"></td></tr>
  </table>`
}

function planCards(): string {
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 6px;border-spacing:0;">

    <!-- Starter -->
    <tr>
      <td style="padding-bottom:8px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="background:#f8faf9;border-radius:12px;border:1.5px solid #e8efe9;padding:0;">
          <tr>
            <td style="padding:14px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:14px;font-weight:600;color:#1a2e23;">🌱&nbsp; Starter</span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:13px;color:#6b7280;">10 gerações/mês</span>
                    &nbsp;
                    <span style="font-size:14px;font-weight:700;color:#1a2e23;">R$47</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Growth (destaque) -->
    <tr>
      <td style="padding-bottom:8px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="background:#1e4d35;border-radius:12px;padding:0;">
          <tr>
            <td style="padding:16px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:14px;font-weight:700;color:#ffffff;">🚀&nbsp; Growth</span>
                    &nbsp;&nbsp;
                    <span style="font-size:10px;font-weight:600;background:rgba(255,255,255,0.2);color:#ffffff;padding:3px 8px;border-radius:20px;letter-spacing:0.3px;">MAIS POPULAR</span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:13px;color:rgba(255,255,255,0.7);">30 gerações/mês</span>
                    &nbsp;
                    <span style="font-size:14px;font-weight:700;color:#ffffff;">R$97</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Pro -->
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="background:#f8faf9;border-radius:12px;border:1.5px solid #e8efe9;padding:0;">
          <tr>
            <td style="padding:14px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:14px;font-weight:600;color:#1a2e23;">⚡&nbsp; Pro</span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:13px;color:#6b7280;">50 gerações/mês</span>
                    &nbsp;
                    <span style="font-size:14px;font-weight:700;color:#1a2e23;">R$127</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>`
}

function examplePost(): string {
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
    <tr>
      <td style="background:#f8faf9;border-radius:12px;border-left:4px solid #1e4d35;padding:20px 22px;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#1e4d35;text-transform:uppercase;letter-spacing:0.8px;">Exemplo · Post para nutricionista</p>
        <p style="margin:0;font-size:14px;line-height:1.75;color:#374151;"><strong style="color:#1a2e23;">Você sabia que 70% das pessoas desidratam sem perceber?</strong> O corpo confunde sede com fome. Resultado: você come mais, fica cansado e sem foco. O simples hábito de beber 2L de água por dia muda tudo isso.</p>
      </td>
    </tr>
  </table>`
}

function tip(text: string): string {
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
    <tr>
      <td style="background:#f0f9f4;border-radius:10px;padding:14px 18px;">
        <p style="margin:0;font-size:14px;line-height:1.65;color:#1e4d35;">${text}</p>
      </td>
    </tr>
  </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

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

function trialD2Html(endsAt: string, siteUrl: string): string {
  const body = `
    ${p(`Seu acesso gratuito ao ContentFlow encerra em <strong style="color:#1a2e23;">${endsAt}</strong>.`)}
    ${p('Para continuar gerando conteúdo sem interrupção, escolha um plano abaixo:')}
    ${planCards()}
    ${btn('Ver planos e assinar', `${siteUrl}/app`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">Dúvidas sobre os planos? Responda este e-mail.</p>
  `
  return base(`Seu teste encerra em ${endsAt}. Escolha um plano para continuar.`, 'Seu período de teste termina em 2 dias', body, siteUrl)
}

function d3NoGenHtml(siteUrl: string): string {
  const body = `
    ${p('Você criou sua conta há 3 dias, mas ainda não gerou nenhum post. Tudo bem, às vezes a rotina não deixa!')}
    ${p('Veja o que o ContentFlow gera para você em <strong>menos de 30 segundos</strong>:')}
    ${examplePost()}
    ${p('É só informar o tema e o tipo de conteúdo. O post chega pronto, com validação ética incluída.')}
    ${btn('Gerar meu primeiro conteúdo agora', `${siteUrl}/app`)}
  `
  return base('Ainda não gerou seu primeiro post? Veja como é simples.', 'Você ainda não gerou nenhum conteúdo', body, siteUrl)
}

function d7NoConvHtml(siteUrl: string): string {
  const body = `
    ${p('Você está há 7 dias no ContentFlow e seu período de teste ainda está ativo.')}
    ${tip('📊 Profissionais que usam o ContentFlow publicam em média <strong>3× mais conteúdo</strong>, sem gastar horas escrevendo.')}
    ${p('Para não perder o acesso quando o trial encerrar, escolha um plano:')}
    ${planCards()}
    ${btn('Escolher meu plano', `${siteUrl}/app`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">Tem alguma dúvida antes de assinar? Responda este e-mail.</p>
  `
  return base('Seu trial ainda está ativo. Escolha um plano antes de perder o acesso.', 'Ainda dá tempo de continuar no ContentFlow', body, siteUrl)
}

function trialExpiredHtml(siteUrl: string): string {
  const body = `
    ${p('Seu acesso gratuito chegou ao fim. Esperamos que você tenha gostado do ContentFlow!')}
    ${p('Para continuar criando conteúdo de qualidade para o seu Instagram, escolha um plano:')}
    ${planCards()}
    ${btn('Assinar agora', `${siteUrl}/app`)}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      Dúvidas? Responda este e-mail ou acesse
      <a href="${siteUrl}/contato" style="color:#1e4d35;font-weight:600;text-decoration:none;">flowcontent.com.br/contato</a>.
    </p>
  `
  return base('Seu trial encerrou. Assine para continuar gerando conteúdo.', 'Seu período de teste encerrou', body, siteUrl)
}
