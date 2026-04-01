import { useEffect, lazy, Suspense } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
const VerticalHeroDemoPlayer = lazy(() =>
  import('@/components/VerticalHeroDemoPlayer').then(m => ({ default: m.VerticalHeroDemoPlayer }))
)
import {
  Stethoscope, Salad, Smile, Brain,
  ArrowRight, Sparkles, Check, Zap,
  Clock, Shield, TrendingUp,
  Pencil, LayoutTemplate, Download,
  Image, FileText, Smartphone,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const BASE_URL = 'https://www.flowcontent.com.br'

interface VerticalData {
  slug: string
  specialty: string
  council: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  pageTitle: string
  metaDescription: string
  keywords: string
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
    slug: 'medicos',
    specialty: 'Medicina',
    council: 'CFM',
    icon: Stethoscope,
    pageTitle: 'ContentFlow para Médicos | Posts que atraem pacientes para sua agenda',
    metaDescription: 'Gere conteúdo para Instagram validado pelo CFM em segundos. Posts, carrosséis e stories de medicina, direcionados para o tipo de paciente que você quer na agenda.',
    keywords: 'conteúdo para médicos instagram, marketing médico, posts para médicos, marketing médico CFM, conteúdo médico instagram',
    hero: {
      badge: 'Para médicos',
      headline: 'Posts prontos para médicos que querem atrair mais pacientes',
      sub: 'Conteúdo profissional, ético e direcionado para o tipo de paciente que você atende. Gere em segundos, publique quando quiser.',
    },
    painHeadline: 'O que trava médicos no Instagram',
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
        title: 'Insegurança com as normas do CFM',
        desc: 'Medo de postar algo que viole o Código de Ética Médica paralisa. O ContentFlow gera conteúdo já validado pelo CFM para você publicar com segurança.',
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
    slug: 'nutricionistas',
    specialty: 'Nutrição',
    council: 'CFN',
    icon: Salad,
    pageTitle: 'ContentFlow para Nutricionistas | Posts que atraem pacientes',
    metaDescription: 'Gere conteúdo para Instagram validado pelo CFN em segundos. Posts de nutrição sobre emagrecimento, estética e saúde, direcionados para o paciente certo.',
    keywords: 'conteúdo para nutricionistas instagram, marketing nutricionista, posts para nutricionistas, marketing nutrição CFN, conteúdo nutrição instagram',
    hero: {
      badge: 'Para nutricionistas',
      headline: 'Posts que atraem pacientes para emagrecimento, estética e saúde',
      sub: 'Conteúdo pronto para nutricionistas que querem crescer no Instagram sem criar do zero toda semana. Validado pelo CFN antes de publicar.',
    },
    painHeadline: 'O que trava nutricionistas no Instagram',
    pains: [
      {
        title: 'Conteúdo genérico não converte',
        desc: 'Receita e dica de alimentação entretêm. Conteúdo que fala direto com a dor do paciente converte em consulta. A diferença está na direção, não no volume.',
      },
      {
        title: 'Concorrência alta no digital',
        desc: 'Todo nutricionista está no Instagram. A diferença está em quem tem conteúdo direcionado para o paciente certo, não em quem posta mais.',
      },
      {
        title: 'Insegurança com as normas do CFN',
        desc: 'Termos como "detox" e "alimento que queima gordura" podem violar o Código de Ética. O ContentFlow gera conteúdo dentro das normas do CFN.',
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
    slug: 'dentistas',
    specialty: 'Odontologia',
    council: 'CFO',
    icon: Smile,
    pageTitle: 'ContentFlow para Dentistas | Conteúdo que atrai pacientes para procedimentos',
    metaDescription: 'Gere conteúdo para Instagram validado pelo CFO em segundos. Posts de odontologia que educam e convertem em consultas agendadas.',
    keywords: 'conteúdo para dentistas instagram, marketing odontológico, posts para dentistas, marketing dentista CFO, conteúdo odontologia instagram',
    hero: {
      badge: 'Para dentistas',
      headline: 'Conteúdo que atrai pacientes para procedimentos odontológicos',
      sub: 'De clareamento a implantes, gere posts que educam, geram valor e convertem em consultas agendadas. Validado pelo CFO.',
    },
    painHeadline: 'O que trava dentistas no Instagram',
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
        title: 'Medo de violar as normas do CFO',
        desc: 'Fotos antes/depois e garantias de resultado são proibidas pelo CFO. O ContentFlow gera conteúdo dentro das normas para você publicar sem risco.',
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
    slug: 'psicologos',
    specialty: 'Psicologia',
    council: 'CFP',
    icon: Brain,
    pageTitle: 'ContentFlow para Psicólogos | Posts que conectam com pacientes certos',
    metaDescription: 'Gere conteúdo para Instagram validado pelo CFP em segundos. Posts de psicologia sensíveis, éticos e que geram identificação com quem precisa de terapia.',
    keywords: 'conteúdo para psicólogos instagram, marketing psicólogo, posts para psicólogos, marketing psicologia CFP, conteúdo saúde mental instagram',
    hero: {
      badge: 'Para psicólogos',
      headline: 'Posts que conectam com pacientes certos para terapia',
      sub: 'Conteúdo sensível, ético e direcionado para quem precisa do seu atendimento. Sem banalizar. Sem expor demais. Validado pelo CFP.',
    },
    painHeadline: 'O que trava psicólogos no Instagram',
    pains: [
      {
        title: 'Dificuldade em se expor sem parecer invasivo',
        desc: 'Psicólogo que aparece com conteúdo sensível e ético vira referência. O ContentFlow sabe a linha entre educar e expor, entre acolher e banalizar.',
      },
      {
        title: 'Medo de banalizar saúde mental',
        desc: 'O equilíbrio entre acessível e profundo é difícil de acertar sozinho. O ContentFlow cria conteúdo que educa sem simplificar demais.',
      },
      {
        title: 'Insegurança com as normas do CFP',
        desc: 'Garantir resultado terapêutico ou diagnosticar o leitor viola o código de ética. O ContentFlow gera conteúdo dentro das normas do CFP.',
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
  {
    name: 'Starter',
    price: 47,
    limit: '10 conteúdos/mês',
    highlight: false,
    features: ['10 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades', 'Validação ética (CFM/CFO/CFP/CFN)'],
  },
  {
    name: 'Growth',
    price: 97,
    limit: '30 conteúdos/mês',
    highlight: true,
    features: ['30 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades', 'Validação ética (CFM/CFO/CFP/CFN)', 'Perfil de marca personalizado', 'Histórico de conteúdo'],
  },
  {
    name: 'Pro',
    price: 127,
    limit: '50 conteúdos/mês',
    highlight: false,
    features: ['50 conteúdos por mês', 'Carrossel, Post e Story', 'Todas as especialidades', 'Analisador de Compliance (CFM/CFO/CFP/CFN)', 'Perfil de marca personalizado', 'Histórico de conteúdo'],
  },
]

const HOW_IT_WORKS = [
  { icon: Pencil,         step: '01', title: 'Escolha sua especialidade',          desc: 'Medicina, Nutrição, Odonto ou Psico. A linguagem e os temas já são adaptados para a sua área de forma automática.' },
  { icon: LayoutTemplate, step: '02', title: 'Defina o tipo de paciente',          desc: 'Estético, preventivo, dor, crônico ou premium. Quanto mais específico, mais certeiro o conteúdo.' },
  { icon: Download,       step: '03', title: 'Receba posts prontos para publicar', desc: 'Carrossel, post ou story prontos em segundos. Revise, ajuste o que quiser e publique.' },
]

const FORMATS = [
  { key: 'carousel', icon: Image,      label: 'Por tipo de paciente',           desc: 'Posts para estético, dor, preventivo, crônico ou premium. Cada conteúdo calibrado para atrair quem você quer na agenda.' },
  { key: 'post',     icon: FileText,   label: 'Linguagem da sua especialidade',  desc: 'Temas e linguagem específicos para a sua área. Nada de conteúdo genérico que serve para qualquer profissional.' },
  { key: 'story',    icon: Smartphone, label: 'Foco em agenda, não em curtidas', desc: 'Posts pensados para gerar consultas. O engajamento é consequência. O agendamento é o objetivo.' },
]

export default function VerticalLanding() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const slug = pathname.replace(/^\/para-/, '')
  const data = VERTICAL_DATA[slug] ?? null

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  useEffect(() => {
    if (!data) return
    const canonical = `${BASE_URL}/para-${data.slug}`

    // Title and description
    document.title = data.pageTitle
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc) }
    metaDesc.content = data.metaDescription

    // Keywords
    let metaKw = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null
    if (!metaKw) { metaKw = document.createElement('meta'); metaKw.name = 'keywords'; document.head.appendChild(metaKw) }
    metaKw.content = data.keywords

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!linkCanonical) { linkCanonical = document.createElement('link'); linkCanonical.rel = 'canonical'; document.head.appendChild(linkCanonical) }
    linkCanonical.href = canonical

    // Open Graph
    const ogTags: Record<string, string> = {
      'og:title': data.pageTitle,
      'og:description': data.metaDescription,
      'og:url': canonical,
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': data.pageTitle,
      'twitter:description': data.metaDescription,
    }
    Object.entries(ogTags).forEach(([prop, content]) => {
      const attr = prop.startsWith('twitter:') ? 'name' : 'property'
      let el = document.querySelector(`meta[${attr}="${prop}"]`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, prop); document.head.appendChild(el) }
      el.content = content
    })

    // JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.pageTitle,
      description: data.metaDescription,
      url: canonical,
      publisher: {
        '@type': 'Organization',
        name: 'ContentFlow',
        url: BASE_URL,
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.svg` },
      },
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'ContentFlow',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'BRL',
          lowPrice: '47',
          highPrice: '127',
        },
        description: `Gerador de conteúdo para Instagram para ${data.specialty}. Posts, carrosséis e stories validados pelo ${data.council}.`,
      },
    }
    let scriptLd = document.querySelector('script[data-vertical-ld]') as HTMLScriptElement | null
    if (!scriptLd) { scriptLd = document.createElement('script'); scriptLd.type = 'application/ld+json'; scriptLd.setAttribute('data-vertical-ld', '1'); document.head.appendChild(scriptLd) }
    scriptLd.textContent = JSON.stringify(jsonLd)

    return () => {
      document.title = 'ContentFlow'
      linkCanonical?.remove()
      scriptLd?.remove()
      metaKw?.remove()
    }
  }, [data])

  if (!data) return <Navigate to="/" replace />

  const Icon = data.icon

  return (
    <div className="min-h-screen bg-background">

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link to="/" aria-label="ContentFlow">
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

      {/* HERO */}
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:pt-20">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-xs font-semibold text-primary">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {data.hero.badge}
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
            {data.hero.headline}
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ textWrap: 'pretty' } as React.CSSProperties}>
            {data.hero.sub}
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="xl" variant="cta" onClick={() => navigate('/login')} className="group shadow-lg shadow-primary/20">
              Testar grátis por 7 dias
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
            <p className="text-xs text-muted-foreground">Sem cartão de crédito</p>
          </div>

          {/* Remotion demo específico da especialidade */}
          <div className="mx-auto mt-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-primary/10">
            <Suspense fallback={<div className="aspect-video w-full rounded-2xl bg-[#0a1628]" />}>
              <div style={{ aspectRatio: "720/420" }}>
                <VerticalHeroDemoPlayer vertical={slug} />
              </div>
            </Suspense>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-4xl px-5 py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <s.icon className="mb-0.5 h-4 w-4 text-primary/60" aria-hidden="true" />
                <span className="text-xl font-bold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPLIANCE BADGE */}
      <div className="border-b border-border/40 bg-primary/[0.03] px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-center text-sm text-muted-foreground">
            Todo conteúdo gerado é validado automaticamente pelo <strong className="text-foreground">{data.council}</strong> antes de você publicar. Publique sem medo de punição do conselho.
          </p>
        </div>
      </div>

      {/* PAIN POINTS */}
      <section className="px-5 py-10 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Por que isso acontece</p>
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
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

      {/* PRICING */}
      <section className="px-5 py-10 sm:py-16" id="planos">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Planos</p>
          <h2 className="mb-3 text-center text-2xl font-bold text-foreground sm:text-3xl">
            Comece a atrair pacientes hoje
          </h2>
          <p className="mx-auto mb-10 max-w-md text-center text-sm text-muted-foreground">
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
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="mb-6 text-xs text-muted-foreground">{plan.limit}</p>
                <ul className="mb-7 flex-1 space-y-2.5">
                  {plan.features.map(f => {
                    const isCompliance = f.startsWith('Analisador de Compliance')
                    return (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        {isCompliance
                          ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          : <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                        }
                        <span className={isCompliance ? 'font-semibold text-primary' : ''}>{f}</span>
                      </li>
                    )
                  })}
                </ul>
                <Button
                  variant={plan.highlight ? 'cta' : 'outline'}
                  className={`w-full ${plan.highlight ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => navigate('/login')}
                >
                  {plan.highlight && <Zap className="h-4 w-4" aria-hidden="true" />}
                  Começar grátis por 7 dias
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-10 sm:py-16">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-16"
          style={{ background: 'linear-gradient(135deg, hsl(160,84%,20%), hsl(170,60%,28%))' }}
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Sem cartão de crédito
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
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
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
          </div>
        </div>
      </footer>
    </div>
  )
}
