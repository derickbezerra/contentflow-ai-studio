import { useState } from 'react'
import { Loader2, MailCheck, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

function passwordRules(pw: string) {
  return {
    length:  pw.length >= 8,
    letter:  /[a-zA-Z]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  }
}

function isPasswordValid(pw: string) {
  const r = passwordRules(pw)
  return r.length && r.letter && r.special
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function Signup() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const navigate = useNavigate()

  async function handleGoogleSignup() {
    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos de Uso para continuar.')
      return
    }
    localStorage.setItem('terms_pending_accept', '1')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    })
    if (error) setError(error.message)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos de Uso para continuar.')
      return
    }
    if (!isPasswordValid(password)) {
      setError('A senha precisa ter ao menos 8 caracteres, uma letra e um caractere especial.')
      return
    }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    })

    if (error) {
      setError(
        error.message.includes('already registered')
          ? 'Este e-mail já possui uma conta. Faça login.'
          : error.message
      )
      setLoading(false)
      return
    }

    // Confirm email desativado → sessão imediata
    if (data.session && data.user) {
      await supabase.from('users').update({
        terms_accepted_at: new Date().toISOString(),
        ...(name.trim() ? { full_name: name.trim() } : {}),
      }).eq('id', data.user.id)
      navigate('/app')
      return
    }

    // Confirm email ativado → mostrar tela de confirmação
    setLoading(false)
    setConfirmed(true)
  }

  // ── Aguardando confirmação ──
  if (confirmed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Confirme seu e-mail</h2>
          <p className="mb-1 text-sm text-muted-foreground">Enviamos um link de confirmação para</p>
          <p className="mb-6 text-sm font-semibold text-foreground">{email}</p>
          <p className="mb-8 text-xs leading-relaxed text-muted-foreground">
            Clique no link para ativar sua conta e começar os 7 dias grátis.
            Verifique também a pasta de spam.
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Voltar ao login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Criar conta grátis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crie seu conteúdo em menos de 30 segundos</p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignup}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <GoogleIcon />
          Cadastrar com Google
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Seu nome"
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Mín. 8 caracteres, letra e símbolo"
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {/* Indicadores em tempo real */}
            {password.length > 0 && (() => {
              const r = passwordRules(password)
              return (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {([
                    { ok: r.length,  label: 'Mín. 8 caracteres' },
                    { ok: r.letter,  label: 'Uma letra' },
                    { ok: r.special, label: 'Um caractere especial' },
                  ] as { ok: boolean; label: string }[]).map(({ ok, label }) => (
                    <span key={label} className={`flex items-center gap-1 text-xs ${ok ? 'text-primary' : 'text-muted-foreground'}`}>
                      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-40" />}
                      {label}
                    </span>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Termos */}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <span className="text-xs text-muted-foreground">
              Li e aceito os{' '}
              <Link to="/termos" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>
              {' '}e a{' '}
              <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" variant="cta" size="xl" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Aguarde...</> : 'Criar conta grátis'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>

      </div>
    </div>
  )
}
