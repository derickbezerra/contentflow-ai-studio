import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Stethoscope,
  Salad,
  Check,
  Zap,
  ArrowRight,
  Sparkles,
  FileText,
  Image,
  Smartphone,
  Smile,
  Clock,
  TrendingUp,
  Shield,
  Pencil,
  LayoutTemplate,
  Download,
  Brain,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/* ───── data ───── */
const VERTICALS = [
  {
    icon: Stethoscope,
    label: 'Medicina',
    desc: 'Mostre o seu conhecimento de forma simples e conquiste a confiança de novos pacientes.',
    example: '"Colesterol alto: 5 sinais que você ignora"',
    color: 'from-emerald-500/10 to-teal-500/10',
    border: 'hover:border-emerald-400/40',
    href: '/para-medicos',
  },
  {
    icon: Salad,
    label: 'Nutrição',
    desc: 'Compartilhe dicas sobre alimentação que as pessoas adoram ler e salvar.',
    example: '"3 alimentos que sabotam sua dieta sem você saber"',
    color: 'from-green-500/10 to-lime-500/10',
    border: 'hover:border-green-400/40',
    href: '/para-nutricionistas',
  },
  {
    icon: Smile,
    label: 'Odontologia',
    desc: 'Atraia quem quer sorrir melhor com conteúdo que educa e gera interesse.',
    example: '"Clareamento dental: o que ninguém te conta"',
    color: 'from-cyan-500/10 to-sky-500/10',
    border: 'hover:border-cyan-400/40',
    href: '/para-dentistas',
  },
  {
    icon: Brain,
    label: 'Psicologia',
    desc: 'Humanize a psicologia e atraia quem busca cuidado emocional com conteúdo acolhedor.',
    example: '"Ansiedade não é frescura: entenda o que acontece no seu corpo"',
    color: 'from-violet-500/10 to-purple-500/10',
    border: 'hover:border-violet-400/40',
    href: '/para-psicologos',
  },
]

const FORMATS = [
  {
    icon: Image,
    label: 'Carrossel',
    desc: 'Slides com visual profissional, prontos para postar no feed',
    preview: ['Capa que chama atenção', 'Conteúdo claro e direto', 'Slide final com chamada'],
  },
  {
    icon: FileText,
    label: 'Post',
    desc: 'Texto completo com começo, meio e fim. É só copiar e colar',
    preview: ['Frase de abertura forte', 'Conteúdo bem explicado', 'Convite para agir'],
  },
  {
    icon: Smartphone,
    label: 'Story',
    desc: 'Um roteiro para você gravar com confiança e naturalidade',
    preview: ['Desperta a curiosidade', 'Explica de forma simples', 'Convida para o próximo passo'],
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: 27,
    limit: '10 conteúdos/mês',
    highlight: false,
    features: ['10 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades'],
  },
  {
    name: 'Growth',
    price: 47,
    limit: '30 conteúdos/mês',
    highlight: true,
    features: ['30 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades', 'Perfil de marca personalizado', 'Histórico de conteúdo'],
  },
  {
    name: 'Pro',
    price: 97,
    limit: '100 conteúdos/mês',
    highlight: false,
    features: ['100 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades', 'Perfil de marca personalizado', 'Histórico de conteúdo', 'Suporte prioritário'],
  },
]

const STATS = [
  { icon: Clock, value: '< 30s', label: 'por conteúdo gerado' },
  { icon: TrendingUp, value: '3 formatos', label: 'Carrossel, Post e Story' },
  { icon: Shield, value: '7 dias', label: 'grátis, sem cartão' },
  { icon: Sparkles, value: '4 áreas', label: 'Medicina, Nutrição, Odonto, Psico' },
]

const CAROUSEL_SLIDES = [
  {
    badge: '1 / 7',
    title: 'Colesterol alto silencioso',
    body: '5 sinais que seu corpo dá e você ignora todo dia.',
  },
  {
    badge: '2 / 7',
    title: 'Por que você não perde peso',
    body: 'Não é falta de força de vontade. É falta de informação.',
  },
  {
    badge: '3 / 7',
    title: 'Ansiedade não é frescura',
    body: 'Entenda o que acontece no seu corpo quando ela aparece.',
  },
  {
    badge: '4 / 7',
    title: '3 lanches que parecem saudáveis',
    body: '...mas estão atrapalhando os seus resultados.',
  },
]

/* ───── scroll reveal ───── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); io.disconnect() } },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function RevealSection({ children, className = '', ...rest }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useReveal()
  return <div ref={ref} className={`reveal-section ${className}`} {...rest}>{children}</div>
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
          <p className="text-sm font-medium leading-relaxed text-white/80">
            {slide.body}
          </p>
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
                backgroundColor: i === current ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───── page ───── */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <svg width="140" height="34" viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M5 30 C11 26, 17 34, 23 30 C29 26, 35 34, 41 30 L41 37 C35 41, 29 33, 23 37 C17 41, 11 33, 5 37 Z" fill="hsl(var(--primary))"/>
              <path d="M3 21 C9 17, 16 25, 23 21 C30 17, 37 25, 43 21 L43 28 C37 32, 30 24, 23 28 C16 32, 9 24, 3 28 Z" fill="hsl(var(--primary) / 0.6)"/>
              <path d="M1 13 C8 9, 16 17, 23 13 C30 9, 38 17, 45 13 L45 20 C38 24, 30 16, 23 20 C16 24, 8 16, 1 20 Z" fill="hsl(var(--primary) / 0.2)"/>
            </g>
            <text x="54" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="21" fontWeight="400">
              <tspan fill="hsl(var(--foreground))">Content</tspan><tspan fill="hsl(var(--primary))">Flow</tspan>
            </text>
          </svg>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
            <Button size="sm" onClick={() => navigate('/login')}>Começar grátis</Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-5 pb-24 pt-20 sm:pt-32">
        {/* animated orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl" style={{ animation: 'pulse-slow 6s ease-in-out infinite' }} />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-[300px] w-[400px] rounded-full bg-emerald-400/[0.04] blur-3xl" style={{ animation: 'pulse-slow 8s ease-in-out infinite reverse' }} />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-[300px] w-[400px] rounded-full bg-teal-400/[0.04] blur-3xl" style={{ animation: 'pulse-slow 7s ease-in-out infinite' }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* left */}
            <div className="animate-fade-up text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                IA especializada para profissionais de saúde
              </div>

              <h1 className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ textWrap: 'balance' }}>
                Conteúdo que constrói{' '}
                <span style={{ background: 'linear-gradient(135deg, hsl(160,84%,28%), hsl(170,70%,38%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  autoridade
                </span>{' '}
                e atrai pacientes
              </h1>

              <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-muted-foreground lg:mx-0 sm:text-lg" style={{ textWrap: 'pretty' }}>
                Digite uma ideia — o ContentFlow gera carrossel, post e story prontos para postar. Em menos de 30 segundos.
              </p>

              <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button size="xl" variant="cta" onClick={() => navigate('/login')} className="group shadow-lg shadow-primary/20">
                  Começar grátis por 7 dias
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <p className="text-xs text-muted-foreground">Sem cartão de crédito</p>
              </div>
            </div>

            {/* right — animated carousel preview */}
            <div className="animate-fade-in flex justify-center" style={{ animationDelay: '0.2s' }}>
              <SlidePreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-5 py-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <s.icon className="mb-1 h-4 w-4 text-primary/60" />
                <span className="text-xl font-bold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <RevealSection className="px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Como funciona</p>
          <h2 className="mb-16 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Três passos. Conteúdo na tela.
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Pencil,
                step: '01',
                title: 'Escreva uma ideia',
                desc: 'Pode ser bem curta: "colesterol alto", "clareamento dental" ou "como emagrecer com saúde".',
                gradient: 'from-emerald-500/15 to-teal-500/10',
                iconBg: 'bg-emerald-500/10 text-emerald-600',
              },
              {
                icon: LayoutTemplate,
                step: '02',
                title: 'Escolha o formato',
                desc: 'Carrossel, post ou story. A IA já entende o seu público e cria o conteúdo ideal.',
                gradient: 'from-teal-500/15 to-cyan-500/10',
                iconBg: 'bg-teal-500/10 text-teal-600',
              },
              {
                icon: Download,
                step: '03',
                title: 'Edite e publique',
                desc: 'Ajuste cores, gradientes e textos de cada slide direto na tela. Baixe e publique quando quiser.',
                gradient: 'from-cyan-500/15 to-sky-500/10',
                iconBg: 'bg-cyan-500/10 text-cyan-600',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`group relative rounded-2xl border border-border bg-gradient-to-br ${item.gradient} p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* step number — subtle top right */}
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-foreground/[0.04] select-none">
                  {item.step}
                </span>

                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${item.iconBg}`}>
                  <item.icon className="h-5 w-5" />
                </div>

                <h3 className="mb-2 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── VERTICALS ── */}
      <RevealSection className="bg-card/40 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Para quem é</p>
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Feito sob medida para a área da saúde
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm text-muted-foreground">
            Mantenha a constância e amplie sua autoridade com conteúdo que atrai pacientes
          </p>

          <div className="grid gap-5 grid-cols-2 max-w-2xl mx-auto">
            {VERTICALS.map((v) => (
              <Link
                key={v.label}
                to={v.href}
                className={`group relative rounded-2xl border border-border bg-gradient-to-br ${v.color} p-7 transition-all duration-300 ${v.border} hover:-translate-y-1 hover:shadow-xl block`}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{v.label}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                <p className="rounded-xl bg-background/60 px-3 py-2.5 text-xs italic text-muted-foreground backdrop-blur-sm">{v.example}</p>
              </Link>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── EDIT HIGHLIGHT ── */}
      <RevealSection className="px-5 pb-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">O conteúdo é seu — edite como quiser</p>
            <p className="text-xs text-muted-foreground mt-0.5">Troque cores, gradientes e textos de cada slide direto na tela, antes de baixar.</p>
          </div>
        </div>
      </RevealSection>

      {/* ── FORMATS ── */}
      <RevealSection className="px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Formatos</p>
          <h2 className="mb-14 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Tudo que você precisa para o Instagram
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {FORMATS.map((f) => (
              <div key={f.label} className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{f.label}</h3>
                <p className="mb-5 text-sm text-muted-foreground">{f.desc}</p>
                <div className="space-y-1.5">
                  {f.preview.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── PRICING ── */}
      <RevealSection className="bg-card/40 px-5 py-20 sm:py-28" id="pricing">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Planos</p>
          <h2 className="mb-3 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Menos de R$1,60 por conteúdo
          </h2>
          <p className="mx-auto mb-14 max-w-md text-center text-sm text-muted-foreground">
            7 dias grátis para testar. Sem cartão de crédito. Cancele quando quiser.
          </p>

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

                <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
                  {plan.name}
                </p>

                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">R${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <p className="mb-6 text-xs text-muted-foreground">{plan.limit}</p>

                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlight ? 'cta' : 'outline'}
                  className={`w-full ${plan.highlight ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => navigate('/login')}
                >
                  {plan.highlight && <Zap className="h-4 w-4" />}
                  Testar grátis por 7 dias
                </Button>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── FINAL CTA ── */}
      <RevealSection className="px-5 py-20 sm:py-28">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
          style={{ background: 'linear-gradient(135deg, hsl(160,84%,20%), hsl(170,60%,28%))' }}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Sem cartão de crédito
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl" style={{ textWrap: 'balance' }}>
              Chega de tela em branco toda semana.
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-white/70">
              Profissionais de saúde que postam com consistência ganham mais pacientes. O ContentFlow tira do caminho a parte mais difícil: criar o conteúdo.
            </p>
            <Button
              size="xl"
              onClick={() => navigate('/login')}
              className="group bg-white text-primary hover:bg-white/90 shadow-xl"
            >
              Testar grátis por 7 dias
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </RevealSection>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ContentFlow. Todos os direitos reservados.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/para-medicos"        className="transition-colors hover:text-foreground">Para médicos</Link>
            <Link to="/para-nutricionistas" className="transition-colors hover:text-foreground">Para nutricionistas</Link>
            <Link to="/para-dentistas"      className="transition-colors hover:text-foreground">Para dentistas</Link>
            <Link to="/para-psicologos"     className="transition-colors hover:text-foreground">Para psicólogos</Link>
            <Link to="/termos"              className="transition-colors hover:text-foreground">Termos</Link>
            <Link to="/privacidade"         className="transition-colors hover:text-foreground">Privacidade</Link>
            <Link to="/contato"             className="transition-colors hover:text-foreground">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
