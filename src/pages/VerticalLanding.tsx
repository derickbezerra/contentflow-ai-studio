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
    pageTitle: 'ContentFlow para Médicos | Conteúdo médico para Instagram em segundos',
    metaDescription:
      'Crie posts, carrosséis e stories de medicina para o Instagram em segundos. Ideal para médicos que querem construir autoridade e atrair mais pacientes.',
    hero: {
      badge: 'Para médicos',
      headline: 'Você está salvando vidas no plantão e perdendo pacientes no Instagram',
      sub: 'O ContentFlow gera conteúdo médico em menos de 30 segundos para você aparecer com consistência sem abrir mão de mais um minuto de descanso',
    },
    painHeadline: 'Por que médicos com tudo para compartilhar somem do Instagram',
    pains: [
      {
        title: 'Plantão não combina com feed',
        desc: 'Você sai do hospital exausto e criar conteúdo é a última coisa que quer fazer. O ContentFlow transforma qualquer tema médico em post, carrossel ou story em segundos, mesmo quando você não tem energia para pensar nisso',
      },
      {
        title: 'Errar na informação não é uma opção',
        desc: 'A IA cria conteúdo médico tecnicamente correto, em linguagem acessível ao paciente, sem sensacionalismo. Você revisa em segundos antes de publicar, com total controle sobre o que sai com o seu nome',
      },
      {
        title: 'Médico invisível perde para médico presente',
        desc: 'O paciente pesquisa no Instagram antes de marcar consulta. Quem aparece com conteúdo de qualidade é quem fica na memória e na agenda, não necessariamente quem tem mais anos de experiência',
      },
    ],
    examples: [
      '"Colesterol alto: 5 sinais que o seu corpo já está dando"',
      '"Hipertensão em jovens: por que está aumentando e o que fazer"',
      '"Diabetes tipo 2: o que a alimentação tem a ver com isso"',
      '"Quando a dor de cabeça merece atenção imediata"',
    ],
    cta: {
      headline: 'Seu próximo paciente está te procurando no Instagram agora',
      sub: 'Comece a aparecer com consistência hoje sem sacrificar mais uma hora de descanso, com 7 dias grátis e sem cartão de crédito',
    },
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500/10 to-teal-500/5',
  },

  nutricionistas: {
    specialty: 'Nutrição',
    icon: Salad,
    pageTitle: 'ContentFlow para Nutricionistas | Posts de nutrição para Instagram',
    metaDescription:
      'Crie conteúdo de nutrição para o Instagram em segundos. Posts, carrosséis e stories sobre alimentação, dietas e saúde.',
    hero: {
      badge: 'Para nutricionistas',
      headline: 'Você educa pacientes o dia todo e não sobra energia para educar o Instagram',
      sub: 'O ContentFlow transforma qualquer tema de nutrição em post, carrossel ou story em menos de 30 segundos para você manter presença digital sem virar escravo do feed',
    },
    painHeadline: 'Por que nutricionistas que amam o que fazem têm dificuldade de aparecer',
    pains: [
      {
        title: 'Criar do zero toda semana esgota até quem ama o que faz',
        desc: 'Mesmo apaixonada por nutrição, sentar na frente de uma tela em branco toda semana drena energia que você precisaria para os seus pacientes. A IA carrega esse peso e você entra só para revisar e publicar',
      },
      {
        title: 'Nutricionista que educa atrai, quem só posta receita entretém',
        desc: 'O ContentFlow cria conteúdo que posiciona você como referência clínica, não como um perfil de culinária. Posts que constroem autoridade real e fazem pacientes te procurar com intenção de mudança',
      },
      {
        title: 'Algoritmo não perdoa quem some por semanas',
        desc: 'Postar de vez em quando não funciona mais. Com o ContentFlow você tem conteúdo para a semana inteira em menos tempo do que uma consulta de retorno leva',
      },
    ],
    examples: [
      '"3 alimentos que sabotam a sua dieta sem você perceber"',
      '"Como montar um prato realmente equilibrado no dia a dia"',
      '"Mitos sobre proteína que a maioria ainda acredita"',
      '"Açúcar oculto: como identificar no rótulo antes de comprar"',
    ],
    cta: {
      headline: 'Seu próximo paciente vai te encontrar porque você continua aqui',
      sub: 'Teste grátis por 7 dias e veja quanto tempo você recupera sem abrir mão da presença digital que traz pacientes toda semana',
    },
    color: 'text-green-600',
    bgGradient: 'from-green-500/10 to-lime-500/5',
  },

  dentistas: {
    specialty: 'Odontologia',
    icon: Smile,
    pageTitle: 'ContentFlow para Dentistas | Conteúdo odontológico para Instagram',
    metaDescription:
      'Crie posts e carrosséis de odontologia para o Instagram em segundos. Conteúdo sobre saúde bucal, clareamento e procedimentos dentais.',
    hero: {
      badge: 'Para dentistas',
      headline: 'O paciente decide onde vai cuidar do sorriso antes de sentir dor, e escolhe quem aparece',
      sub: 'O ContentFlow gera conteúdo de odontologia em segundos para você estar presente quando o paciente estiver pesquisando, muito antes de precisar marcar consulta',
    },
    painHeadline: 'Por que dentistas com agenda cheia continuam invisíveis no digital',
    pains: [
      {
        title: 'Clareamento, canal, implante. Sempre os mesmos temas',
        desc: 'Você quer ir além do óbvio mas não sabe por onde começar. A IA sugere ângulos que o paciente realmente quer ler e que provavelmente nenhum concorrente da sua cidade está postando ainda',
      },
      {
        title: 'Agenda cheia por dentro, invisível por fora',
        desc: 'Você atende o dia todo, cuida da clínica e ainda deveria criar conteúdo? O ContentFlow entrega em 30 segundos o que levaria horas, para você aparecer no digital sem parar de atender',
      },
      {
        title: 'Quem não é visto não é lembrado na hora de indicar',
        desc: 'A consulta é marcada por quem vem à cabeça primeiro. Conteúdo consistente te coloca nesse lugar antes de qualquer busca no Google ou pergunta em grupo de WhatsApp',
      },
    ],
    examples: [
      '"Clareamento dental: o que ninguém te conta antes de fazer"',
      '"Bruxismo: por que você range os dentes à noite sem perceber"',
      '"Fio dental ou enxaguante: o que realmente faz diferença"',
      '"Implante dental: quando vale a pena e quando não vale"',
    ],
    cta: {
      headline: 'Seja o dentista que o paciente já conhece antes de entrar no consultório',
      sub: '7 dias grátis para criar conteúdo de odontologia que educa, aproxima e convence sem precisar sentar na frente de uma tela em branco',
    },
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-500/10 to-sky-500/5',
  },

  psicologos: {
    specialty: 'Psicologia',
    icon: Brain,
    pageTitle: 'ContentFlow para Psicólogos | Conteúdo de psicologia para Instagram',
    metaDescription:
      'Crie posts e carrosséis de psicologia para o Instagram em segundos. Conteúdo sobre saúde mental, ansiedade e bem-estar emocional.',
    hero: {
      badge: 'Para psicólogos',
      headline: 'Você ajuda pessoas a se encontrarem e não sabe como aparecer no Instagram sem parecer raso',
      sub: 'O ContentFlow cria conteúdo empático sobre saúde mental em segundos para você alcançar quem precisa de ajuda antes mesmo que saibam que precisam de você',
    },
    painHeadline: 'Por que psicólogos que mais têm a dizer são os que menos aparecem',
    pains: [
      {
        title: 'Saúde mental no Instagram exige sensibilidade que a maioria erra',
        desc: 'Nem todo conteúdo sobre psicologia é conteúdo de psicólogo. A IA cria posts empáticos, tecnicamente corretos e acolhedores, sem sensacionalismo e sem simplificar o que merece profundidade',
      },
      {
        title: 'Sessão, supervisão, estudo e ainda o Instagram',
        desc: 'A vida do psicólogo já é cheia por dentro. Criar conteúdo do zero fica sempre para o final de semana que nunca chega. O ContentFlow entrega em segundos o que ficaria se acumulando por dias',
      },
      {
        title: 'Quem te lê antes da crise é quem te chama quando precisa',
        desc: 'Conteúdo sobre ansiedade, limites e saúde mental constrói confiança com quem ainda não está pronto para marcar sessão, mas vai estar. E quando estiver, vai lembrar de você',
      },
    ],
    examples: [
      '"Ansiedade não é frescura: o que acontece no seu cérebro durante uma crise"',
      '"Síndrome do impostor: por que você se sente uma fraude mesmo sendo capaz"',
      '"Limites saudáveis não são egoísmo, são autopreservação"',
      '"Como saber se é hora de buscar terapia de verdade"',
    ],
    cta: {
      headline: 'Alcance quem precisa de você antes que saibam que precisam',
      sub: '7 dias grátis para criar conteúdo de psicologia que reduz o estigma, aproxima pacientes resistentes e faz sua presença digital trabalhar enquanto você cuida de quem já está com você',
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
  { icon: Pencil,         step: '01', title: 'Escreva uma ideia',   desc: 'Uma palavra ou frase simples já é suficiente: "colesterol alto", "clareamento dental" ou "como lidar com ansiedade" são suficientes para a IA criar algo completo' },
  { icon: LayoutTemplate, step: '02', title: 'Escolha o formato',   desc: 'A IA entende a sua especialidade e cria a estrutura, o gancho e a linguagem certa para carrossel, post ou story' },
  { icon: Download,       step: '03', title: 'Edite e publique',    desc: 'Tudo editável direto na tela antes de baixar: cores, textos e gradientes de cada slide sem precisar de Canva ou designer' },
]

const FORMATS = [
  { key: 'carousel' as const, icon: Image,       label: 'Carrossel', desc: 'Slides que as pessoas salvam e compartilham, gerados com hook, conteúdo e CTA já incluídos' },
  { key: 'post'     as const, icon: FileText,    label: 'Post',      desc: 'Uma abertura que para o scroll, um texto que educa e uma chamada para agir, tudo pronto para copiar e colar' },
  { key: 'story'    as const, icon: Smartphone,  label: 'Story',     desc: 'Um roteiro de teleprompter para você falar com confiança na câmera sem travar nem decorar' },
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
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">O problema</p>
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
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-primary">Exemplos</p>
          <h2 className="mb-4 text-center text-2xl font-bold text-foreground sm:text-3xl" style={{ textWrap: 'balance' }}>
            Veja o que a IA cria para {data.specialty.toLowerCase()} em segundos
          </h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">
            Digite qualquer tema e em 30 segundos você tem carrossel, post e story prontos para publicar com a sua identidade
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
            Três formatos que dominam o feed e constroem autoridade
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

