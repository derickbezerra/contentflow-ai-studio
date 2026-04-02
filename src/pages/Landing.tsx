import { lazy, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
const HeroDemoPlayer = lazy(() => import('@/components/HeroDemoPlayer').then(m => ({ default: m.HeroDemoPlayer })))
import {
  Check,
  Zap,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ───── data ───── */
const COUNCILS = [
  {
    sigla: 'CFM',
    name: 'Conselho Federal de Medicina',
    vertical: 'Medicina',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    rules: [
      'Sem fotos ou vídeos antes/depois',
      'Sem garantia de resultado clínico',
      'Sem uso de depoimentos de pacientes',
      'Sem linguagem sensacionalista ou alarmista',
    ],
  },
  {
    sigla: 'CFO',
    name: 'Conselho Federal de Odontologia',
    vertical: 'Odontologia',
    color: 'text-sky-600',
    bg: 'bg-sky-500/8',
    border: 'border-sky-500/20',
    rules: [
      'Sem fotos antes/depois de sorrisos',
      'Sem garantia de resultado estético',
      'Sem comparação com outros profissionais',
      'Sem preços como apelo publicitário',
    ],
  },
  {
    sigla: 'CFP',
    name: 'Conselho Federal de Psicologia',
    vertical: 'Psicologia',
    color: 'text-violet-600',
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    rules: [
      'Sem divulgação de casos clínicos',
      'Sem garantia de resultado terapêutico',
      'Sem diagnóstico aplicado ao leitor',
      'Sem linguagem que romantize sofrimento',
    ],
  },
  {
    sigla: 'CFN',
    name: 'Conselho Federal de Nutrição',
    vertical: 'Nutrição',
    color: 'text-amber-600',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    rules: [
      'Sem promessa de emagrecimento em X semanas',
      'Sem dietas milagrosas ou alimentos proibidos',
      'Sem fotos antes/depois de corpo',
      'Recomendações baseadas em evidências',
    ],
  },
]


const PLANS = [
  {
    name: 'Starter',
    price: 47,
    limit: '10 conteúdos/mês',
    highlight: false,
    features: [
      '10 conteúdos por mês',
      'Carrossel, Post e Story',
      'Todas as especialidades',
      'Validação ética automática',
    ],
  },
  {
    name: 'Growth',
    price: 97,
    limit: '30 conteúdos/mês',
    highlight: true,
    features: [
      '30 conteúdos por mês',
      'Carrossel, Post e Story',
      'Todas as especialidades',
      'Validação ética automática',
      'Perfil de marca personalizado',
      'Histórico de conteúdo',
    ],
  },
  {
    name: 'Pro',
    price: 127,
    limit: '50 conteúdos/mês',
    highlight: false,
    compliance: true,
    features: [
      '50 conteúdos por mês',
      'Carrossel, Post e Story',
      'Todas as especialidades',
      'Validação ética automática',
      'Analisador de Compliance (CFM/CFO/CFP/CFN)',
      'Perfil de marca personalizado',
      'Histórico de conteúdo',
    ],
  },
]

const STATS = [
  { icon: Clock, value: '< 30s', label: 'para gerar um post completo' },
  { icon: TrendingUp, value: '+500', label: 'profissionais ativos na plataforma' },
  { icon: FileText, value: '+12.000', label: 'conteúdos já gerados' },
  { icon: Sparkles, value: '4', label: 'conselhos validados (CFM, CFO, CFP, CFN)' },
]

const CAROUSEL_SLIDES = [
  { badge: '1 / 7', title: 'Colesterol alto silencioso', body: '5 sinais que seu corpo dá e você ignora todo dia.' },
  { badge: '2 / 7', title: 'Por que você não perde peso', body: 'Não é falta de força de vontade. É falta de informação.' },
  { badge: '3 / 7', title: 'Ansiedade não é frescura', body: 'Entenda o que acontece no seu corpo quando ela aparece.' },
  { badge: '4 / 7', title: '3 lanches que parecem saudáveis', body: '...mas estão atrapalhando os seus resultados.' },
]

const TESTIMONIALS = [
  {
    name: 'Dra. Camila Torres',
    role: 'Nutricionista Esportiva',
    location: 'São Paulo, SP',
    initials: 'CT',
    avatarColor: 'bg-green-100 text-green-700',
    text: 'Reduzi de 3 horas para 15 minutos por semana na criação de conteúdo. E o melhor: os posts atraem exatamente o perfil de paciente que eu atendo. Recebi 4 agendamentos na primeira semana.',
  },
  {
    name: 'Dr. Rafael Neves',
    role: 'Cardiologista',
    location: 'Rio de Janeiro, RJ',
    initials: 'RN',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    text: 'A validação automática do CFM me deu segurança para publicar toda semana. Antes eu tinha medo de infringir alguma norma e simplesmente não postava. Hoje tenho constância e meu perfil cresceu 40% em 2 meses.',
  },
  {
    name: 'Dra. Isabela Castro',
    role: 'Psicóloga Clínica (TCC)',
    location: 'Belo Horizonte, MG',
    initials: 'IC',
    avatarColor: 'bg-violet-100 text-violet-700',
    text: 'O conteúdo fala exatamente com o paciente que eu quero atender. Saí de 0 posts por mês para 8, sem terceirizar para agência. Já recuperei o investimento no primeiro mês com novos pacientes.',
  },
]

const FAQ_ITEMS = [
  {
    q: 'O conteúdo gerado pode ser publicado diretamente?',
    a: 'Sim. Os posts já saem formatados para Instagram (carrossel, post e story). Você pode ajustar o texto antes de publicar, mas a maioria dos usuários publica com poucas ou nenhuma edição.',
  },
  {
    q: 'O que é a validação ética automática?',
    a: 'Cada conteúdo gerado é automaticamente analisado com base nas normas do seu conselho (CFM, CFO, CFP ou CFN). O sistema indica se está aprovado, aprovado com ressalvas ou precisa de ajustes, tudo antes de você publicar. Não substitui orientação jurídica, mas reduz significativamente o risco de infrações não intencionais.',
  },
  {
    q: 'Funciona para subespecialidades médicas?',
    a: 'Sim. A plataforma é otimizada para Medicina Geral, Nutrição, Odontologia e Psicologia. Subespecialidades (cardiologia, dermatologia, ortopedia, etc.) funcionam muito bem porque você detalha o tema no campo de tema.',
  },
  {
    q: 'Preciso fornecer cartão de crédito para testar?',
    a: 'Não. Os primeiros 7 dias são completamente gratuitos, sem precisar cadastrar cartão. Você experimenta com suas próprias ideias e decide depois.',
  },
  {
    q: 'Como funciona o limite de conteúdos?',
    a: 'Cada geração (carrossel, post ou story) conta como 1 conteúdo. Você escolhe o formato na hora de gerar e o contador reinicia todo mês.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Sem fidelidade nem multa. Você cancela quando quiser pelo próprio painel e mantém acesso até o final do período já pago.',
  },
]

/* ───── scroll reveal ───── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => el.classList.add('revealed')

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          io.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 100px 0px' }
    )
    io.observe(el)

    // Handle anchor-link navigation: browser scrolls AFTER mount
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight + 150) {
        reveal()
        io.disconnect()
      }
    }, 150)

    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [])
  return ref
}

function RevealSection({
  children,
  className = '',
  ...rest
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal-section ${className}`} {...rest}>
      {children}
    </div>
  )
}

/* ───── FAQ item ───── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  )
}

/* ───── animated carousel preview ───── */
function SlidePreview() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
        setVisible(true)
      }, 350)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const slide = CAROUSEL_SLIDES[current]

  return (
    <div className="relative mx-auto w-full max-w-xs">
      {/* shadow cards */}
      <div className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl bg-primary/20" />
      <div className="absolute -bottom-1.5 -right-1.5 h-full w-full rounded-2xl bg-primary/10" />
      {/* main slide */}
      <div
        className="relative rounded-2xl p-7 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, hsl(160,60%,22%), hsl(170,50%,18%))' }}
      >
        <div
          style={{
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <span className="mb-5 inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
            {slide.badge}
          </span>
          <h3 className="mb-3 text-[1.4rem] font-extrabold leading-tight text-white">
            {slide.title}
          </h3>
          <div className="mb-3 h-[2px] w-8 rounded-full bg-white/25" />
          <p className="text-sm font-medium leading-relaxed text-white/80">{slide.body}</p>
          <p className="mt-5 text-[11px] text-white/35">@seuperfil.instagram</p>
        </div>

        {/* dot indicators */}
        <div className="mt-5 flex gap-1.5">
          {CAROUSEL_SLIDES.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === current ? '16px' : '4px',
                backgroundColor:
                  i === current ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Compliance badge below card */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2.5">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <span className="text-[11px] font-semibold text-emerald-700">
          Validado pelo CFM · Aprovado
        </span>
      </div>
    </div>
  )
}

/* ───── page ───── */
export default function Landing() {
  const navigate = useNavigate()
  const [showStickyCTA, setShowStickyCTA] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 580)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          {/* Logo */}
          <a href="/" aria-label="ContentFlow">
            <svg width="140" height="34" viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M5 30 C11 26, 17 34, 23 30 C29 26, 35 34, 41 30 L41 37 C35 41, 29 33, 23 37 C17 41, 11 33, 5 37 Z" fill="hsl(var(--primary))" />
                <path d="M3 21 C9 17, 16 25, 23 21 C30 17, 37 25, 43 21 L43 28 C37 32, 30 24, 23 28 C16 32, 9 24, 3 28 Z" fill="hsl(var(--primary) / 0.6)" />
                <path d="M1 13 C8 9, 16 17, 23 13 C30 9, 38 17, 45 13 L45 20 C38 24, 30 16, 23 20 C16 24, 8 16, 1 20 Z" fill="hsl(var(--primary) / 0.2)" />
              </g>
              <text x="54" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="21" fontWeight="400">
                <tspan fill="hsl(var(--foreground))">Content</tspan>
                <tspan fill="hsl(var(--primary))">Flow</tspan>
              </text>
            </svg>
          </a>

          {/* Anchor links — desktop only */}
          <div className="hidden items-center gap-6 sm:flex">
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
              Começar grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-5 pb-16 pt-12 sm:pb-24 sm:pt-16">
        {/* background orbs */}
        <div className="animate-pulse-slow pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="animate-pulse-slow pointer-events-none absolute -bottom-20 left-1/4 h-[300px] w-[400px] rounded-full bg-emerald-400/[0.04] blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="animate-pulse-slow pointer-events-none absolute -bottom-20 right-1/4 h-[300px] w-[400px] rounded-full bg-teal-400/[0.04] blur-3xl" style={{ animationDelay: '1s' }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* left */}
            <div className="animate-fade-up text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Para profissionais de saúde
              </div>

              <h1
                className="mb-4 text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.25rem]"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                Posts que atraem{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, hsl(160,84%,28%), hsl(170,70%,38%))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  pacientes certos
                </span>{' '}
                para sua agenda
              </h1>

              <p className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 mx-auto">
                Gere conteúdo para Instagram em segundos, validado pelo seu conselho. Sem tela em branco, sem agência, sem complicação.
              </p>

              <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button
                  size="xl"
                  variant="cta"
                  onClick={() => navigate('/signup')}
                  className="group shadow-lg shadow-primary/20"
                >
                  Teste grátis por 7 dias
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </div>
              <div className="mt-3 flex flex-col items-center gap-1 sm:flex-row sm:gap-4 lg:justify-start">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary" /> Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary" /> Cancele quando quiser
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary" /> Pronto em 30 segundos
                </span>
              </div>

              {/* social proof avatars */}
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <div className="flex -space-x-2">
                  {['CT', 'RN', 'IC', 'MF', 'DS'].map((initials, i) => (
                    <div
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[10px] font-bold text-primary"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">+500 profissionais</span>{' '}já geraram +12.000 conteúdos
                </p>
              </div>
            </div>

            {/* right — Remotion Hero Demo */}
            <div
              className="animate-fade-in flex justify-center"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-primary/10">
                <Suspense
                  fallback={
                    <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-[#0a1628]">
                      <SlidePreview />
                    </div>
                  }
                >
                  <div style={{ aspectRatio: "720/420" }}>
                    <HeroDemoPlayer />
                  </div>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-border/60 bg-gradient-to-r from-primary/[0.03] via-card/80 to-primary/[0.03] backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-5 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
                <s.icon className="mb-1 h-5 w-5 text-primary/70" />
                <span className="text-2xl font-extrabold tracking-tight text-foreground">{s.value}</span>
                <span className="text-[11px] leading-snug text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COMPLIANCE — killer differentiator, moved up ── */}
      <RevealSection className="px-5 py-16 sm:py-24" id="validacao">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-3 py-1 text-xs font-semibold text-emerald-600">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Única ferramenta que faz isso
            </span>
          </div>

          <h2
            className="mb-3 text-center text-2xl font-bold text-foreground sm:text-3xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Publique sem medo de punição do conselho
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-center text-sm text-muted-foreground">
            O ContentFlow é a única ferramenta que analisa automaticamente se o conteúdo segue as normas éticas do CFM, CFO, CFP ou CFN, antes de você publicar.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COUNCILS.map((c) => (
              <div key={c.sigla} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`text-xl font-extrabold tracking-tight ${c.color}`}>
                    {c.sigla}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">{c.vertical}</span>
                </div>
                <ul className="space-y-1.5">
                  {c.rules.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/75">
                      <Check className={`mt-0.5 h-3 w-3 shrink-0 ${c.color}`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Compliance video */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-border shadow-lg">
            <video
              src="/compliance-video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full"
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              A validação é automática e aparece ao final de cada conteúdo gerado com indicação
              visual clara: aprovado, aprovado com ressalvas ou requer revisão. Não substitui
              orientação jurídica, mas reduz significativamente o risco de infrações éticas não
              intencionais.
            </p>
          </div>

          {/* CTA after compliance */}
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <Button
              size="lg"
              variant="cta"
              onClick={() => navigate('/signup')}
              className="group shadow-lg shadow-primary/20"
            >
              Teste grátis por 7 dias
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
            <p className="text-xs text-muted-foreground">Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
        </div>
      </RevealSection>


      {/* ── TESTIMONIALS ── */}
      <RevealSection className="bg-card/40 px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">
            Depoimentos
          </p>
          <h2
            className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Quem já usa o ContentFlow
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* stars */}
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="flex-1 text-sm italic leading-relaxed text-foreground/80">
                  "{t.text}"
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${t.avatarColor}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role} · {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA after testimonials */}
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <Button
              size="lg"
              variant="cta"
              onClick={() => navigate('/signup')}
              className="group shadow-lg shadow-primary/20"
            >
              Comece seu teste grátis agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
            <p className="text-xs text-muted-foreground">7 dias grátis. Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
        </div>
      </RevealSection>

      {/* ── PRICING ── */}
      <RevealSection className="px-5 pt-20 pb-16 sm:pt-32 sm:pb-24" id="precos">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">
            Planos
          </p>
          <h2
            className="mb-3 text-center text-2xl font-bold text-foreground sm:text-3xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Comece a atrair pacientes hoje
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? 'border-2 border-primary bg-primary/[0.04] shadow-xl shadow-primary/10'
                    : 'border border-border bg-card hover:shadow-lg'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow-md">
                    Mais popular
                  </div>
                )}

                <p
                  className={`mb-2 text-xs font-bold uppercase tracking-wider ${
                    plan.highlight ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {plan.name}
                </p>

                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-xs font-medium text-muted-foreground">R$</span>
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <p className="mb-6 text-xs text-muted-foreground">{plan.limit}</p>

                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map((f) => {
                    const isCompliance = f.startsWith('Analisador de Compliance')
                    return (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        {isCompliance
                          ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          : <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        }
                        <span className={isCompliance ? 'font-semibold text-primary' : ''}>{f}</span>
                      </li>
                    )
                  })}
                </ul>

                <Button
                  variant={plan.highlight ? 'cta' : 'outline'}
                  className={`w-full ${plan.highlight ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => navigate('/signup')}
                >
                  {plan.highlight
                    ? <><Zap className="h-4 w-4" /> Começar teste grátis</>
                    : 'Começar teste grátis'}
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  7 dias grátis. Sem cartão.
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── FAQ ── */}
      <RevealSection className="bg-card/40 px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">
            Dúvidas frequentes
          </p>
          <h2
            className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Suas dúvidas, respondidas
          </h2>

          <div className="rounded-2xl border border-border bg-card px-6">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── FINAL CTA ── */}
      <RevealSection className="px-5 py-16 sm:py-24">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
          style={{ background: 'linear-gradient(135deg, hsl(160,84%,20%), hsl(170,60%,28%))' }}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Sem cartão de crédito
            </div>
            <h2
              className="mb-4 text-3xl font-extrabold text-white sm:text-4xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Comece a atrair pacientes com o conteúdo certo hoje
            </h2>
            <div className="mx-auto mb-8 space-y-2 text-sm leading-relaxed text-white/70">
              <p>Sua primeira semana de posts pode estar pronta em menos de 10 minutos.</p>
              <p>Sem precisar pensar no que escrever. Sem tela em branco. Sem desculpa.</p>
            </div>
            <Button
              size="xl"
              onClick={() => navigate('/signup')}
              className="group bg-white text-primary shadow-xl hover:bg-white/90"
            >
              Gerar meus primeiros posts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </RevealSection>

      {/* ── STICKY MOBILE CTA ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 px-4 pb-safe pt-3 pb-4 backdrop-blur-md transition-all duration-300 sm:hidden ${
          showStickyCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <Button
          variant="cta"
          size="lg"
          className="w-full shadow-lg shadow-primary/20"
          onClick={() => navigate('/signup')}
        >
          Testar grátis por 7 dias
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Sem cartão de crédito</p>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-card/40 px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 grid gap-8 sm:grid-cols-3">
            {/* brand */}
            <div>
              <svg
                className="mb-3"
                width="120"
                height="30"
                viewBox="0 0 180 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path
                    d="M5 30 C11 26, 17 34, 23 30 C29 26, 35 34, 41 30 L41 37 C35 41, 29 33, 23 37 C17 41, 11 33, 5 37 Z"
                    fill="hsl(var(--primary))"
                  />
                  <path
                    d="M3 21 C9 17, 16 25, 23 21 C30 17, 37 25, 43 21 L43 28 C37 32, 30 24, 23 28 C16 32, 9 24, 3 28 Z"
                    fill="hsl(var(--primary) / 0.6)"
                  />
                  <path
                    d="M1 13 C8 9, 16 17, 23 13 C30 9, 38 17, 45 13 L45 20 C38 24, 30 16, 23 20 C16 24, 8 16, 1 20 Z"
                    fill="hsl(var(--primary) / 0.2)"
                  />
                </g>
                <text
                  x="54"
                  y="30"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontSize="21"
                  fontWeight="400"
                >
                  <tspan fill="hsl(var(--foreground))">Content</tspan>
                  <tspan fill="hsl(var(--primary))">Flow</tspan>
                </text>
              </svg>
              <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                Conteúdo para Instagram de profissionais de saúde, respeitando as normas do seu conselho.
              </p>
            </div>

            {/* specialties */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                Especialidades
              </p>
              <div className="space-y-2.5">
                <a href="#validacao" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Medicina</a>
                <a href="#validacao" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Nutrição</a>
                <a href="#validacao" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Odontologia</a>
                <a href="#validacao" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Psicologia</a>
              </div>
            </div>

            {/* legal */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                Empresa
              </p>
              <div className="space-y-2.5">
                <Link
                  to="/termos"
                  className="block text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Termos de uso
                </Link>
                <Link
                  to="/privacidade"
                  className="block text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Política de privacidade
                </Link>
                <Link
                  to="/contato"
                  className="block text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contato
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} ContentFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
