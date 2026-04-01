import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Lock,
  Upload,
  X,
  Stethoscope,
  Smile,
  Brain,
  Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PricingModal = lazy(() => import("@/components/PricingModal"));

type Vertical = "doctor" | "dentist" | "psychologist" | "nutritionist";

const VERTICALS: {
  value: Vertical;
  label: string;
  council: string;
  description: string;
  icon: typeof Stethoscope;
}[] = [
  {
    value: "doctor",
    label: "Medicina",
    council: "CFM",
    description: "Resolucao CFM 1974/2011",
    icon: Stethoscope,
  },
  {
    value: "dentist",
    label: "Odontologia",
    council: "CFO",
    description: "Codigo de Etica Odontologica",
    icon: Smile,
  },
  {
    value: "psychologist",
    label: "Psicologia",
    council: "CFP",
    description: "Resolucao CFP 11/2012",
    icon: Brain,
  },
  {
    value: "nutritionist",
    label: "Nutrição",
    council: "CFN",
    description: "Codigo de Etica do Nutricionista",
    icon: Apple,
  },
];

const COMPLIANCE_MONTHLY_LIMIT = 50;

type Severity = "critical" | "warning";

interface Issue {
  severity: Severity;
  excerpt: string;
  rule: string;
  explanation: string;
  rewrite: string;
}

interface AnalysisResult {
  approved: boolean;
  council: string;
  summary: string;
  issues: Issue[];
  approved_aspects: string[];
}

// ── Issue Card ───────────────────────────────────────────────────────────────

function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const isCritical = issue.severity === "critical";

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all",
        isCritical
          ? "border-red-200 bg-red-50/50"
          : "border-amber-200 bg-amber-50/50"
      )}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
            isCritical ? "bg-red-500" : "bg-amber-500"
          )}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                isCritical ? "text-red-600" : "text-amber-600"
              )}
            >
              {isCritical ? "Critico" : "Atencao"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {issue.rule}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground line-clamp-2">
            &ldquo;{issue.excerpt}&rdquo;
          </p>
        </div>
        <span className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {issue.explanation}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-red-200 bg-white p-3">
              <p className="mb-1.5 text-xs font-semibold text-red-500 uppercase tracking-wide">
                Original
              </p>
              <p className="text-foreground leading-relaxed">
                &ldquo;{issue.excerpt}&rdquo;
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-white p-3">
              <p className="mb-1.5 text-xs font-semibold text-green-600 uppercase tracking-wide">
                Sugestao de reescrita
              </p>
              <p className="text-foreground leading-relaxed">{issue.rewrite}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pro Gate Overlay ─────────────────────────────────────────────────────────

function ProGateOverlay({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md rounded-2xl" />
      <div className="relative z-10 text-center max-w-sm px-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Disponivel no plano Pro
        </h3>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Analise seus posts antes de publicar e evite problemas com o seu
          conselho profissional.
        </p>
        <Button onClick={onUpgrade} className="gap-2" size="lg">
          <ShieldCheck className="h-4 w-4" />
          Fazer upgrade para Pro
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ComplianceAnalyzer() {
  const { user } = useAuth();
  const { planInfo } = usePlan();
  const [vertical, setVertical] = useState<Vertical>("doctor");
  const [postText, setPostText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [monthlyUsage, setMonthlyUsage] = useState<number | null>(null);

  const isPro = planInfo?.plan === "pro";
  const charCount = postText.length;
  const isReady = postText.trim().length > 20;
  const creditsRemaining =
    monthlyUsage !== null ? COMPLIANCE_MONTHLY_LIMIT - monthlyUsage : null;
  const hasCredits = creditsRemaining === null || creditsRemaining > 0;

  // Fetch monthly usage count
  const fetchUsage = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count, error } = await supabase
      .from("compliance_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth);

    if (!error && count !== null) {
      setMonthlyUsage(count);
    }
  }, [user]);

  useEffect(() => {
    if (isPro) fetchUsage();
  }, [isPro, fetchUsage]);

  // Handle image selection
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("Imagem muito grande. Maximo 500KB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo invalido. Envie uma imagem.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleAnalyze() {
    if (!isReady || loading || !isPro || !hasCredits) return;

    setLoading(true);
    setResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessao expirada. Faca login novamente.");
        return;
      }

      // Prepare image data if present
      let imageData: string | undefined;
      let imageMediaType: string | undefined;
      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        imageData = btoa(binary);
        imageMediaType = imageFile.type;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/analyze-compliance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            text: postText,
            vertical,
            ...(imageData ? { imageData, imageMediaType } : {}),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erro desconhecido");
      }

      const data: AnalysisResult = await res.json();
      setResult(data);

      // Update usage count
      setMonthlyUsage((prev) => (prev !== null ? prev + 1 : 1));

      setTimeout(() => {
        document
          .getElementById("compliance-result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao analisar post. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const criticalCount =
    result?.issues.filter((i) => i.severity === "critical").length ?? 0;
  const warningCount =
    result?.issues.filter((i) => i.severity === "warning").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <TopBar onUpgrade={() => setShowPricing(true)} />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Analisador de Compliance
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Analise se seu conteudo esta de acordo com as normas do seu conselho
            profissional. Cole o texto, escolha sua area e receba uma analise
            detalhada com sugestoes de reescrita.
          </p>

          {/* Credit counter for Pro users */}
          {isPro && creditsRemaining !== null && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {creditsRemaining}{" "}
                {creditsRemaining === 1 ? "analise restante" : "analises restantes"}{" "}
                este mes
              </span>
              <span className="text-xs text-muted-foreground">
                / {COMPLIANCE_MONTHLY_LIMIT}
              </span>
            </div>
          )}
        </div>

        {/* Analyzer form wrapper with Pro gate */}
        <div className="relative">
          {!isPro && <ProGateOverlay onUpgrade={() => setShowPricing(true)} />}

          <div className={cn("space-y-6", !isPro && "pointer-events-none select-none")}>
            {/* Vertical selector cards */}
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">
                Selecione seu conselho
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VERTICALS.map((v) => {
                  const Icon = v.icon;
                  const selected = vertical === v.value;
                  return (
                    <button
                      key={v.value}
                      onClick={() => setVertical(v.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all text-center",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm"
                          : "border-border bg-transparent hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                          selected
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            selected
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          {v.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {v.council}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Texto do post
                </label>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    charCount > 2200
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {charCount.toLocaleString()} caracteres
                </span>
              </div>
              <Textarea
                placeholder="Cole aqui o texto completo do post que deseja analisar..."
                className="min-h-[180px] resize-y text-sm leading-relaxed"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              {postText.length > 0 && postText.trim().length <= 20 && (
                <p className="text-xs text-muted-foreground">
                  Minimo de 20 caracteres para analise.
                </p>
              )}
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Imagem do post{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>

              {!imagePreview ? (
                <label
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 transition-colors",
                    "hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para enviar uma imagem
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    JPG ou PNG, maximo 500KB
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 rounded-lg border border-border object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
                    title="Remover imagem"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* CTA button */}
            <Button
              onClick={handleAnalyze}
              disabled={!isReady || loading || !hasCredits}
              className="w-full gap-2 py-6 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analisando...
                </>
              ) : !hasCredits ? (
                <>
                  <Lock className="h-5 w-5" />
                  Limite mensal atingido
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Analisar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 space-y-3 animate-pulse">
            <div className="h-20 rounded-xl bg-muted" />
            <div className="h-32 rounded-xl bg-muted" />
            <div className="h-32 rounded-xl bg-muted" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div id="compliance-result" className="mt-10 space-y-6">
            {/* Status banner */}
            <div
              className={cn(
                "flex items-start gap-4 rounded-xl border p-5",
                result.approved
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {result.approved ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <ShieldAlert className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={cn(
                      "text-lg font-semibold",
                      result.approved ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {result.approved
                      ? "Post aprovado"
                      : "Problemas encontrados"}
                  </span>
                  <span className="rounded-full border border-current/20 px-2.5 py-0.5 text-xs font-semibold opacity-80">
                    {result.council}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>

                {!result.approved && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {criticalCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {criticalCount}{" "}
                        {criticalCount === 1
                          ? "violacao critica"
                          : "violacoes criticas"}
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {warningCount}{" "}
                        {warningCount === 1 ? "alerta" : "alertas"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Problemas identificados
                </p>
                {result.issues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} index={i} />
                ))}
              </div>
            )}

            {/* Approved aspects */}
            {result.approved_aspects?.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-5">
                <p className="mb-3 text-sm font-semibold text-green-700">
                  Aspectos aprovados
                </p>
                <ul className="space-y-2">
                  {result.approved_aspects.map((aspect, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {aspect}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analyze another */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setResult(null);
                  setPostText("");
                  removeImage();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Analisar outro post
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Pricing modal */}
      <Suspense fallback={null}>
        {showPricing && (
          <PricingModal onClose={() => setShowPricing(false)} />
        )}
      </Suspense>
    </div>
  );
}
