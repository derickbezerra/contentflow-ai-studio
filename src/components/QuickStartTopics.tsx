type Vertical = 'doctor' | 'nutritionist' | 'dentist' | 'psychologist'

const SPECIALTY_TOPICS: Record<Vertical, string[]> = {
  doctor: [
    'Cuidados com a pele no inverno',
    'Sinais de alerta do colesterol alto',
    'Quando procurar um check-up',
    'Mitos sobre pressão alta',
  ],
  nutritionist: [
    'Café da manhã saudável e prático',
    'Alimentos que ajudam na imunidade',
    'Como montar um prato equilibrado',
    'Mitos sobre dieta low carb',
  ],
  dentist: [
    'Clareamento dental: o que funciona',
    'Sinais de bruxismo no dia a dia',
    'Saúde bucal e saúde geral',
    'Quando trocar a escova de dente',
  ],
  psychologist: [
    'Como lidar com a ansiedade no trabalho',
    'Sinais de burnout que passam despercebidos',
    'Autoestima e redes sociais',
    'Quando procurar terapia',
  ],
}

interface Props {
  vertical: Vertical
  onSelect: (topic: string) => void
}

export default function QuickStartTopics({ vertical, onSelect }: Props) {
  const topics = SPECIALTY_TOPICS[vertical] ?? SPECIALTY_TOPICS.doctor

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelect(topic)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
        >
          {topic}
        </button>
      ))}
    </div>
  )
}

export { SPECIALTY_TOPICS }
export type { Vertical as QuickStartVertical }
