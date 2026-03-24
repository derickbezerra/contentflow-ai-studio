import { createClient } from 'npm:@supabase/supabase-js'

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'bezerra@belvy.com.br'
const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://flowcontent.com.br'

// Internal cron endpoint — not exposed to users
Deno.serve(async (req) => {
  // Require internal secret to prevent unauthorized calls
  const secret = req.headers.get('x-cron-secret')
  if (secret !== Deno.env.get('CRON_SECRET')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const results = { welcome: 0, trial_d2: 0, trial_expired: 0, d3_no_gen: 0, d7_no_conv: 0, errors: 0 }

  // ── 1. Welcome email ─────────────────────────────────────────────────────
  // Users created more than 2 minutes ago who haven't received welcome yet
  const { data: newUsers } = await supabase
    .from('users')
    .select('id, email')
    .is('welcome_sent_at', null)
    .not('email', 'is', null)
    .lte('created_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())

  for (const user of newUsers ?? []) {
    const ok = await sendEmail(user.email, 'Bem-vindo ao ContentFlow!', welcomeHtml(SITE_URL))
    if (ok) {
      await supabase.from('users').update({ welcome_sent_at: new Date().toISOString() }).eq('id', user.id)
      results.welcome++
    } else {
      results.errors++
    }
  }

  // ── 2. Trial expiring in 2 days (D-2) ────────────────────────────────────
  // Free users whose trial ends between now+1d23h and now+2d1h (window to avoid double-send)
  const d2Start = new Date(Date.now() + (2 * 24 - 1) * 60 * 60 * 1000).toISOString()
  const d2End   = new Date(Date.now() + (2 * 24 + 1) * 60 * 60 * 1000).toISOString()

  const { data: d2Users } = await supabase
    .from('users')
    .select('id, email, trial_ends_at')
    .eq('plan', 'free')
    .is('trial_d2_sent_at', null)
    .gte('trial_ends_at', d2Start)
    .lte('trial_ends_at', d2End)

  for (const user of d2Users ?? []) {
    const endsAt = new Date(user.trial_ends_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    const ok = await sendEmail(user.email, 'Seu período de teste termina em 2 dias', trialD2Html(endsAt, SITE_URL))
    if (ok) {
      await supabase.from('users').update({ trial_d2_sent_at: new Date().toISOString() }).eq('id', user.id)
      results.trial_d2++
    } else {
      results.errors++
    }
  }

  // ── 3. Trial expired ─────────────────────────────────────────────────────
  // Free users whose trial ended in the last 24h (catchup window)
  const expiredSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: expiredUsers } = await supabase
    .from('users')
    .select('id, email')
    .eq('plan', 'free')
    .is('trial_expired_sent_at', null)
    .not('trial_ends_at', 'is', null)
    .lt('trial_ends_at', new Date().toISOString())
    .gte('trial_ends_at', expiredSince)

  for (const user of expiredUsers ?? []) {
    const ok = await sendEmail(user.email, 'Seu período de teste encerrou', trialExpiredHtml(SITE_URL))
    if (ok) {
      await supabase.from('users').update({ trial_expired_sent_at: new Date().toISOString() }).eq('id', user.id)
      results.trial_expired++
    } else {
      results.errors++
    }
  }

  // ── 4. D+3 sem geração ───────────────────────────────────────────────────
  // Free users who signed up 3+ days ago but never generated any content
  const { data: d3Users } = await supabase
    .from('users')
    .select('id, email')
    .eq('plan', 'free')
    .eq('generation_count', 0)
    .is('d3_no_generation_sent_at', null)
    .not('trial_ends_at', 'is', null)
    .gt('trial_ends_at', new Date().toISOString())       // trial still active
    .lte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())

  for (const user of d3Users ?? []) {
    const ok = await sendEmail(user.email, 'Você ainda não gerou nenhum conteúdo', d3NoGenHtml(SITE_URL))
    if (ok) {
      await supabase.from('users').update({ d3_no_generation_sent_at: new Date().toISOString() }).eq('id', user.id)
      results.d3_no_gen++
    } else {
      results.errors++
    }
  }

  // ── 5. D+7 sem conversão ─────────────────────────────────────────────────
  // Free users on trial for 7+ days who haven't subscribed yet
  const { data: d7Users } = await supabase
    .from('users')
    .select('id, email')
    .eq('plan', 'free')
    .is('d7_no_conversion_sent_at', null)
    .not('trial_ends_at', 'is', null)
    .gt('trial_ends_at', new Date().toISOString())       // trial still active
    .lte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  for (const user of d7Users ?? []) {
    const ok = await sendEmail(user.email, 'Ainda dá tempo de continuar no ContentFlow', d7NoConvHtml(SITE_URL))
    if (ok) {
      await supabase.from('users').update({ d7_no_conversion_sent_at: new Date().toISOString() }).eq('id', user.id)
      results.d7_no_conv++
    } else {
      results.errors++
    }
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
    if (!res.ok) {
      console.error('resend error:', await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('sendEmail error:', e)
    return false
  }
}

// ── Email templates ──────────────────────────────────────────────────────────

function base(title: string, body: string) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23">
    <div style="background:#3d6b52;padding:24px 32px;border-radius:12px 12px 0 0">
      <p style="color:#fff;font-size:18px;font-weight:600;margin:0">${title}</p>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
      ${body}
      <p style="font-size:12px;color:#94a3b8;margin:32px 0 0">ContentFlow &bull; <a href="${SITE_URL}/contato" style="color:#94a3b8">Fale conosco</a></p>
    </div>
  </div>`
}

function btn(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background:#3d6b52;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;margin-top:20px">${label}</a>`
}

function welcomeHtml(siteUrl: string) {
  return base('Bem-vindo ao ContentFlow!', `
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Oi! Estamos felizes em ter você aqui.</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">O ContentFlow cria posts, carrosséis e stories para o seu Instagram em segundos, com linguagem pensada para profissionais de saúde.</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 4px">Para começar, escolha um tema e gere seu primeiro conteúdo agora:</p>
    ${btn('Gerar meu primeiro conteúdo', `${siteUrl}/app`)}
  `)
}

function trialD2Html(endsAt: string, siteUrl: string) {
  return base('Seu período de teste termina em 2 dias', `
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Seu acesso gratuito ao ContentFlow encerra em <strong>${endsAt}</strong>.</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Para continuar gerando conteúdo sem interrupção, assine um dos planos:</p>
    <ul style="font-size:14px;line-height:2;color:#475569;padding-left:20px;margin:0 0 4px">
      <li><strong>Starter</strong> — 10 gerações/mês</li>
      <li><strong>Growth</strong> — 30 gerações/mês</li>
      <li><strong>Pro</strong> — 100 gerações/mês</li>
    </ul>
    ${btn('Ver planos e assinar', `${siteUrl}/app`)}
  `)
}

function d3NoGenHtml(siteUrl: string) {
  return base('Você ainda não gerou nenhum conteúdo', `
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Você criou sua conta há 3 dias, mas ainda não gerou nenhum post. Tudo bem!</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Aqui vai um exemplo do que o ContentFlow faz por você em menos de 30 segundos:</p>
    <div style="background:#f8fafc;border-left:3px solid #3d6b52;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 20px">
      <p style="font-size:13px;font-weight:600;color:#3d6b52;margin:0 0 8px">Exemplo — Post para nutricionista</p>
      <p style="font-size:14px;line-height:1.6;color:#334155;margin:0"><strong>Você sabia que 70% das pessoas desidratam sem perceber?</strong> O corpo confunde sede com fome. Resultado: você come mais, fica cansado e sem foco. O simples hábito de beber 2L de água por dia muda isso. Me conta: você bebe água suficiente? Salva esse post pra lembrar!</p>
    </div>
    <p style="font-size:15px;line-height:1.7;margin:0 0 4px">É só escolher o tema e o tipo de conteúdo. Em 30 segundos, o post está pronto.</p>
    ${btn('Gerar meu primeiro conteúdo agora', `${siteUrl}/app`)}
  `)
}

function d7NoConvHtml(siteUrl: string) {
  return base('Ainda dá tempo de continuar no ContentFlow', `
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Você está há 7 dias no ContentFlow e seu período de teste ainda está ativo.</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Profissionais que usam o ContentFlow consistentemente publicam em média <strong>3x mais conteúdo</strong> do que faziam antes, sem gastar horas escrevendo.</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Para não perder o acesso quando o trial encerrar, assine agora:</p>
    <ul style="font-size:14px;line-height:2;color:#475569;padding-left:20px;margin:0 0 4px">
      <li><strong>Starter</strong> — 10 gerações/mês</li>
      <li><strong>Growth</strong> — 30 gerações/mês</li>
      <li><strong>Pro</strong> — 100 gerações/mês</li>
    </ul>
    ${btn('Escolher meu plano', `${siteUrl}/app`)}
    <p style="font-size:13px;color:#64748b;margin:16px 0 0">Tem alguma dúvida antes de assinar? Responda este e-mail.</p>
  `)
}

function trialExpiredHtml(siteUrl: string) {
  return base('Seu período de teste encerrou', `
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Seu acesso gratuito chegou ao fim. Esperamos que você tenha gostado do ContentFlow!</p>
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px">Para continuar criando conteúdo de qualidade para o seu Instagram, escolha um plano:</p>
    <ul style="font-size:14px;line-height:2;color:#475569;padding-left:20px;margin:0 0 4px">
      <li><strong>Starter</strong> — 10 gerações/mês</li>
      <li><strong>Growth</strong> — 30 gerações/mês</li>
      <li><strong>Pro</strong> — 100 gerações/mês</li>
    </ul>
    ${btn('Assinar agora', `${siteUrl}/app`)}
    <p style="font-size:13px;color:#64748b;margin:16px 0 0">Dúvidas? Responda este e-mail ou acesse <a href="${siteUrl}/contato" style="color:#3d6b52">flowcontent.com.br/contato</a>.</p>
  `)
}
