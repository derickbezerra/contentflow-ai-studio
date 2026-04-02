import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Sparkles, Loader2, Zap, LayoutGrid, Layers, ShieldCheck, Lock, Check, AlertTriangle, Upload, X, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import CarouselOutput from "@/components/CarouselOutput";
import PostOutput from "@/components/PostOutput";
import StoryOutput from "@/components/StoryOutput";
const PricingModal = lazy(() => import("@/components/PricingModal"));
const OnboardingModal = lazy(() => import("@/components/OnboardingModal"));
const BillingWall = lazy(() => import("@/components/BillingWall"));
const TemplatesModal = lazy(() => import("@/components/TemplatesModal"));
import { usePlan, FREE_LIMIT } from "@/hooks/usePlan";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import TrendingTopics from "@/components/TrendingTopics";
import BenchmarkWidget from "@/components/BenchmarkWidget";
import MedicalSpecialtyCombobox from "@/components/MedicalSpecialtyCombobox";
import FeedbackBar from "@/components/FeedbackBar";
import ContentValidator, { type Compliance } from "@/components/ContentValidator";
import { useLocation } from "react-router-dom";
import { handleCheckout, PLANS } from "@/lib/plans";
import QuickStartTopics from "@/components/QuickStartTopics";

type ContentType = "carousel" | "post" | "story";
type Vertical = "doctor" | "nutritionist" | "dentist" | "psychologist";
type Gender = "male" | "female" | "both";
type PatientIntent = "estetico" | "dor" | "preventivo" | "cronico" | "premium";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "carousel", label: "Carrossel" },
  { value: "post", label: "Post" },
  { value: "story", label: "Story" },
];

const VERTICALS: { value: Vertical; label: string }[] = [
  { value: "doctor", label: "Medicina" },
  { value: "nutritionist", label: "Nutrição" },
  { value: "dentist", label: "Odontologia" },
  { value: "psychologist", label: "Psicologia" },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "both", label: "Ambos" },
];

const PATIENT_INTENTS: { value: PatientIntent; label: string }[] = [
  { value: "estetico",   label: "Estético" },
  { value: "dor",        label: "Com dor" },
  { value: "preventivo", label: "Preventivo" },
  { value: "cronico",    label: "Crônico" },
  { value: "premium",    label: "Premium" },
];

const AGE_RANGES = ["18-25", "25-35", "35-50", "50+", "Todos"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeneratedResult = { type: ContentType } & Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BatchResults = { carousel: Record<string, any>; post: Record<string, any>; story: Record<string, any> };

const VERTICAL_TAGLINES: Record<Vertical, string> = {
  doctor: "Posts de medicina que atraem o paciente certo para sua agenda",
  nutritionist: "Conteúdo de nutrição que converte seguidores em pacientes",
  dentist: "Posts de odontologia que chegam antes da dor aparecer",
  psychologist: "Conteúdo de saúde mental que desmistifica e gera confiança",
}

function getUsageMessage(count: number, limit: number): string {
  if (count === 0) return 'Nenhuma geração ainda — comece agora!'
  if (count === 1) return `1 / ${limit} · Ótimo começo!`
  const pct = count / limit
  if (pct >= 0.9) return `${count} / ${limit} · Quase no limite do mês`
  if (pct >= 0.6) return `${count} / ${limit} gerações · Em ritmo constante!`
  return `${count} / ${limit} gerações este mês`
}

/* ── Compliance ─────────────────────────────────────── */
interface ComplianceResult {
  approved: boolean
  council: string
  summary: string
  issues: Array<{ severity: 'critical' | 'warning'; excerpt: string; rule: string; explanation: string; rewrite: string }>
  approved_aspects: string[]
}

const COMPLIANCE_COUNCILS = [
  { label: 'Medicina', value: 'doctor' },
  { label: 'Odontologia', value: 'dentist' },
  { label: 'Psicologia', value: 'psychologist' },
  { label: 'Nutrição', value: 'nutritionist' },
]

const COMPLIANCE_MONTHLY_LIMIT = 50

function ComplianceFullPage({
  planInfo,
  onUpgrade,
  onCreditUsed,
}: {
  planInfo: import('@/hooks/usePlan').PlanInfo | null
  onUpgrade: () => void
  onCreditUsed: () => void
}) {
  const { user } = useAuth()
  const isPro = planInfo?.plan === 'pro'
  const [text, setText] = useState('')
  const [council, setCouncil] = useState('doctor')
  const [loading, setLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [imageMediaType, setImageMediaType] = useState<string>('image/jpeg')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [monthlyUsage, setMonthlyUsage] = useState<number | null>(null)

  const creditsLeft = monthlyUsage !== null ? Math.max(0, COMPLIANCE_MONTHLY_LIMIT - monthlyUsage) : 0

  // Fetch compliance-specific monthly usage
  useEffect(() => {
    if (!user || !isPro) return
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    supabase
      .from('compliance_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth)
      .then(({ count, error }) => {
        if (!error && count !== null) setMonthlyUsage(count)
      })
  }, [user, isPro])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImageData(dataUrl.split(',')[1])
      setImageMediaType(file.type)
      setImagePreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageData(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const analyze = async () => {
    if (!text.trim() || !user) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-compliance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text,
            vertical: council,
            ...(imageData ? { imageData, imageMediaType } : {}),
          }),
        }
      )
      if (!res.ok) throw new Error('Falhou')
      const data = await res.json()
      setResult(data)
      setMonthlyUsage(prev => (prev !== null ? prev + 1 : 1))
      onCreditUsed()
    } catch {
      toast.error('Erro ao analisar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isPro) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-7 w-7 text-primary/50" />
            </div>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Análise de Compliance</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Cole qualquer post (texto ou imagem) e veja instantaneamente se está dentro das normas do CFM, CFO, CFP ou CFN, antes de publicar e arriscar uma punição do conselho.
          </p>
          <div className="mb-6 grid grid-cols-2 gap-3 text-left">
            {[
              { code: 'CFM', label: 'Medicina' },
              { code: 'CFO', label: 'Odontologia' },
              { code: 'CFP', label: 'Psicologia' },
              { code: 'CFN', label: 'Nutrição' },
            ].map(c => (
              <div key={c.code} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 text-primary/40" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{c.code}</p>
                  <p className="text-[11px] text-muted-foreground">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="mb-0.5 text-sm font-semibold text-foreground">Disponível no Plano Pro</p>
            <p className="mb-4 text-xs text-muted-foreground">R$127/mês · 50 conteúdos + análises de compliance</p>
            <Button
              variant="cta"
              className="w-full"
              disabled={upgradeLoading === 'Pro'}
              onClick={() => handleCheckout(PLANS.find(p => p.name === 'Pro')!.priceIdEnv, 'Pro', setUpgradeLoading)}
            >
              {upgradeLoading === 'Pro' ? <><Loader2 className="h-4 w-4 animate-spin" /> Aguarde...</> : <><Zap className="h-4 w-4" /> Fazer upgrade para Pro</>}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Análise de Compliance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifique se seu post está dentro das normas éticas antes de publicar
            </p>
          </div>
          <span className={`shrink-0 text-sm font-medium ${creditsLeft <= 5 ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {creditsLeft} crédito{creditsLeft !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Council selector */}
        <div className="flex flex-wrap gap-2">
          {COMPLIANCE_COUNCILS.map(c => (
            <button
              key={c.value}
              onClick={() => { setCouncil(c.value); setResult(null) }}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                council === c.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-md">
          <div className="border-b border-border/40 px-5 pt-3 pb-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Texto do post
            </label>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Cole aqui o texto completo do seu post. A IA analisa cada trecho, identifica o que viola as normas do conselho selecionado e sugere como reescrever — para você publicar com segurança e sem risco de punição."
            rows={7}
            className="w-full resize-none bg-transparent px-5 py-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          />
        </div>

        {/* Image upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Imagem do post"
                className="max-h-48 rounded-xl border border-border object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity hover:opacity-80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              <Upload className="h-4 w-4" />
              Adicionar imagem do post (opcional)
            </button>
          )}
        </div>

        {/* Analyze button */}
        <Button
          variant="cta"
          size="xl"
          className="w-full"
          onClick={analyze}
          disabled={loading || !text.trim() || creditsLeft <= 0}
        >
          {loading
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Analisando...</>
            : <><ShieldCheck className="h-5 w-5" /> Analisar post · usa 1 crédito</>
          }
        </Button>

        {creditsLeft <= 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Você atingiu o limite de créditos deste mês.
          </p>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4">
            {/* Status banner */}
            <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${
              result.approved
                ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400'
                : 'border-red-400/30 bg-red-400/8 text-red-700 dark:text-red-400'
            }`}>
              {result.approved
                ? <Check className="mt-0.5 h-5 w-5 shrink-0" />
                : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              }
              <div>
                <p className="font-semibold">
                  {result.approved ? `${result.council} — Post aprovado` : `${result.council} — Requer atenção`}
                </p>
                <p className="mt-0.5 text-sm opacity-80">{result.summary}</p>
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {result.issues.length} problema{result.issues.length !== 1 ? 's' : ''} encontrado{result.issues.length !== 1 ? 's' : ''}
                </p>
                {result.issues.map((issue, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${
                    issue.severity === 'critical'
                      ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30'
                      : 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30'
                  }`}>
                    <div className="mb-2 flex items-start gap-2">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        issue.severity === 'critical'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                      }`}>
                        {issue.severity === 'critical' ? 'Crítico' : 'Atenção'}
                      </span>
                      <p className="text-sm font-semibold text-foreground">{issue.rule}</p>
                    </div>
                    {issue.excerpt && (
                      <p className="mb-2 rounded-lg bg-background/50 px-3 py-2 text-sm italic text-muted-foreground">
                        "{issue.excerpt}"
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-muted-foreground">{issue.explanation}</p>
                    {issue.rewrite && (
                      <div className="mt-3 rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Sugestão de reescrita</p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{issue.rewrite}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Approved aspects */}
            {result.approved_aspects?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pontos aprovados</p>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <div className="space-y-2">
                    {result.approved_aspects.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [idea, setIdea] = useState("");
  const [contentType, setContentType] = useState<ContentType>("carousel");
  const [vertical, setVertical] = useState<Vertical>(
    () => (localStorage.getItem('cf_vertical') as Vertical) ?? "doctor"
  );
  const [medicalSpecialty, setMedicalSpecialty] = useState(
    () => localStorage.getItem('cf_medical_specialty') ?? ''
  );
  const [gender, setGender] = useState<Gender>("both");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [patientIntents, setPatientIntents] = useState<PatientIntent[]>([]);
  const [ageRanges, setAgeRanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchResults | null>(null);
  const [compliance, setCompliance] = useState<Compliance | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'compliance'>('create');
  const { planInfo, setPlanInfo, refetch, incrementGeneration } = usePlan();
  const resultRef = useRef<HTMLDivElement>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [totalGenerations, setTotalGenerations] = useState<number | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(
    () => localStorage.getItem('cf_onboarding_done') === 'true'
  );
  const [hasBrandProfile, setHasBrandProfile] = useState(false);

  // Persist vertical + medical specialty across reloads
  useEffect(() => {
    localStorage.setItem('cf_vertical', vertical)
  }, [vertical])

  useEffect(() => {
    localStorage.setItem('cf_medical_specialty', medicalSpecialty)
  }, [medicalSpecialty])

  // Check if user needs onboarding
  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('vertical, instagram_handle, onboarding_goal, patient_intent_primary, patient_intent_secondary, age_range')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.vertical || !data?.onboarding_goal) {
          setShowOnboarding(true);
        } else {
          setVertical(data.vertical as Vertical);
          setOnboardingComplete(true);
          localStorage.setItem('cf_onboarding_done', 'true');
        }
        if (data?.instagram_handle) {
          setInstagramHandle(data.instagram_handle);
          if (data.instagram_handle.trim()) setHasBrandProfile(true);
        }
        const intents: PatientIntent[] = [];
        if (data?.patient_intent_primary) intents.push(data.patient_intent_primary as PatientIntent);
        if (data?.patient_intent_secondary) intents.push(data.patient_intent_secondary as PatientIntent);
        if (intents.length) setPatientIntents(intents);
        if (data?.age_range?.length) {
          setAgeRanges(data.age_range);
        }
      });
  }, [user]);

  // Check total generation count for empty state / first-gen celebration
  useEffect(() => {
    if (!user) return;
    supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => {
        setTotalGenerations(count ?? 0);
        if ((count ?? 0) > 0) setHasGenerated(true);
      });
  }, [user]);

  // Pre-fill from calendar "Gerar agora"
  useEffect(() => {
    const state = location.state as { topic?: string; contentType?: ContentType } | null
    if (state?.topic) {
      setIdea(state.topic)
      if (state.contentType) setContentType(state.contentType)
      window.history.replaceState({}, '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Post-checkout: fire pixels once, then poll for plan activation
  const [checkoutPolling, setCheckoutPolling] = useState(false);
  const pollAttemptsRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;

    const planValue = Number(params.get("value") ?? 0);
    window.history.replaceState({}, "", "/app");

    // Fire conversion pixels immediately
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "Purchase", { currency: "BRL", value: planValue });
    }
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "purchase", { currency: "BRL", value: planValue });
    }
    if (typeof (window as any).ttq?.track === "function") {
      (window as any).ttq.track("PlaceAnOrder", { currency: "BRL", value: planValue });
    }

    // Start polling for plan activation
    pollAttemptsRef.current = 0;
    setCheckoutPolling(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll plan status every 2s for up to 30s after checkout
  useEffect(() => {
    if (!checkoutPolling) return;

    const maxAttempts = 15; // 15 x 2s = 30s
    const poll = setInterval(() => {
      pollAttemptsRef.current++;
      refetch(true);
    }, 2000);

    return () => { clearInterval(poll); };
  }, [checkoutPolling, refetch]);

  // React to planInfo changes during checkout polling
  useEffect(() => {
    if (!checkoutPolling) return;

    if (planInfo && planInfo.plan !== "free" && planInfo.effectivePlan !== "free") {
      setCheckoutPolling(false);
      toast.success("Plano ativado com sucesso!");
      return;
    }

    if (pollAttemptsRef.current >= 15) {
      setCheckoutPolling(false);
      toast.info("Seu pagamento foi confirmado. O plano pode levar alguns minutos para ativar. Tente recarregar a página.");
    }
  }, [checkoutPolling, planInfo]);

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    if (planInfo && !planInfo.canGenerate) {
      setShowPricing(true);
      return;
    }

    setLoading(true);
    setResult(null);
    setBatchResults(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      const medSpec = vertical === 'doctor' && medicalSpecialty.trim() ? medicalSpecialty.trim() : undefined
      const body = batchMode
        ? { topic: idea, vertical, gender, medical_specialty: medSpec, patient_intents: patientIntents.length ? patientIntents : undefined, age_ranges: ageRanges.length ? ageRanges : undefined, batch: true }
        : { topic: idea, content_type: contentType, vertical, gender, medical_specialty: medSpec, patient_intents: patientIntents.length ? patientIntents : undefined, age_ranges: ageRanges.length ? ageRanges : undefined };

      const fetchHeaders = {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${session.access_token}`,
      };

      // ── Streaming path (single generation only) ──────────────────────────
      if (!batchMode) {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
          { method: "POST", headers: fetchHeaders, body: JSON.stringify({ ...body, stream: true }) }
        );
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          if (res.status === 429 || res.status === 403) {
            toast.error(errJson?.error ?? "Não foi possível gerar o conteúdo.");
            if (res.status === 403) setShowPricing(true);
            return;
          }
          throw new Error(errJson?.error ?? `HTTP ${res.status}`);
        }

        setIsStreaming(true);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split('\n\n');
          buf = parts.pop() ?? '';
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data: ')) continue;
            const ev = JSON.parse(line.slice(6));
            if (ev.error) throw new Error(ev.error);
            if (ev.done) {
              setIsStreaming(false);
              if (typeof ev.new_count === 'number') {
                setPlanInfo(prev => prev ? { ...prev, generationCount: ev.new_count, canGenerate: ev.new_count < prev.planLimit } : prev);
              }
              setResult({ type: contentType, ...ev.output });
              setCompliance(ev.output?.compliance ?? null);
              setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
              // First-generation celebration
              if (!hasGenerated) {
                setHasGenerated(true);
                setTotalGenerations(prev => (prev ?? 0) + 1);
                setTimeout(() => toast.success('Seu primeiro conteúdo foi criado!'), 500);
              } else {
                setTotalGenerations(prev => (prev ?? 0) + 1);
              }
              if (user) {
                supabase.from("content").insert([{ user_id: user.id, type: contentType, input: idea, output_json: ev.output }])
                  .then(({ error }) => { if (error) console.error("Failed to save content:", error); });
              }
            }
          }
        }
        return;
      }

      // ── Batch path (non-streaming) ────────────────────────────────────────
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
        { method: "POST", headers: fetchHeaders, body: JSON.stringify(body) }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        if (res.status === 429 || res.status === 403) {
          toast.error(errJson?.error ?? "Não foi possível gerar o conteúdo.");
          if (res.status === 403) setShowPricing(true);
          return;
        }
        throw new Error(errJson?.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (typeof data.new_count === 'number') {
        setPlanInfo(prev => prev ? {
          ...prev,
          generationCount: data.new_count,
          canGenerate: data.new_count < prev.planLimit,
        } : prev);
      }

      setBatchResults(data.outputs);
      setCompliance(data.outputs.carousel?.compliance ?? null);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)

      // First-generation celebration
      if (!hasGenerated) {
        setHasGenerated(true);
        setTotalGenerations(prev => (prev ?? 0) + 3);
        setTimeout(() => toast.success('Seu primeiro conteúdo foi criado!'), 500);
      } else {
        setTotalGenerations(prev => (prev ?? 0) + 3);
      }

      if (user) {
        supabase.from("content").insert([
          { user_id: user.id, type: "carousel", input: idea, output_json: data.outputs.carousel },
          { user_id: user.id, type: "post",     input: idea, output_json: data.outputs.post },
          { user_id: user.id, type: "story",    input: idea, output_json: data.outputs.story },
        ]).then(({ error }) => { if (error) console.error("Failed to save content:", error); });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg && !msg.startsWith('HTTP')) {
        toast.error(msg);
      } else {
        toast.error("Erro ao gerar conteúdo. Tente novamente em alguns segundos.");
      }
      console.error(err);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const isPro = planInfo?.plan === 'pro';
  const isPaid = planInfo?.plan !== "free" && planInfo?.plan != null;
  const usagePercent = planInfo
    ? Math.min(100, ((planInfo.generationCount) / planInfo.planLimit) * 100)
    : 0;
  const trialDaysLeft = planInfo?.trialEndsAt
    ? Math.max(0, Math.ceil((planInfo.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[280px] w-[360px] rounded-full bg-emerald-400/[0.04] blur-3xl" />

      <TopBar onUpgrade={() => setShowPricing(true)} />

      <div className="flex flex-1">

        {/* ── Sidebar nav ── */}
        <aside className="hidden lg:flex w-52 shrink-0 flex-col border-r border-border px-3 pt-6">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === 'create'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              Criar Conteúdo
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                activeTab === 'compliance'
                  ? 'bg-muted font-semibold text-foreground'
                  : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Compliance</span>
              {!isPro ? (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">PRO</span>
              ) : null}
            </button>
          </nav>
        </aside>

        {/* ── Main content area ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {activeTab === 'compliance' ? (
            <ComplianceFullPage
              planInfo={planInfo}
              onUpgrade={() => setShowPricing(true)}
              onCreditUsed={incrementGeneration}
            />
          ) : (
            <main className="relative flex flex-1 px-4 pb-16 pt-8 md:pt-10">
              <div className="mx-auto flex w-full max-w-xl flex-col items-center">

                {/* Trial banner */}
                {planInfo?.isInTrial && (
                  <div className="mb-6 flex w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                    <p className="text-xs text-foreground">
                      <span className="font-semibold text-primary">{trialDaysLeft} {trialDaysLeft === 1 ? 'dia' : 'dias'} de teste restantes</span>
                      {' '}· Plano Starter grátis
                    </p>
                    <button onClick={() => setShowPricing(true)} className="text-xs font-semibold text-primary hover:underline">
                      Assinar agora
                    </button>
                  </div>
                )}

                {/* Cancellation banner */}
                {planInfo?.cancelAtPeriodEnd && planInfo.currentPeriodEnd && (
                  <div className="mb-6 flex w-full items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5">
                    <p className="text-xs text-orange-800">
                      Seu plano foi cancelado e encerra em{' '}
                      <span className="font-semibold">
                        {planInfo.currentPeriodEnd.toLocaleDateString('pt-BR')}
                      </span>
                      . Você mantém acesso até lá.
                    </p>
                    <button onClick={() => setShowPricing(true)} className="text-xs font-semibold text-orange-700 hover:underline">
                      Reativar
                    </button>
                  </div>
                )}

                {/* Brand */}
                <div className="mb-6 animate-fade-in text-center">
                  <div className="inline-flex items-center gap-2.5">
                    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 16 C9 10, 17 22, 24 16 C31 10, 39 22, 46 16 L46 23 C39 29, 31 17, 24 23 C17 29, 9 17, 2 23 Z" fill="hsl(var(--primary) / 0.25)"/>
                      <path d="M4 26 C10 20, 17 32, 24 26 C31 20, 38 32, 44 26 L44 33 C38 39, 31 27, 24 33 C17 39, 10 27, 4 33 Z" fill="hsl(var(--primary) / 0.6)"/>
                      <path d="M6 36 C12 30, 18 42, 24 36 C30 30, 36 42, 42 36 L42 43 C36 49, 30 37, 24 43 C18 49, 12 37, 6 43 Z" fill="hsl(var(--primary))"/>
                    </svg>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {VERTICAL_TAGLINES[vertical]}
                    </span>
                  </div>
                </div>

                {/* Progress checklist for new users */}
                {totalGenerations !== null && totalGenerations <= 3 && (
                  <div className="mb-4 w-full rounded-xl border border-border bg-card px-4 py-3">
                    <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                      Primeiros passos
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: 'Perfil criado', done: onboardingComplete },
                        { label: 'Primeiro conteúdo', done: hasGenerated },
                        { label: 'Perfil de marca', done: hasBrandProfile },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          {item.done ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/30" />
                          )}
                          <span className={`text-sm ${item.done ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input area */}
                <div className="w-full animate-fade-up space-y-4">

                  {/* Quick-start topic suggestions */}
                  {totalGenerations !== null && totalGenerations === 0 && !idea.trim() && (
                    <QuickStartTopics vertical={vertical} onSelect={(t) => setIdea(t)} />
                  )}

                  {/* Trending topics + Templates */}
                  <TrendingTopics
                    vertical={vertical}
                    onSelect={(t) => setIdea(t)}
                    headerRight={
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Templates
                      </button>
                    }
                  />

                  {/* Textarea */}
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-md">
                    <div className="border-b border-border/40 px-5 pt-3 pb-2">
                      <label htmlFor="idea-input" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        Sobre o que você quer criar conteúdo?
                      </label>
                    </div>
                    <textarea
                      id="idea-input"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        vertical === "doctor"
                          ? "Digite uma ideia... (ex: colesterol alto, diabetes tipo 2, saúde do coração)"
                          : vertical === "dentist"
                          ? "Digite uma ideia... (ex: clareamento dental, bruxismo, saúde bucal)"
                          : vertical === "psychologist"
                          ? "Digite uma ideia... (ex: ansiedade, autoestima, relacionamentos, saúde mental)"
                          : "Digite uma ideia... (ex: alimentação para emagrecer, como montar uma dieta, mitos sobre proteína)"
                      }
                      rows={4}
                      className="w-full resize-none bg-transparent px-5 py-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
                    />
                  </div>

                  {/* Handle / nome da clínica */}
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors focus-within:border-primary/40">
                    <label htmlFor="instagram-handle" className="sr-only">Seu @instagram ou nome da clínica</label>
                    <input
                      id="instagram-handle"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      onBlur={async () => {
                        if (!user) return;
                        const { error } = await supabase.from('users').update({ instagram_handle: instagramHandle }).eq('id', user.id);
                        if (error) console.error("Failed to save instagram_handle:", error);
                        if (instagramHandle.trim()) setHasBrandProfile(true);
                      }}
                      placeholder="Ex: @suaclinica ou Clínica Vitallis (aparece no card)"
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
                    />
                  </div>

                  {/* Filter card — grouped */}
                  <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    {/* Group 1: Especialidade */}
                    <div className="space-y-3 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Sobre você
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-xs font-medium text-muted-foreground">Especialidade:</span>
                        {VERTICALS.map((v) => (
                          <Button
                            key={v.value}
                            variant={vertical === v.value ? "pill-active" : "pill"}
                            size="sm"
                            onClick={() => setVertical(v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                      {vertical === 'doctor' && (
                        <MedicalSpecialtyCombobox
                          value={medicalSpecialty}
                          onChange={setMedicalSpecialty}
                        />
                      )}
                    </div>

                    <div className="border-t border-border/60" />

                    {/* Group 2: Tipo de paciente + Idade + Gênero */}
                    <div className="space-y-3 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Para quem
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-xs font-medium text-muted-foreground">Gênero:</span>
                        {GENDERS.map((g) => (
                          <Button
                            key={g.value}
                            variant={gender === g.value ? "pill-active" : "pill"}
                            size="sm"
                            onClick={() => setGender(g.value)}
                          >
                            {g.label}
                          </Button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-xs font-medium text-muted-foreground">Paciente:</span>
                        {PATIENT_INTENTS.map((p) => {
                          const rank = patientIntents.indexOf(p.value);
                          const selected = rank !== -1;
                          const maxReached = !selected && patientIntents.length >= 3;
                          return (
                            <Button
                              key={p.value}
                              variant={selected ? "pill-active" : "pill"}
                              size="sm"
                              onClick={() => {
                                if (selected) {
                                  setPatientIntents(prev => prev.filter(v => v !== p.value));
                                } else if (patientIntents.length < 3) {
                                  setPatientIntents(prev => [...prev, p.value]);
                                }
                              }}
                              className={`relative ${maxReached ? 'opacity-40' : ''}`}
                            >
                              {selected && (
                                <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold leading-none">
                                  {rank + 1}
                                </span>
                              )}
                              {p.label}
                            </Button>
                          );
                        })}
                      </div>
                      {patientIntents.length >= 3 && (
                        <p className="text-[11px] text-muted-foreground">Máximo de 3 tipos selecionados</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 text-xs font-medium text-muted-foreground">Idade:</span>
                        {AGE_RANGES.map((r) => {
                          const isAll = r === "Todos";
                          const isActive = isAll
                            ? ageRanges.length === 0
                            : ageRanges.includes(r);
                          return (
                            <Button
                              key={r}
                              variant={isActive ? "pill-active" : "pill"}
                              size="sm"
                              onClick={() => {
                                if (isAll) {
                                  setAgeRanges([]);
                                } else {
                                  setAgeRanges(prev =>
                                    prev.includes(r) ? prev.filter(v => v !== r) : [...prev, r]
                                  );
                                }
                              }}
                            >
                              {r}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-border/60" />

                    {/* Group 3: Formato */}
                    <div className="space-y-2.5 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Formato
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {!batchMode && CONTENT_TYPES.map((ct) => (
                          <Button
                            key={ct.value}
                            variant={contentType === ct.value ? "pill-active" : "pill"}
                            size="sm"
                            onClick={() => setContentType(ct.value)}
                          >
                            {ct.label}
                          </Button>
                        ))}
                        <button
                          onClick={() => { setBatchMode(b => !b); setResult(null); setBatchResults(null); }}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            batchMode
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Layers className="h-3.5 w-3.5" />
                          {batchMode ? 'Todos os 3 formatos' : 'Gerar tudo'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Usage bar */}
                  {planInfo && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={usagePercent >= 90 ? 'font-semibold text-amber-600' : ''}>
                          {getUsageMessage(planInfo.generationCount, planInfo.planLimit)}
                        </span>
                        {(!isPaid || planInfo.plan !== "pro") && (
                          <button onClick={() => setShowPricing(true)} className="font-semibold text-primary hover:underline">
                            {isPaid ? "Mudar plano" : "Fazer upgrade"}
                          </button>
                        )}
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          role="progressbar"
                          aria-valuenow={Math.round(usagePercent)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Uso mensal de gerações"
                          className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-amber-500' : 'bg-primary'}`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Benchmark */}
                  {planInfo && (
                    <BenchmarkWidget vertical={vertical} userCount={planInfo.generationCount} />
                  )}

                  {/* CTA */}
                  {planInfo && !planInfo.canGenerate ? (
                    <Button variant="cta" size="xl" className="w-full" onClick={() => setShowPricing(true)}>
                      <Zap className="h-5 w-5" /> Limite atingido. Fazer upgrade
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="cta"
                        size="xl"
                        className="flex-1"
                        onClick={handleGenerate}
                        disabled={!idea.trim() || loading}
                      >
                        {loading ? (
                          <><Loader2 className="h-5 w-5 animate-spin" /> {batchMode ? "Gerando 3 formatos..." : "Gerando..."}</>
                        ) : (
                          <><Sparkles className="h-5 w-5" /> {(result || batchResults) ? "Gerar novamente" : batchMode ? "Gerar carrossel + post + story" : "Gerar conteúdo"}</>
                        )}
                      </Button>
                      {(result || batchResults) && !loading && (
                        <Button
                          variant="outline"
                          size="xl"
                          onClick={() => { setResult(null); setBatchResults(null); setCompliance(null); setIdea(""); }}
                          title="Novo conteúdo"
                        >
                          <Sparkles className="h-5 w-5" /> Novo
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Empty state guidance */}
                {!result && !batchResults && !isStreaming && !loading && totalGenerations === 0 && (
                  <div className="mt-10 flex w-full flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center md:mt-14">
                    <Sparkles className="mb-3 h-8 w-8 text-primary/30" />
                    <p className="text-sm font-semibold text-foreground">
                      Nenhum conteúdo gerado ainda
                    </p>
                    <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
                      Escolha um tema acima ou digite o seu para começar. O ContentFlow cria carrosseis, posts e stories prontos para o Instagram.
                    </p>
                  </div>
                )}

                {/* Streaming skeleton */}
                {isStreaming && (
                  <div ref={resultRef} className="mt-10 w-full md:mt-14">
                    <div className="rounded-2xl border border-primary/20 bg-card p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                        </span>
                        <span className="text-sm font-medium text-foreground">IA escrevendo...</span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-muted" />
                        <div className="h-3.5 w-full animate-pulse rounded-lg bg-muted" />
                        <div className="h-3.5 w-5/6 animate-pulse rounded-lg bg-muted" />
                        <div className="h-3.5 w-4/5 animate-pulse rounded-lg bg-muted" />
                        <div className="mt-4 h-3.5 w-2/3 animate-pulse rounded-lg bg-muted" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Single output */}
                {result && (
                  <div ref={resultRef} className="mt-10 w-full space-y-6 md:mt-14">
                    {result.type === "carousel" && (
                      <CarouselOutput slides={result.slides} caption={result.caption} handle={instagramHandle} />
                    )}
                    {result.type === "post" && (
                      <PostOutput hook={result.hook} body={result.body} cta={result.cta} handle={instagramHandle} />
                    )}
                    {result.type === "story" && <StoryOutput script={result.script} />}
                    {compliance && <ContentValidator compliance={compliance} />}
                    <FeedbackBar contentKey={`${idea}-${result.type}`} />
                  </div>
                )}

                {/* Batch output */}
                {batchResults && (
                  <div ref={resultRef} className="mt-10 w-full space-y-8 md:mt-14">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Layers className="h-4 w-4 text-primary" />
                      3 formatos gerados para o mesmo tema
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Carrossel</p>
                      <CarouselOutput slides={batchResults.carousel.slides} caption={batchResults.carousel.caption} handle={instagramHandle} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Post</p>
                      <PostOutput hook={batchResults.post.hook} body={batchResults.post.body} cta={batchResults.post.cta} handle={instagramHandle} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Story</p>
                      <StoryOutput script={batchResults.story.script} />
                    </div>
                    {compliance && <ContentValidator compliance={compliance} />}
                    <FeedbackBar contentKey={`${idea}-batch`} />
                  </div>
                )}

              </div>
            </main>
          )}
        </div>

      </div>

      <Suspense fallback={null}>
        {planInfo?.isBlocked && !showPricing && <BillingWall reason={planInfo.blockReason ?? 'trial_expired'} />}
        {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
        {showTemplates && (
          <TemplatesModal
            activeVertical={vertical}
            onSelect={(topic, ct) => { setIdea(topic); setContentType(ct); }}
            onClose={() => setShowTemplates(false)}
          />
        )}
        {showOnboarding && (
          <OnboardingModal
            onComplete={(v, suggestedTopic) => {
              setVertical(v);
              setShowOnboarding(false);
              setOnboardingComplete(true);
              localStorage.setItem('cf_onboarding_done', 'true');
              if (suggestedTopic) {
                setIdea(suggestedTopic);
                toast.success('Tema sugerido preenchido. Clique em Gerar conteúdo para começar!');
              }
            }}
            onShowPricing={(v) => {
              setVertical(v);
              setShowOnboarding(false);
              setShowPricing(true);
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Index;
