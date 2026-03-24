import { useState } from 'react'
import { X, LayoutGrid, FileText, Mic } from 'lucide-react'

type ContentType = 'carousel' | 'post' | 'story'
type Vertical = 'doctor' | 'nutritionist' | 'dentist' | 'psychologist'

interface Template {
  name: string
  topic: string
  contentType: ContentType
  description: string
}

interface Props {
  activeVertical: Vertical
  onSelect: (topic: string, contentType: ContentType) => void
  onClose: () => void
}

// ── template library ──────────────────────────────────────

const TEMPLATES: Record<Vertical, Template[]> = {
  doctor: [
    { name: '5 sinais de alerta',        topic: 'sinais de alerta para infarto e AVC',                            contentType: 'carousel', description: 'Lista de sintomas que não devem ser ignorados' },
    { name: 'Mito vs verdade',           topic: 'mitos comuns sobre colesterol e doença cardiovascular',          contentType: 'carousel', description: 'Quebre 3 crenças populares com ciência' },
    { name: 'Exames preventivos',        topic: 'exames que todo adulto deve fazer por faixa etária',             contentType: 'carousel', description: 'Checklist de saúde para diferentes idades' },
    { name: 'Quando procurar médico',    topic: 'quando devo ir ao pronto-socorro vs consulta de rotina',         contentType: 'post',     description: 'Orienta pacientes sobre urgência x rotina' },
    { name: 'Hábito x doença crônica',   topic: 'como a alimentação e o sedentarismo causam hipertensão',         contentType: 'carousel', description: 'Conecta comportamento e doença de forma acessível' },
    { name: 'Desmistificando remédios',  topic: 'antibiótico: quando tomar e quando não tomar',                   contentType: 'post',     description: 'Combate automedicação com informação prática' },
    { name: 'O que acontece no corpo',   topic: 'o que acontece no seu corpo quando você fica sem dormir',        contentType: 'carousel', description: 'Explica ciência em linguagem visual e simples' },
    { name: 'Saúde masculina',           topic: 'por que homens evitam médico e o que isso custa à saúde',        contentType: 'post',     description: 'Aborda resistência cultural ao cuidado' },
    { name: 'Prevenção de câncer',       topic: 'hábitos que reduzem o risco de câncer comprovados pela ciência', contentType: 'carousel', description: 'Prevenção primária com base em evidências' },
    { name: 'Pergunta do paciente',      topic: 'a pergunta que meus pacientes mais me fazem sobre pressão alta', contentType: 'post',     description: 'Formato de autoridade pessoal e proximidade' },
    { name: 'Saúde mental do paciente',  topic: 'como estresse crônico afeta o sistema imunológico',              contentType: 'carousel', description: 'Liga saúde mental e física de forma acessível' },
    { name: 'Roteiro de consulta',       topic: 'o que você precisa contar ao médico que quase sempre esquece',   contentType: 'story',    description: 'Prepara o paciente para a consulta' },
  ],

  nutritionist: [
    { name: 'Mito alimentar',            topic: 'mitos sobre emagrecimento que travam seu progresso',             contentType: 'carousel', description: 'Quebre crenças que sabotam os pacientes' },
    { name: 'Como montar o prato',       topic: 'como montar um prato equilibrado sem contar calorias',           contentType: 'carousel', description: 'Método visual e prático para alimentação' },
    { name: 'Leitura de rótulo',         topic: 'como ler o rótulo nutricional e não ser enganado',               contentType: 'carousel', description: 'Ensina o paciente a comprar com inteligência' },
    { name: 'Substitutos saudáveis',     topic: 'substituições simples que melhoram sua alimentação hoje',        contentType: 'carousel', description: 'Trocas práticas para o dia a dia' },
    { name: 'Dieta restritiva falha',    topic: 'por que dietas restritivas não funcionam a longo prazo',         contentType: 'post',     description: 'Posiciona você contra o efeito sanfona' },
    { name: 'Pré e pós treino',          topic: 'o que comer antes e depois do treino para ter resultado',        contentType: 'carousel', description: 'Conteúdo de alta demanda para público ativo' },
    { name: 'Saúde intestinal',          topic: 'como cuidar da microbiota intestinal com alimentação',           contentType: 'carousel', description: 'Gut health — um dos temas mais buscados' },
    { name: 'Suplementos',              topic: 'quem realmente precisa tomar suplementos alimentares',           contentType: 'post',     description: 'Desmistifica a indústria de suplementos' },
    { name: 'Hidratação',               topic: 'sinais de que seu corpo está desidratado sem você saber',        contentType: 'post',     description: 'Conteúdo simples de alto engajamento' },
    { name: 'Planejamento alimentar',   topic: 'como organizar a alimentação da semana em 30 minutos',           contentType: 'carousel', description: 'Solução prática para a correria do dia a dia' },
    { name: 'Açúcar oculto',            topic: 'onde o açúcar se esconde nos alimentos que parecem saudáveis',  contentType: 'carousel', description: 'Alerta que gera salvamentos e compartilhamentos' },
    { name: 'Café da manhã',            topic: 'o que comer no café da manhã para não sentir fome até o almoço', contentType: 'story',    description: 'Formato rápido para dica prática' },
  ],

  dentist: [
    { name: 'Rotina de higiene bucal',   topic: 'a rotina de escovação certa que a maioria faz errado',           contentType: 'carousel', description: 'Revisita o básico com autoridade e técnica' },
    { name: 'Clareamento dental',        topic: 'clareamento dental: tipos, resultados e o que ninguém te conta', contentType: 'carousel', description: 'Um dos temas mais pesquisados em odontologia' },
    { name: 'Mitos odontológicos',       topic: 'mitos sobre dentes que você aprendeu errado',                    contentType: 'carousel', description: 'Mito vs verdade para saúde bucal' },
    { name: 'Sensibilidade dentária',    topic: 'por que seus dentes doem ao tomar frio e como tratar',           contentType: 'post',     description: 'Problema universal com alta taxa de busca' },
    { name: 'Bruxismo',                 topic: 'bruxismo: sinais de que você range os dentes e nem sabe',        contentType: 'post',     description: 'Conecta sintoma silencioso à solução' },
    { name: 'Gengiva saudável',         topic: 'sinais de que sua gengiva precisa de atenção urgente',           contentType: 'carousel', description: 'Prevenção de periodontite em linguagem simples' },
    { name: 'Implante dental',          topic: 'implante dental: quando vale e o que esperar do tratamento',     contentType: 'carousel', description: 'Explica o processo para quem tem medo ou dúvida' },
    { name: 'Halitose',                 topic: 'mau hálito: causas reais e como resolver de vez',                contentType: 'post',     description: 'Assunto íntimo com alto volume de busca' },
    { name: 'Criança no dentista',      topic: 'quando e como levar seu filho ao dentista pela primeira vez',    contentType: 'carousel', description: 'Conteúdo que atinge pais e responsáveis' },
    { name: 'Fio dental vs jato',       topic: 'fio dental ou irrigador oral: qual realmente limpa melhor',          contentType: 'post',     description: 'Comparativo prático de alta curiosidade' },
    { name: 'Alinhadores invisíveis',   topic: 'alinhadores transparentes: como funciona e para quem é indicado', contentType: 'carousel', description: 'Alternativa moderna ao aparelho tradicional' },
    { name: 'Check-up bucal',           topic: 'com que frequência ir ao dentista mesmo sem dor',                contentType: 'story',    description: 'Desmistifica a consulta preventiva' },
  ],

  psychologist: [
    { name: 'Ansiedade no corpo',        topic: 'como a ansiedade se manifesta fisicamente sem você perceber',    contentType: 'carousel', description: 'Conecta sintomas físicos à saúde emocional' },
    { name: 'Limites saudáveis',         topic: 'como colocar limites sem se sentir culpado',                    contentType: 'post',     description: 'Um dos temas mais salvos em psicologia' },
    { name: 'Burnout',                   topic: 'sinais de esgotamento emocional que costumamos ignorar',         contentType: 'carousel', description: 'Alta identificação e taxa de compartilhamento' },
    { name: 'Terapia desmistificada',    topic: 'o que de fato acontece em uma sessão de terapia',               contentType: 'carousel', description: 'Reduz barreira de entrada para quem nunca foi' },
    { name: 'Síndrome do impostor',      topic: 'síndrome do impostor: por que você sente que não merece',       contentType: 'post',     description: 'Alto engajamento em público de alta performance' },
    { name: 'Padrões relacionais',       topic: 'padrões emocionais que se repetem nos seus relacionamentos',    contentType: 'carousel', description: 'Autoconhecimento aplicado a vínculos afetivos' },
    { name: 'Sono e saúde mental',       topic: 'como a privação de sono afeta seu humor e suas decisões',       contentType: 'carousel', description: 'Tema científico com impacto no cotidiano' },
    { name: 'Gatilhos emocionais',       topic: 'o que são gatilhos emocionais e como aprender a identificá-los', contentType: 'carousel', description: 'Ferramenta de autoconhecimento popular' },
    { name: 'Comunicação assertiva',     topic: 'como falar o que você pensa sem machucar ou ceder',             contentType: 'post',     description: 'Habilidade muito buscada por adultos' },
    { name: 'Meditação vs terapia',      topic: 'meditação substitui terapia? O que cada uma faz',               contentType: 'post',     description: 'Dúvida comum que gera debate saudável' },
    { name: 'Criança e emoções',         topic: 'como ajudar crianças a nomear e expressar o que sentem',        contentType: 'carousel', description: 'Atinge pais preocupados com saúde emocional' },
    { name: 'Autocuidado real',          topic: 'autocuidado além de banho quente: o que realmente restaura',    contentType: 'story',    description: 'Reconstrói o conceito de forma autêntica' },
  ],
}

const VERTICAL_LABELS: Record<Vertical, string> = {
  doctor: 'Medicina',
  nutritionist: 'Nutrição',
  dentist: 'Odontologia',
  psychologist: 'Psicologia',
}

const VERTICALS = Object.keys(VERTICAL_LABELS) as Vertical[]

const TYPE_ICON: Record<ContentType, React.ReactNode> = {
  carousel: <LayoutGrid className="h-3 w-3" />,
  post:     <FileText   className="h-3 w-3" />,
  story:    <Mic        className="h-3 w-3" />,
}

const TYPE_LABEL: Record<ContentType, string> = {
  carousel: 'Carrossel',
  post:     'Post',
  story:    'Story',
}

const TYPE_COLOR: Record<ContentType, string> = {
  carousel: 'bg-primary/10 text-primary',
  post:     'bg-blue-100 text-blue-700',
  story:    'bg-purple-100 text-purple-700',
}

// ── component ─────────────────────────────────────────────

export default function TemplatesModal({ activeVertical, onSelect, onClose }: Props) {
  const [tab, setTab] = useState<Vertical>(activeVertical)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:max-w-2xl sm:rounded-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Templates</h2>
            <p className="text-xs text-muted-foreground">Escolha uma estrutura para começar mais rápido</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Specialty tabs */}
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-4 py-2.5">
          {VERTICALS.map(v => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                tab === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {VERTICAL_LABELS[v]}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TEMPLATES[tab].map((t, i) => (
              <button
                key={i}
                onClick={() => { onSelect(t.topic, t.contentType); onClose() }}
                className="group rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm active:scale-[0.99]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t.name}
                  </p>
                  <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLOR[t.contentType]}`}>
                    {TYPE_ICON[t.contentType]}
                    {TYPE_LABEL[t.contentType]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
