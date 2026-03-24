import { useEffect } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import {
  Stethoscope, Salad, Smile, Brain,
  ArrowRight, Sparkles, Check, Zap,
  Clock, Shield, TrendingUp,
  Pencil, LayoutTemplate, Download,
  Image, FileText, Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── vertical data ─────────────────────────────────────────

interface VerticalData {
  specialty: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  pageTitle: string
  metaDescription: string
  hero: { badge: string; headline: string; sub: string }
  painHeadline: string
  pains: { title: string; desc: string }[]
  examples: string[]
  cta: { headline: string; sub: string }
  color: string
  bgGradient: string
}

const VERTICAL_DATA: Record<string, VerticalData> = {
  medicos: {
    specialty: 'Medicina',
    icon: Stethoscope,
    pageTitle: 'ContentFlow para Médicos | Posts que atraem pacientes para sua agenda',
    metaDescription:
      'Conteúdo pronto para médicos que querem atrair mais pacientes. Posts, carrosséis e stories de medicina, direcionados para o tipo de paciente que você atende.',
    hero: {
      badge: 'Para médicos',
      headline: 'Posts prontos para médicos que querem atrair mais pacientes',
      sub: 'Conteúdo profissional, ético e direcionado para o tipo de paciente que você atende. Gere em minutos, publique quando quiser.',
    },
    painHeadline: 'Por que médicos perdem pacientes para quem aparece no digital',
    pains: [
      {
        title: 'Agenda vazia em alguns períodos',
        desc: 'Você sabe atender bem, mas o paciente não te encontra. Presença digital consistente resolve isso antes que a agenda fique no negativo.',
      },
      {
        title: 'Falta de autoridade digital',
        desc: 'Médico com conteúdo de qualidade no Instagram é percebido como referência antes mesmo da primeira consulta. Autoridade digital é agenda cheia.',
      },
      {
        title: 'Insegurança com conteúdo médico',
        desc: 'Medo de errar na informação paralisa. O ContentFlow cria conteúdo tecnicamente correto que você revisa em segundos antes de publicar.',
      },
    ],
    examples: [
      '"Colesterol alto: 5 sinais que seu corpo já está dando"',
      '"Hipertensão silenciosa: o que você precisa saber antes que vire problema"',
      '"Diabetes tipo 2: o que a alimentação tem a ver com isso"',
      '"Quando a dor de cabeça merece atenção imediata"',
    ],
    cta: {
      headline: 'Gere conteúdo que posiciona você como referência e atrai pacientes certos',
      sub: '7 dias grátis. Sem cartão de crédito. Cancele quando quiser.',
    },
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500/10 to-teal-500/5',
  },

  nutricionistas: {
    specialty: 'Nutrição',
    icon: Salad,
    pageTitle: 'ContentFlow para Nutricionistas | Posts que atraem pacientes',
    metaDescription:
      'Conteúdo pronto para nutricionistas que querem crescer no Instagram sem perder tempo. Posts sobre emagrecimento, estética e saúde.',
    hero: {
      badge: 'Para nutricionistas',
      headline: 'Posts que atraem pacientes para emagrecimento, estética e saúde',
      sub: 'Conteúdo pronto para nutricionistas que querem crescer no Instagram sem perder tempo criando do zero toda semana.',
    },
    painHeadline: 'Por que nutricionistas com bom conteúdo não convertem em consultas',
    pains: [
      {
        title: 'Dificuldade em gerar engajamento real',
        desc: 'Curtidas não pagam o aluguel. O problema é conteúdo que não fala diretamente com o paciente que você quer atrair. Engajamento sem direção não converte.',
      },
      {
        title: 'Concorrência alta no digital',
        desc: 'Todo nutricionista está no Instagram. A diferença está em quem tem conteúdo direcionado para o paciente certo, não em quem posta mais ou tem mais seguidores.',
      },
      {
        title: 'Conteúdo genérico não converte em consultas',
        desc: 'Receita e dica de alimentação entretêm. Conteúdo que fala direto com a dor do paciente converte. A diferença está na direção, não no volume.',
      },
    ],
    examples: [
      '"3 alimentos que sabotam a sua dieta sem você perceber"',
      '"Como montar um prato realmente equilibrado no dia a dia"',
      '"Por que você não perde peso mesmo comendo bem"',
      '"Açúcar oculto: como identificar no rótulo antes de comprar"',
    ],
    cta: {
      headline: 'Posts direcionados para o tipo de paciente que você quer atender',
      sub: '7 dias grátis para testar. Sem cartão. Sem compromisso.',
    },
    color: 'text-green-600',
    bgGradient: 'from-green-500/10 to-lime-500/5',
  },

  dentistas: {
    specialty: 'Odontologia',
    icon: Smile,
    pageTitle: 'ContentFlow para Dentistas | Conteúdo que atrai pacientes para procedimentos',
    metaDescription:
      'Conteúdo que atrai pacientes para procedimentos odontológicos. De clareamento a implantes, gere posts que convertem em consultas agendadas.',
    hero: {
      badge: 'Para dentistas',
      headline: 'Conteúdo que atrai pacientes para procedimentos odontológicos',
      sub: 'De clareamento a implantes, gere posts que educam, geram valor e convertem em consultas agendadas.',
    },
    painHeadline: 'Por que pacientes não marcam mesmo sabendo que precisam',
    pains: [
      {
        title: 'Pacientes não entendem o valor dos procedimentos',
        desc: 'Implante parece caro até você explicar bem. Conteúdo educativo que mostra o valor converte pacientes que antes nem consideravam o procedimento.',
      },
      {
        title: 'Dependência total de indicação',
        desc: 'Indicação é ótima, mas não escala. Presença digital atrai paciente novo que nunca te conheceu e chega pronto para marcar consulta.',
      },
      {
        title: 'Dificuldade em explicar procedimentos sem parecer vendedor',
        desc: 'Conteúdo que educa sobre o procedimento com clareza gera interesse natural antes de qualquer proposta de orçamento ou abordagem comercial.',
      },
    ],
    examples: [
      '"Clareamento dental: o que ninguém te conta antes de fazer"',
      '"Bruxismo: por que você range os dentes à noite sem perceber"',
      '"Implante ou prótese: qual a diferença e quando cada um vale"',
      '"Saúde bucal e saúde do coração: a conexão que poucos conhecem"',
    ],
    cta: {
      headline: 'Conteúdo que educa e gera demanda para seus procedimentos',
      sub: '7 dias grátis. Comece hoje e veja a diferença na sua agenda.',
    },
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-500/10 to-sky-500/5',
  },

  psicologos: {
    specialty: 'Psicologia',
    icon: Brain,
    pageTitle: 'ContentFlow para Psicólogos | Posts que conectam com pacientes certos',
    metaDescription:
      'Conteúdo sensível, ético e direcionado para quem precisa de terapia. Posts de psicologia que geram identificação e constroem confiança.',
    hero: {
      badge: 'Para psicólogos',
      headline: 'Posts que conectam com pacientes certos para terapia',
      sub: 'Conteúdo sensível, ético e direcionado para quem precisa do seu atendimento. Sem banalizar. Sem expor demais.',
    },
    painHeadline: 'Por que é difícil atrair pacientes certos pelo Instagram',
    pains: [
      {
        title: 'Dificuldade em se expor sem parecer invasivo',
        desc: 'Psicólogo que aparece com conteúdo sensível e ético vira referência. O ContentFlow sabe a linha entre educar e expor, entre acolher e banalizar.',
      },
      {
        title: 'Medo de banalizar o conteúdo de saúde mental',
        desc: 'O equilíbrio entre acessível e profundo é difícil de acertar sozinho. O ContentFlow cria conteúdo que educa sem simplificar demais e sem afastar quem precisa.',
      },
      {
        title: 'Dificuldade de criar conexão emocional pelo texto',
        desc: 'Saúde mental exige empatia antes de técnica. O conteúdo é feito para gerar identificação primeiro, confiança depois, e interesse em marcar sessão por consequência.',
      },
    ],
    examples: [
      '"Ansiedade não é frescura: o que acontece no seu cérebro durante uma crise"',
      '"Síndrome do impostor: por que você se sente uma fraude mesmo sendo capaz"',
      '"Limites saudáveis não são egoísmo, são autopreservação"',
      '"Como saber se é hora de buscar terapia de verdade"',
    ],
    cta: {
      headline: 'Conteúdo que gera identificação e traz pacientes que precisam de você',
      sub: '7 dias grátis. Sem cartão de crédito. Cancele quando quiser.',
    },
    color: 'text-violet-600',
    bgGradient: 'from-violet-500/10 to-purple-500/5',
  },
}

const STATS = [
  { icon: Clock,       value: '< 30s',  label: 'por conteúdo' },
  { icon: TrendingUp,  value: '3 tipos', label: 'de formato' },
  { icon: Shield,      value: '7 dias',  label: 'grátis para testar' },
  { icon: Sparkles,    value: 'IA',      label: 'especializada em saúde' },
]

const PLANS = [
  { name: 'Starter', price: 27, limit: '10 conteúdos/mês', highlight: false,
    features: ['10 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades'] },
  { name: 'Growth', price: 47, limit: '30 conteúdos/mês', highlight: true,
    features: ['30 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades', 'Histórico de conteúdo'] },
  { name: 'Pro', price: 97, limit: '100 conteúdos/mês', highlight: false,
    features: ['100 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades', 'Histórico de conteúdo'] },
]

const HOW_IT_WORKS = [
  { icon: Pencil,         step: '01', title: 'Escolha sua especialidade',         desc: 'Medicina, Nutrição, Odonto ou Psico. A linguagem e os temas já são adaptados para a sua área de forma automática.' },
  { icon: LayoutTemplate, step: '02', title: 'Defina o tipo de paciente',         desc: 'Estético, preventivo, dor, crônico ou premium. Quanto mais específico, mais certeiro o conteúdo para atrair quem você quer.' },
  { icon: Download,       step: '03', title: 'Receba posts prontos para publicar', desc: 'Carrossel, post ou story prontos em minutos. Revise, ajuste o que quiser e publique quando quiser.' },
]

const FORMATS = [
  { key: 'carousel' as const, icon: Image,      label: 'Por tipo de paciente',          desc: 'Posts para estético, dor, preventivo, crônico ou premium. Cada conteúdo calibrado para atrair quem você quer na agenda.' },
  { key: 'post'     as const, icon: FileText,   label: 'Linguagem da sua especialidade', desc: 'Medicina, Nutrição, Odonto, Psico: temas e linguagem específicos para a sua área. Nada de conteúdo genérico.' },
  { key: 'story'    as const, icon: Smartphone, label: 'Foco em agenda, não em curtidas', desc: 'Posts pensados para gerar consultas. O engajamento é consequência. O agendamento é o objetivo.' },
]

// ── component ─────────────────────────────────────────────

export default function VerticalLanding() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const slug = pathname.replace(/^\/para-/, '')
  const data = VERTICAL_DATA[slug] ?? null

  useEffect(() => {
    if (!data) return
    document.title = data.pageTitle
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = data.metaDescription
    return () => { document.title = 'ContentFlow' }
  }, [data])

  if (!data) return <Navigate to="/" replace />

  const Icon = data.icon

  return (
    <div className="min-h-screen bg-background">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/">
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
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
            <Button size="sm" onClick={() => navigate('/login')}>Começar grátis</Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className={`mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-xs font-semibold text-primary`}>
            <Icon className="h-3.5 w-3.5" />
            {data.hero.badge}
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl" style={{ textWrap: 'balance' }}>
            {data.hero.headline}
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ textWrap: 'pretty' }}>
            {data.hero.sub}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="xl" variant="cta" onClick={() => navigate('/login')} className="group shadow-lg shadow-primary/20">
              Testar grátis por 7 dias
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-xs text-muted-foreground">Sem cartão de crédito</p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-4xl px-5 py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <s.icon className="mb-0.5 h-4 w-4 text-primary/60" />
                <span className="text-xl font-bold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAIN POINTS ── */}
      <section className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Reconhece isso?</p>
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            {data.painHeadline}
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {data.pains.map((pain, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-border bg-gradient-to-br ${data.bgGradient} p-6`}
              >
                <div className={`mb-3 text-2xl font-extrabold ${data.color} opacity-20 select-none`}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{pain.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section className="bg-card/40 px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Posts reais</p>
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Exemplos de posts para {data.specialty.toLowerCase()}
          </h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">
            Posts reais gerados pelo ContentFlow. Clique em qualquer um para ter uma ideia do que você vai receber.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.examples.map((ex, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${data.bgGradient} bg-gradient-to-br`}>
                  <Sparkles className={`h-4 w-4 ${data.color}`} />
                </div>
                <p className="text-sm italic text-muted-foreground">{ex}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMATS ── */}
      <section className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Por que funciona</p>
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Conteúdo direcionado para o paciente certo
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {FORMATS.map(f => (
              <div
                key={f.key}
                className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{f.label}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-card/40 px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Como funciona</p>
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Em três passos, seu conteúdo está pronto para publicar
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {HOW_IT_WORKS.map(item => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl"
              >
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-foreground/[0.04] select-none">
                  {item.step}
                </span>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-5 py-16 sm:py-24" id="planos">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Planos</p>
          <h2 className="mb-3 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Comece a atrair pacientes hoje
          </h2>
          <p className="mx-auto mb-12 max-w-md text-center text-sm text-muted-foreground">
            7 dias grátis. Sem cartão de crédito. Cancele quando quiser.
          </p>

          <div className="grid gap-5 sm:grid-cols-3">
            {PLANS.map(plan => (
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
                  {plan.features.map(f => (
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
                  Começar grátis por 7 dias
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-5 py-16 sm:py-24">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16"
          style={{ background: 'linear-gradient(135deg, hsl(160,84%,20%), hsl(170,60%,28%))' }}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              Sem cartão de crédito
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl" style={{ textWrap: 'balance' }}>
              {data.cta.headline}
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-white/70">
              {data.cta.sub}
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
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ContentFlow. Todos os direitos reservados.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/para-medicos"       className="transition-colors hover:text-foreground">Para médicos</Link>
            <Link to="/para-nutricionistas" className="transition-colors hover:text-foreground">Para nutricionistas</Link>
            <Link to="/para-dentistas"     className="transition-colors hover:text-foreground">Para dentistas</Link>
            <Link to="/para-psicologos"    className="transition-colors hover:text-foreground">Para psicólogos</Link>
            <Link to="/termos"             className="transition-colors hover:text-foreground">Termos</Link>
            <Link to="/privacidade"        className="transition-colors hover:text-foreground">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

