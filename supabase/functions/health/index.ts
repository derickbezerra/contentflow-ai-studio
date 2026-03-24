import { createClient } from 'npm:@supabase/supabase-js'

Deno.serve(async () => {
  const start = Date.now()

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verifica conectividade com o banco
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error) throw new Error(`db: ${error.message}`)

    return new Response(
      JSON.stringify({ status: 'ok', latency_ms: Date.now() - start }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'error', message: String(err) }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
