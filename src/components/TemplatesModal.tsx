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

// ── template library (24 por especialidade) ───────────────

const TEMPLATES: Record<Vertical, Template[]> = {
  doctor: [
    { name: '5 sinais de alerta',        topic: 'sinais de alerta para infarto e AVC',                              contentType: 'carousel', description: 'Lista de sintomas que não devem ser ignorados' },
    { name: 'Mito vs verdade',           topic: 'mitos comuns sobre colesterol e doença cardiovascular',            contentType: 'carousel', description: 'Quebre 3 crenças populares com ciência' },
    { name: 'Exames preventivos',        topic: 'exames que todo adulto deve fazer por faixa etária',               contentType: 'carousel', description: 'Checklist de saúde para diferentes idades' },
    { name: 'Quando procurar médico',    topic: 'quando devo ir ao pronto-socorro vs consulta de rotina',           contentType: 'post',     description: 'Orienta pacientes sobre urgência x rotina' },
    { name: 'Hábito x doença crônica',   topic: 'como a alimentação e o sedentarismo causam hipertensão',           contentType: 'carousel', description: 'Conecta comportamento e doença de forma acessível' },
    { name: 'Desmistificando remédios',  topic: 'antibiótico: quando tomar e quando não tomar',                     contentType: 'post',     description: 'Combate automedicação com informação prática' },
    { name: 'O que acontece no corpo',   topic: 'o que acontece no seu corpo quando você fica sem dormir',          contentType: 'carousel', description: 'Explica ciência em linguagem visual e simples' },
    { name: 'Saúde masculina',           topic: 'por que homens evitam médico e o que isso custa à saúde',          contentType: 'post',     description: 'Aborda resistência cultural ao cuidado' },
    { name: 'Prevenção de câncer',       topic: 'hábitos que reduzem o risco de câncer comprovados pela ciência',   contentType: 'carousel', description: 'Prevenção primária com base em evidências' },
    { name: 'Pergunta do paciente',      topic: 'a pergunta que meus pacientes mais me fazem sobre pressão alta',   contentType: 'post',     description: 'Formato de autoridade pessoal e proximidade' },
    { name: 'Saúde mental do paciente',  topic: 'como estresse crônico afeta o sistema imunológico',                contentType: 'carousel', description: 'Liga saúde mental e física de forma acessível' },
    { name: 'Roteiro de consulta',       topic: 'o que você precisa contar ao médico que quase sempre esquece',     contentType: 'story',    description: 'Prepara o paciente para a consulta' },
    { name: 'Vacinação adulto',          topic: 'vacinas que adultos precisam tomar e quase ninguém sabe',          contentType: 'carousel', description: 'Quebra o mito de que vacina é só pra criança' },
    { name: 'Diabetes silenciosa',       topic: 'sinais de que sua glicemia está alta sem você perceber',           contentType: 'carousel', description: 'Diabetes tipo 2, início silencioso. Alerta precoce' },
    { name: 'Hipertensão em jovens',     topic: 'pressão alta em jovens: causas e o que fazer',                    contentType: 'post',     description: 'Problema crescente com pouca percepção de risco' },
    { name: 'Câncer de pele',           topic: 'como identificar pintas suspeitas e quando consultar um médico',   contentType: 'carousel', description: 'Autoexame acessível com alta taxa de engajamento' },
    { name: 'Saúde do idoso',           topic: 'cuidados essenciais para manter a saúde após os 60 anos',         contentType: 'carousel', description: 'Conteúdo que atinge filhos cuidadores e idosos' },
    { name: 'Burnout médico',           topic: 'esgotamento no trabalho: como o burnout afeta profissionais de saúde', contentType: 'post',  description: 'Humaniza o profissional e gera identificação' },
    { name: 'Relação médico-paciente',  topic: 'o que um bom médico faz que vai além do diagnóstico',              contentType: 'post',     description: 'Posiciona o profissional com autoridade e empatia' },
    { name: 'Exames laboratoriais',     topic: 'como ler seus exames de sangue antes de ir ao médico',             contentType: 'carousel', description: 'Educa o paciente e gera muitos salvamentos' },
    { name: 'Gripe vs COVID',           topic: 'como diferenciar gripe, resfriado e COVID sem entrar em pânico',   contentType: 'carousel', description: 'Evergreen de altíssima busca nos meses frios' },
    { name: 'Dor crônica',             topic: 'por que sua dor persiste mesmo sem lesão aparente',                 contentType: 'post',     description: 'Explica dor crônica em linguagem acessível' },
    { name: 'Saúde da mulher',         topic: 'exames ginecológicos que toda mulher deve fazer por idade',         contentType: 'carousel', description: 'Checklist de prevenção com alta taxa de salvamento' },
    { name: 'Síndrome metabólica',     topic: 'o conjunto de fatores que triplica o risco cardíaco',              contentType: 'carousel', description: 'Agrupa obesidade, pressão, glicemia e colesterol' },
  ],

  nutritionist: [
    { name: 'Mito alimentar',           topic: 'mitos sobre emagrecimento que travam seu progresso',               contentType: 'carousel', description: 'Quebre crenças que sabotam os pacientes' },
    { name: 'Como montar o prato',      topic: 'como montar um prato equilibrado sem contar calorias',             contentType: 'carousel', description: 'Método visual e prático para alimentação' },
    { name: 'Leitura de rótulo',        topic: 'como ler o rótulo nutricional e não ser enganado',                 contentType: 'carousel', description: 'Ensina o paciente a comprar com inteligência' },
    { name: 'Substitutos saudáveis',    topic: 'substituições simples que melhoram sua alimentação hoje',          contentType: 'carousel', description: 'Trocas práticas para o dia a dia' },
    { name: 'Dieta restritiva falha',   topic: 'por que dietas restritivas não funcionam a longo prazo',           contentType: 'post',     description: 'Posiciona você contra o efeito sanfona' },
    { name: 'Pré e pós treino',         topic: 'o que comer antes e depois do treino para ter resultado',          contentType: 'carousel', description: 'Conteúdo de alta demanda para público ativo' },
    { name: 'Saúde intestinal',         topic: 'como cuidar da microbiota intestinal com alimentação',             contentType: 'carousel', description: 'Gut health, um dos temas mais buscados' },
    { name: 'Suplementos',             topic: 'quem realmente precisa tomar suplementos alimentares',             contentType: 'post',     description: 'Desmistifica a indústria de suplementos' },
    { name: 'Hidratação',              topic: 'sinais de que seu corpo está desidratado sem você saber',          contentType: 'post',     description: 'Conteúdo simples de alto engajamento' },
    { name: 'Planejamento alimentar',  topic: 'como organizar a alimentação da semana em 30 minutos',             contentType: 'carousel', description: 'Solução prática para a correria do dia a dia' },
    { name: 'Açúcar oculto',          topic: 'onde o açúcar se esconde nos alimentos que parecem saudáveis',    contentType: 'carousel', description: 'Alerta que gera salvamentos e compartilhamentos' },
    { name: 'Café da manhã',          topic: 'o que comer no café da manhã para não sentir fome até o almoço',   contentType: 'story',    description: 'Formato rápido para dica prática' },
    { name: 'Jejum intermitente',     topic: 'jejum intermitente: o que a ciência realmente diz',                contentType: 'carousel', description: 'Um dos temas mais buscados na nutrição' },
    { name: 'Alimentação vegana',     topic: 'como montar uma dieta vegana completa e equilibrada',              contentType: 'carousel', description: 'Nutrição plant-based com evidências científicas' },
    { name: 'Gestante e nutrição',   topic: 'o que comer na gravidez para a saúde da mãe e do bebê',            contentType: 'carousel', description: 'Conteúdo de alto valor para gestantes' },
    { name: 'Criança e alimentação', topic: 'como criar bons hábitos alimentares nos filhos desde cedo',         contentType: 'post',     description: 'Atinge pais preocupados com alimentação infantil' },
    { name: 'Anti-inflamatório',     topic: 'alimentos que combatem inflamação no corpo',                       contentType: 'carousel', description: 'Tema em alta com alto engajamento' },
    { name: 'Intolerância ao glúten', topic: 'intolerância ao glúten vs doença celíaca: entenda a diferença',   contentType: 'post',     description: 'Esclarece confusão muito comum nos pacientes' },
    { name: 'Menopausa e dieta',     topic: 'como a alimentação ajuda a aliviar sintomas da menopausa',         contentType: 'carousel', description: 'Nicho com alta demanda e pouco conteúdo especializado' },
    { name: 'Proteína na dieta',     topic: 'quanto de proteína você realmente precisa por dia',                 contentType: 'carousel', description: 'Uma das dúvidas mais frequentes nos consultórios' },
    { name: 'Comer emocional',       topic: 'por que você come sem fome e como mudar esse padrão',              contentType: 'post',     description: 'Conecta comportamento alimentar e emoções' },
    { name: 'Gordura faz mal?',      topic: 'gordura boa vs gordura ruim: o que realmente importa',             contentType: 'carousel', description: 'Mito clássico com alto potencial de compartilhamento' },
    { name: 'Fibras e saciedade',    topic: 'alimentos ricos em fibra que prolongam a saciedade',               contentType: 'carousel', description: 'Prático e focado em resultado imediato' },
    { name: 'Alimentação funcional', topic: 'alimentos funcionais que todo profissional de saúde recomenda',    contentType: 'carousel', description: 'Educa sobre a função de alimentos específicos' },
  ],

  dentist: [
    { name: 'Rotina de higiene bucal',  topic: 'a rotina de escovação certa que a maioria faz errado',             contentType: 'carousel', description: 'Revisita o básico com autoridade e técnica' },
    { name: 'Clareamento dental',       topic: 'clareamento dental: tipos, resultados e o que ninguém te conta',   contentType: 'carousel', description: 'Um dos temas mais pesquisados em odontologia' },
    { name: 'Mitos odontológicos',      topic: 'mitos sobre dentes que você aprendeu errado',                      contentType: 'carousel', description: 'Mito vs verdade para saúde bucal' },
    { name: 'Sensibilidade dentária',   topic: 'por que seus dentes doem ao tomar frio e como tratar',             contentType: 'post',     description: 'Problema universal com alta taxa de busca' },
    { name: 'Bruxismo',                topic: 'bruxismo: sinais de que você range os dentes e nem sabe',          contentType: 'post',     description: 'Conecta sintoma silencioso à solução' },
    { name: 'Gengiva saudável',        topic: 'sinais de que sua gengiva precisa de atenção urgente',             contentType: 'carousel', description: 'Prevenção de periodontite em linguagem simples' },
    { name: 'Implante dental',         topic: 'implante dental: quando vale e o que esperar do tratamento',       contentType: 'carousel', description: 'Explica o processo para quem tem medo ou dúvida' },
    { name: 'Halitose',                topic: 'mau hálito: causas reais e como resolver de vez',                  contentType: 'post',     description: 'Assunto íntimo com alto volume de busca' },
    { name: 'Criança no dentista',     topic: 'quando e como levar seu filho ao dentista pela primeira vez',      contentType: 'carousel', description: 'Conteúdo que atinge pais e responsáveis' },
    { name: 'Fio dental vs irrigador', topic: 'fio dental ou irrigador oral: qual realmente limpa melhor',        contentType: 'post',     description: 'Comparativo prático de alta curiosidade' },
    { name: 'Alinhadores invisíveis',  topic: 'alinhadores transparentes: como funciona e para quem é indicado',  contentType: 'carousel', description: 'Alternativa moderna ao aparelho tradicional' },
    { name: 'Check-up bucal',          topic: 'com que frequência ir ao dentista mesmo sem dor',                  contentType: 'story',    description: 'Desmistifica a consulta preventiva' },
    { name: 'Cárie e prevenção',       topic: 'por que a cárie ainda é a doença mais prevalente do mundo',        contentType: 'post',     description: 'Causa reflexão e incentiva o retorno ao dentista' },
    { name: 'Canal sem medo',          topic: 'tratamento de canal: o que realmente acontece e por que não dói',  contentType: 'carousel', description: 'Quebra o maior tabu da odontologia' },
    { name: 'Prótese dentária',        topic: 'quando extrair o dente e quando vale tentar salvar',              contentType: 'post',     description: 'Dilema comum que gera muita busca' },
    { name: 'Dente do siso',          topic: 'dente do siso: quando extrair e quando deixar',                    contentType: 'carousel', description: 'Dúvida universal com alto engajamento' },
    { name: 'Saúde bucal na gravidez', topic: 'como a gravidez afeta a saúde bucal e o que fazer',              contentType: 'carousel', description: 'Nicho específico com alta demanda' },
    { name: 'Tabagismo e dentes',     topic: 'o que o cigarro faz com seus dentes e gengivas',                   contentType: 'post',     description: 'Alta taxa de conscientização e compartilhamento' },
    { name: 'Açúcar e cárie',         topic: 'como o açúcar destrói seus dentes por dentro',                    contentType: 'carousel', description: 'Liga hábito alimentar à saúde bucal' },
    { name: 'Estética dental',        topic: 'lentes de contato dental: o que é, para quem serve e resultados', contentType: 'carousel', description: 'Facetas e lentes: tema de altíssima procura' },
    { name: 'Saúde bucal do idoso',   topic: 'cuidados com a saúde bucal depois dos 60 anos',                   contentType: 'carousel', description: 'Atinge filhos e os próprios idosos' },
    { name: 'Periodontia e saúde',    topic: 'doença na gengiva pode afetar o coração: entenda a conexão',      contentType: 'post',     description: 'Conexão surpreendente com alta capacidade viral' },
    { name: 'Pasta de dente certa',   topic: 'como escolher a pasta de dente certa para o seu caso',            contentType: 'carousel', description: 'Decisão cotidiana com muita dúvida do paciente' },
    { name: 'Escova elétrica vale?',  topic: 'escova elétrica vs manual: qual é mais eficiente',                contentType: 'post',     description: 'Comparativo prático e direto ao ponto' },
  ],

  psychologist: [
    { name: 'Ansiedade no corpo',       topic: 'como a ansiedade se manifesta fisicamente sem você perceber',     contentType: 'carousel', description: 'Conecta sintomas físicos à saúde emocional' },
    { name: 'Limites saudáveis',        topic: 'como colocar limites sem se sentir culpado',                     contentType: 'post',     description: 'Um dos temas mais salvos em psicologia' },
    { name: 'Burnout',                  topic: 'sinais de esgotamento emocional que costumamos ignorar',         contentType: 'carousel', description: 'Alta identificação e taxa de compartilhamento' },
    { name: 'Terapia desmistificada',   topic: 'o que de fato acontece em uma sessão de terapia',               contentType: 'carousel', description: 'Reduz barreira de entrada para quem nunca foi' },
    { name: 'Síndrome do impostor',     topic: 'síndrome do impostor: por que você sente que não merece',        contentType: 'post',     description: 'Alto engajamento em público de alta performance' },
    { name: 'Padrões relacionais',      topic: 'padrões emocionais que se repetem nos seus relacionamentos',     contentType: 'carousel', description: 'Autoconhecimento aplicado a vínculos afetivos' },
    { name: 'Sono e saúde mental',      topic: 'como a privação de sono afeta seu humor e suas decisões',       contentType: 'carousel', description: 'Tema científico com impacto no cotidiano' },
    { name: 'Gatilhos emocionais',      topic: 'o que são gatilhos emocionais e como aprender a identificá-los', contentType: 'carousel', description: 'Ferramenta de autoconhecimento popular' },
    { name: 'Comunicação assertiva',    topic: 'como falar o que você pensa sem machucar ou ceder',             contentType: 'post',     description: 'Habilidade muito buscada por adultos' },
    { name: 'Meditação vs terapia',     topic: 'meditação substitui terapia? O que cada uma faz',               contentType: 'post',     description: 'Dúvida comum que gera debate saudável' },
    { name: 'Criança e emoções',        topic: 'como ajudar crianças a nomear e expressar o que sentem',        contentType: 'carousel', description: 'Atinge pais preocupados com saúde emocional' },
    { name: 'Autocuidado real',         topic: 'autocuidado além de banho quente: o que realmente restaura',    contentType: 'story',    description: 'Reconstrói o conceito de forma autêntica' },
    { name: 'Depressão não é frescura', topic: 'o que a depressão realmente é e por que exige tratamento',      contentType: 'carousel', description: 'Combate estigma com linguagem empática e científica' },
    { name: 'Relacionamento abusivo',   topic: 'sinais de que seu relacionamento é emocionalmente abusivo',     contentType: 'carousel', description: 'Conteúdo que protege e que é muito compartilhado' },
    { name: 'Luto e perdas',           topic: 'como atravessar o luto sem fingir que está tudo bem',            contentType: 'post',     description: 'Tema sensível com alto engajamento e gratidão' },
    { name: 'TDAH em adultos',         topic: 'TDAH em adultos: sintomas que ninguém associa ao transtorno',    contentType: 'carousel', description: 'Diagnóstico tardio em alta. Muito compartilhado' },
    { name: 'Dependência emocional',   topic: 'dependência emocional: quando o amor se torna ansiedade',        contentType: 'post',     description: 'Muito presente em relacionamentos. Alta identificação' },
    { name: 'Procrastinação',          topic: 'procrastinação não é preguiça: o que realmente está por trás',   contentType: 'carousel', description: 'Conexão com ansiedade, medo e perfeccionismo' },
    { name: 'Autoestima na prática',   topic: 'como reconstruir a autoestima depois de um relacionamento ruim', contentType: 'carousel', description: 'Conteúdo de recuperação emocional com alta busca' },
    { name: 'Fobia social',            topic: 'ansiedade social: quando o medo de julgamento paralisa',         contentType: 'post',     description: 'Fobia muito prevalente e ainda pouco compreendida' },
    { name: 'Perfeccionismo',          topic: 'perfeccionismo: quando a busca por qualidade vira sofrimento',   contentType: 'carousel', description: 'Alta identificação em público exigente consigo mesmo' },
    { name: 'Introversão',            topic: 'introversão não é timidez: entenda a diferença',                 contentType: 'post',     description: 'Muito compartilhado por introvertidos que se reconhecem' },
    { name: 'Trauma e memória',       topic: 'como traumas da infância ainda moldam seu comportamento hoje',   contentType: 'carousel', description: 'Psicologia do desenvolvimento em linguagem acessível' },
    { name: 'Terapia em casal',       topic: 'quando a terapia de casal ajuda e quando é tarde demais',        contentType: 'post',     description: 'Dúvida real que muitos casais têm mas não expressam' },
  ],
}

// ── Daily selection ────────────────────────────────────────
// Returns 8 templates per day, different each day, deterministic

const DAILY_COUNT = 8

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 17), 0x45d9f3b)
    s = Math.imul(s ^ (s >>> 11), 0x9e3779b9)
    s ^= s >>> 16
    const j = Math.abs(s) % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getDailyTemplates(templates: Template[]): Template[] {
  const daySeed = Math.floor(Date.now() / 86_400_000) // changes at midnight UTC
  return seededShuffle(templates, daySeed).slice(0, DAILY_COUNT)
}

const DAILY_TEMPLATES: Record<Vertical, Template[]> = {
  doctor:       getDailyTemplates(TEMPLATES.doctor),
  nutritionist: getDailyTemplates(TEMPLATES.nutritionist),
  dentist:      getDailyTemplates(TEMPLATES.dentist),
  psychologist: getDailyTemplates(TEMPLATES.psychologist),
}

// ── UI helpers ─────────────────────────────────────────────

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
            <h2 className="text-base font-bold text-foreground">Templates do dia</h2>
            <p className="text-xs text-muted-foreground">8 sugestões selecionadas hoje para a sua especialidade</p>
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
            {DAILY_TEMPLATES[tab].map((t, i) => (
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
