import { useEffect } from 'react'
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom'
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
    pageTitle: 'ContentFlow para Médicos — Conteúdo médico para Instagram em segundos',
    metaDescription:
      'Crie posts, carrosséis e stories de medicina para o Instagram em segundos. Ideal para médicos que querem construir autoridade e atrair mais pacientes.',
    hero: {
      badge: 'Para médicos',
      headline: 'Conteúdo médico que constrói autoridade e atrai pacientes',
      sub: 'Gere posts, carrosséis e stories de saúde em menos de 30 segundos. Sem bloquear, sem perder horas criando do zero.',
    },
    pains: [
      {
        title: 'Sem tempo entre plantões',
        desc: 'Você passa o dia atendendo. Criar conteúdo para o Instagram fica sempre para amanhã — que nunca chega.',
      },
      {
        title: 'Medo de errar na informação',
        desc: 'Conteúdo médico precisa ser preciso. A IA cria textos tecnicamente corretos e acessíveis ao paciente.',
      },
      {
        title: 'Não sabe o que postar',
        desc: 'Temas populares em medicina surgem automaticamente. Você escolhe, gera e publica.',
      },
    ],
    examples: [
      '"Colesterol alto: 5 sinais que você ignora"',
      '"Hipertensão em jovens: por que está aumentando"',
      '"Diabetes tipo 2: o que a dieta tem a ver"',
      '"Quando a dor de cabeça é preocupante"',
    ],
    cta: {
      headline: 'Construa autoridade médica no Instagram',
      sub: 'Um carrossel inteiro sobre qualquer tema de saúde, pronto em 30 segundos. Grátis por 7 dias.',
    },
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500/10 to-teal-500/5',
  },

  nutricionistas: {
    specialty: 'Nutrição',
    icon: Salad,
    pageTitle: 'ContentFlow para Nutricionistas — Posts de nutrição para Instagram',
    metaDescription:
      'Crie conteúdo de nutrição para o Instagram em segundos. Posts, carrosséis e stories sobre alimentação, dietas e saúde.',
    hero: {
      badge: 'Para nutricionistas',
      headline: 'Conteúdo de nutrição que engaja e traz novos pacientes',
      sub: 'Gere posts sobre alimentação, dietas e saúde em menos de 30 segundos. Linguagem simples, informação de qualidade.',
    },
    pains: [
      {
        title: 'Criar conteúdo sobre comida todo dia cansa',
        desc: 'Mesmo amando nutrição, preencher o feed com conteúdo novo e útil toda semana exige um tempo que você não tem.',
      },
      {
        title: 'Público confunde nutricionista com influencer',
        desc: 'O ContentFlow cria conteúdo que educa — não só receitas. Posts que posicionam você como referência clínica.',
      },
      {
        title: 'Algoritmo pede constância',
        desc: 'Postar uma vez por semana não é suficiente. Com o ContentFlow você tem conteúdo para toda a semana em minutos.',
      },
    ],
    examples: [
      '"3 alimentos que sabotam sua dieta sem você saber"',
      '"Como montar um prato equilibrado de verdade"',
      '"Mitos sobre proteína que todo mundo acredita"',
      '"Açúcar oculto: onde ele aparece no rótulo"',
    ],
    cta: {
      headline: 'Construa autoridade em nutrição no Instagram',
      sub: 'Conteúdo especializado em nutrição, pronto em segundos. Grátis por 7 dias.',
    },
    color: 'text-green-600',
    bgGradient: 'from-green-500/10 to-lime-500/5',
  },

  dentistas: {
    specialty: 'Odontologia',
    icon: Smile,
    pageTitle: 'ContentFlow para Dentistas — Conteúdo odontológico para Instagram',
    metaDescription:
      'Crie posts e carrosséis de odontologia para o Instagram em segundos. Conteúdo sobre saúde bucal, clareamento e procedimentos dentais.',
    hero: {
      badge: 'Para dentistas',
      headline: 'Posts odontológicos que educam e atraem mais pacientes',
      sub: 'Gere conteúdo sobre saúde bucal, clareamento e procedimentos em menos de 30 segundos. Sem bloquear.',
    },
    pains: [
      {
        title: 'Conteúdo odontológico parece sempre igual',
        desc: 'Clareamento, canal, implante — você quer ir além do óbvio. A IA sugere temas que o paciente realmente quer ler.',
      },
      {
        title: 'Clínica cheia, agenda criativa vazia',
        desc: 'Entre atendimentos e gestão da clínica, sobra zero tempo para o Instagram. O ContentFlow faz isso em segundos.',
      },
      {
        title: 'Paciente pesquisa antes de marcar',
        desc: 'Quem aparece com conteúdo útil sobre saúde bucal é quem fica na cabeça do paciente na hora de marcar consulta.',
      },
    ],
    examples: [
      '"Clareamento dental: o que ninguém te conta"',
      '"Bruxismo: por que você range os dentes à noite"',
      '"Fio dental vs. enxaguante: qual realmente funciona"',
      '"Implante dental: quando vale a pena"',
    ],
    cta: {
      headline: 'Atraia mais pacientes com conteúdo de odontologia',
      sub: 'Posts e carrosséis sobre saúde bucal, prontos em segundos. Grátis por 7 dias.',
    },
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-500/10 to-sky-500/5',
  },

  psicologos: {
    specialty: 'Psicologia',
    icon: Brain,
    pageTitle: 'ContentFlow para Psicólogos — Conteúdo de psicologia para Instagram',
    metaDescription:
      'Crie posts e carrosséis de psicologia para o Instagram em segundos. Conteúdo sobre saúde mental, ansiedade e bem-estar emocional.',
    hero: {
      badge: 'Para psicólogos',
      headline: 'Conteúdo de psicologia que acolhe e conecta quem precisa de ajuda',
      sub: 'Gere posts sobre saúde mental, ansiedade e bem-estar em menos de 30 segundos. Linguagem acolhedora e profissional.',
    },
    pains: [
      {
        title: 'Falar de psicologia sem ser superficial é difícil',
        desc: 'Conteúdo de saúde mental precisa de cuidado. A IA cria textos empáticos, corretos e sem sensacionalismo.',
      },
      {
        title: 'Sessões, supervisão e ainda o Instagram',
        desc: 'Criar conteúdo fica sempre para o final da semana. O ContentFlow entrega em segundos o que levaria horas.',
      },
      {
        title: 'Conteúdo que reduz o estigma',
        desc: 'Posts educativos sobre saúde mental aproximam pacientes que ainda têm resistência em buscar ajuda.',
      },
    ],
    examples: [
      '"Ansiedade não é frescura: o que acontece no seu cérebro"',
      '"Síndrome do impostor: por que você se sente uma fraude"',
      '"Limites saudáveis não são egoísmo"',
      '"Como saber se é hora de buscar terapia"',
    ],
    cta: {
      headline: 'Construa presença em saúde mental no Instagram',
      sub: 'Conteúdo empático e profissional sobre psicologia, pronto em segundos. Grátis por 7 dias.',
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
  { icon: Pencil,         step: '01', title: 'Escreva uma ideia',   desc: 'Pode ser bem curta: "colesterol alto", "clareamento dental" ou "como lidar com ansiedade".' },
  { icon: LayoutTemplate, step: '02', title: 'Escolha o formato',   desc: 'Carrossel, post ou story. A IA entende a sua especialidade e cria o conteúdo ideal.' },
  { icon: Download,       step: '03', title: 'Edite e publique',    desc: 'Ajuste cores e textos direto na tela. Baixe e publique quando quiser.' },
]

const FORMATS = [
  { key: 'carousel' as const, icon: Image,       label: 'Carrossel', desc: 'Slides prontos para o feed com visual profissional' },
  { key: 'post'     as const, icon: FileText,    label: 'Post',      desc: 'Texto completo com abertura, desenvolvimento e CTA' },
  { key: 'story'    as const, icon: Smartphone,  label: 'Story',     desc: 'Roteiro para gravar com confiança e naturalidade' },
]

// ── component ─────────────────────────────────────────────

export default function VerticalLanding() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const data = slug ? VERTICAL_DATA[slug] : null

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
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">O problema</p>
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Por que {data.specialty.toLowerCase() === 'psicologia' ? 'psicólogos' : `profissionais de ${data.specialty.toLowerCase()}`} não postam com consistência
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
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Exemplos</p>
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Conteúdo criado especificamente para {data.specialty.toLowerCase()}
          </h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">
            Digite o tema. Em 30 segundos você tem carrossel, post e story prontos para publicar.
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
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Formatos</p>
          <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Tudo que você precisa para o Instagram
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
            Três passos. Conteúdo na tela.
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
            Invista no seu conteúdo
          </h2>
          <p className="mx-auto mb-12 max-w-md text-center text-sm text-muted-foreground">
            Comece com 7 dias grátis. Cancele quando quiser.
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
                  Começar agora
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

