const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (Number(req.headers.get('content-length')) > 5000) {
      return new Response(JSON.stringify({ error: 'Payload muito grande.' }), {
        status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { name, email, phone, subject, message } = await req.json()

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Nome inválido.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'E-mail inválido.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Mensagem muito curta.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Mensagem muito longa (máx. 2000 caracteres).' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const cleanSubject = subject?.trim() || 'Sem assunto'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'bezerra@belvy.com.br'
    const resendKey = Deno.env.get('RESEND_API_KEY')!

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e23">
        <div style="background:#3d6b52;padding:24px 32px;border-radius:12px 12px 0 0">
          <p style="color:#fff;font-size:18px;font-weight:600;margin:0">Nova mensagem — ContentFlow</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:80px">Nome</td><td style="padding:8px 0;font-size:14px">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px">E-mail</td><td style="padding:8px 0;font-size:14px"><a href="mailto:${escapeHtml(email)}" style="color:#3d6b52">${escapeHtml(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Telefone</td><td style="padding:8px 0;font-size:14px">${escapeHtml(phone)}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Assunto</td><td style="padding:8px 0;font-size:14px">${escapeHtml(cleanSubject)}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
          <p style="color:#64748b;font-size:13px;margin:0 0 8px">Mensagem</p>
          <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ContentFlow <contato@flowcontent.com.br>',
        to: [adminEmail],
        reply_to: email,
        subject: `[ContentFlow] ${cleanSubject}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('resend error:', err)
      throw new Error('Falha ao enviar email.')
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-contact error:', err)
    return new Response(JSON.stringify({ error: 'Não foi possível enviar a mensagem. Tente novamente.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
