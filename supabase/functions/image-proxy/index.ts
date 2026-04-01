const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Curated Unsplash photo IDs by health topic keyword
const HEALTH_PHOTOS: Record<string, string> = {
  // Medicina / médicos
  medic: '1559757148-5c350d0d3c56',
  medicine: '1559757148-5c350d0d3c56',
  doctor: '1559757148-5c350d0d3c56',
  consulta: '1576091160399-112ba8d25d1d',
  colesterol: '1505751172876-fa1923c5c528',
  pressao: '1505751172876-fa1923c5c528',
  hipertensao: '1505751172876-fa1923c5c528',
  diabetes: '1584308666744-95b2d28a4d63',
  vacinacao: '1584820927498-cad076efd504',
  vacina: '1584820927498-cad076efd504',
  bercario: '1584820927498-cad076efd504',
  pediatria: '1584820927498-cad076efd504',
  cardio: '1505751172876-fa1923c5c528',
  coracao: '1505751172876-fa1923c5c528',
  // Odontologia
  dente: '1606811971618-4486d14f3f99',
  dental: '1606811971618-4486d14f3f99',
  clareamento: '1606811971618-4486d14f3f99',
  sorriso: '1606811971618-4486d14f3f99',
  // Psicologia
  ansiedade: '1506126613408-eca07ce68773',
  mental: '1506126613408-eca07ce68773',
  estresse: '1506126613408-eca07ce68773',
  burnout: '1506126613408-eca07ce68773',
  terapia: '1506126613408-eca07ce68773',
  emocional: '1506126613408-eca07ce68773',
  // Nutrição
  nutricao: '1490645935967-10de6ba17061',
  alimentacao: '1490645935967-10de6ba17061',
  dieta: '1490645935967-10de6ba17061',
  proteina: '1490645935967-10de6ba17061',
  // Genérico saúde
  health: '1559757148-5c350d0d3c56',
  saude: '1559757148-5c350d0d3c56',
}

// Fallback pool — rotates by index
const FALLBACK_POOL = [
  '1559757148-5c350d0d3c56', // médico consultando
  '1576091160399-112ba8d25d1d', // estetoscópio
  '1584820927498-cad076efd504', // vacina / seringa
  '1606811971618-4486d14f3f99', // sorriso dental
  '1506126613408-eca07ce68773', // pessoa serena / saúde mental
  '1490645935967-10de6ba17061', // alimentação saudável
  '1505751172876-fa1923c5c528', // coração / cardiologia
  '1584308666744-95b2d28a4d63', // análise clínica
]

function resolvePhotoId(seed: string, fallbackIndex: number): string {
  const key = seed.toLowerCase().split('-')[0]
  return HEALTH_PHOTOS[key] ?? FALLBACK_POOL[fallbackIndex % FALLBACK_POOL.length]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = new URL(req.url)
    const seed = url.searchParams.get('seed') || 'health'
    const idx = parseInt(url.searchParams.get('idx') || '0', 10)
    const w = url.searchParams.get('w') || '400'
    const h = url.searchParams.get('h') || '600'

    const photoId = resolvePhotoId(seed, idx)
    const imageUrl = `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`

    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error(`upstream ${res.status}`)

    const data = await res.arrayBuffer()
    const ct = res.headers.get('content-type') || 'image/jpeg'

    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=604800',
      },
    })
  } catch (e) {
    console.error('image-proxy error:', e)
    return new Response('error', { status: 502, headers: corsHeaders })
  }
})
