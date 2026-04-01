import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

const POPULAR = [
  'Cardiologia',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Clínica Médica',
  'Ortopedia e Traumatologia',
  'Dermatologia',
  'Psiquiatria',
  'Neurologia',
  'Cirurgia Geral',
  'Medicina de Família e Comunidade',
]

const ALL_SPECIALTIES = [
  'Acupuntura',
  'Alergia e Imunologia',
  'Anestesiologia',
  'Angiologia',
  'Cancerologia / Oncologia',
  'Cardiologia',
  'Cirurgia Cardiovascular',
  'Cirurgia da Mão',
  'Cirurgia de Cabeça e Pescoço',
  'Cirurgia do Aparelho Digestivo',
  'Cirurgia Geral',
  'Cirurgia Pediátrica',
  'Cirurgia Plástica',
  'Cirurgia Torácica',
  'Cirurgia Vascular',
  'Clínica Médica',
  'Coloproctologia',
  'Dermatologia',
  'Endocrinologia e Metabologia',
  'Endoscopia',
  'Gastroenterologia',
  'Genética Médica',
  'Geriatria',
  'Ginecologia e Obstetrícia',
  'Hematologia e Hemoterapia',
  'Infectologia',
  'Mastologia',
  'Medicina de Emergência',
  'Medicina de Família e Comunidade',
  'Medicina do Esporte',
  'Medicina do Trabalho',
  'Medicina Física e Reabilitação',
  'Medicina Intensiva',
  'Medicina Legal e Perícia Médica',
  'Medicina Nuclear',
  'Medicina Preventiva e Social',
  'Nefrologia',
  'Neurocirurgia',
  'Neurologia',
  'Nutrologia',
  'Oftalmologia',
  'Ortopedia e Traumatologia',
  'Otorrinolaringologia',
  'Patologia',
  'Patologia Clínica / Medicina Laboratorial',
  'Pediatria',
  'Pneumologia',
  'Psiquiatria',
  'Radiologia e Diagnóstico por Imagem',
  'Radioterapia',
  'Reumatologia',
  'Urologia',
]

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function MedicalSpecialtyCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        onChange(query.trim())
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [query, onChange])

  const filtered = query.trim()
    ? ALL_SPECIALTIES.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : POPULAR

  const exactMatch = ALL_SPECIALTIES.some(s => s.toLowerCase() === query.toLowerCase().trim())

  function select(s: string) {
    onChange(s)
    setQuery(s)
    setOpen(false)
    inputRef.current?.blur()
  }

  function clear() {
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-card">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (filtered.length > 0 && !exactMatch) select(filtered[0])
              else { onChange(query.trim()); setOpen(false) }
            }
            if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
          }}
          placeholder="Subespecialidade (ex: Cardiologia, Pediatria...)"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          aria-label="Subespecialidade médica"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clear}
            className="shrink-0 rounded p-0.5 text-muted-foreground/40 hover:text-foreground"
            aria-label="Limpar subespecialidade"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {!query.trim() && (
            <p className="px-3 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Mais comuns
            </p>
          )}
          {filtered.length === 0 && query.trim() && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Nenhuma encontrada</p>
          )}
          {filtered.map(s => (
            <button
              key={s}
              onMouseDown={e => { e.preventDefault(); select(s) }}
              className="flex w-full items-center px-3 py-2 text-left text-sm text-foreground hover:bg-muted/60"
            >
              {s}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              onMouseDown={e => { e.preventDefault(); select(query.trim()) }}
              className="flex w-full items-center gap-1.5 border-t border-border/60 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/60"
            >
              <span className="font-semibold text-primary">+</span>
              Usar &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
