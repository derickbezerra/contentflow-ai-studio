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

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup' | 'confirm'>('login')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'signup' && !termsAccepted) {
      setError('Você precisa aceitar os Termos de Uso para criar uma conta.')
      return
    }
    setLoading(true)
    setError('')

    // ── Login ──
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : error.message
        )
        setLoading(false)
        return
      }
      navigate('/app')
      return
    }

    // ── Signup ──
    if (!isPasswordValid(password)) {
      setError('A senha precisa ter ao menos 8 caracteres, uma letra e um caractere especial.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(
        error.message.includes('already registered')
          ? 'Este e-mail já possui uma conta. Faça login.'
          : error.message
      )
      setLoading(false)
      return
    }

    // Supabase "Confirm email" desativado → session criada imediatamente
    if (data.session && data.user) {
      await supabase.from('users').update({ terms_accepted_at: new Date().toISOString() }).eq('id', data.user.id)
      navigate('/app')
      return
    }

    // Supabase "Confirm email" ativado → sem session; mostrar estado de confirmação
    setLoading(false)
    setMode('confirm')
  }

  async function handleGoogleLogin() {
    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos de Uso para continuar.')
      return
    }
    setGoogleLoading(true)
    localStorage.setItem('terms_pending_accept', '1')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  // ── Email confirmation pending ──
  if (mode === 'confirm') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Confirme seu e-mail</h2>
          <p className="mb-1 text-sm text-muted-foreground">
            Enviamos um link de confirmação para
          </p>
          <p className="mb-6 text-sm font-semibold text-foreground">{email}</p>
          <p className="mb-8 text-xs leading-relaxed text-muted-foreground">
            Clique no link no e-mail para ativar sua conta e começar o período gratuito de 7 dias.
            Verifique também a pasta de spam.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setMode('login'); setError('') }}
          >
            Voltar ao login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <svg width="180" height="44" viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M5 30 C11 26, 17 34, 23 30 C29 26, 35 34, 41 30 L41 37 C35 41, 29 33, 23 37 C17 41, 11 33, 5 37 Z" fill="#3d6b52"/>
              <path d="M3 21 C9 17, 16 25, 23 21 C30 17, 37 25, 43 21 L43 28 C37 32, 30 24, 23 28 C16 32, 9 24, 3 28 Z" fill="#5a8a6a"/>
              <path d="M1 13 C8 9, 16 17, 23 13 C30 9, 38 17, 45 13 L45 20 C38 24, 30 16, 23 20 C16 24, 8 16, 1 20 Z" fill="#c8ddd0"/>
            </g>
            <text x="54" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="21" fontWeight="400">
              <tspan fill="#1a2e23">Content</tspan><tspan fill="#6b9e7e">Flow</tspan>
            </text>
          </svg>
          <p className="text-sm text-muted-foreground">
            {mode === 'signup' ? 'Crie seu primeiro conteúdo em menos de 30 segundos' : 'IA especializada para profissionais de saúde'}
          </p>
        </div>

        {/* Terms acceptance — always visible */}
        <label className="mb-5 flex cursor-pointer items-start gap-3">
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

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Continuar com Google
        </button>

        {/* Divider */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
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
              placeholder="••••••••"
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {/* Password requirements — only in signup, shown after first keystroke */}
            {mode === 'signup' && password.length > 0 && (() => {
              const r = passwordRules(password)
              return (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {([
                    { ok: r.length,  label: 'Mín. 8 caracteres' },
                    { ok: r.letter,  label: 'Uma letra' },
                    { ok: r.special, label: 'Um caractere especial' },
                  ] as { ok: boolean; label: string }[]).map(({ ok, label }) => (
                    <span key={label} className={`flex items-center gap-1 text-xs ${ok ? 'text-primary' : 'text-muted-foreground'}`}>
                      {ok
                        ? <Check className="h-3 w-3" />
                        : <X className="h-3 w-3 opacity-40" />}
                      {label}
                    </span>
                  ))}
                </div>
              )
            })()}
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" variant="cta" size="xl" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Aguarde...</>
            ) : mode === 'login' ? 'Entrar' : 'Criar conta grátis · 7 dias free'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="font-medium text-primary hover:underline"
          >
            {mode === 'login' ? 'Criar conta grátis' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
