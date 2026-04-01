import { useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Loader2, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Vertical = "doctor" | "nutritionist" | "dentist" | "psychologist";

const VERTICALS: { value: Vertical; label: string; council: string }[] = [
  { value: "doctor", label: "Medicina", council: "CFM" },
  { value: "nutritionist", label: "Nutrição", council: "CFN" },
  { value: "dentist", label: "Odontologia", council: "CFO" },
  { value: "psychologist", label: "Psicologia", council: "CFP" },
];

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

function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const isCritical = issue.severity === "critical";

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all",
        isCritical
          ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
          : "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
      )}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
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
                isCritical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
              )}
            >
              {isCritical ? "Crítico" : "Atenção"}
            </span>
            <span className="text-xs text-muted-foreground truncate">{issue.rule}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
            &ldquo;{issue.excerpt}&rdquo;
          </p>
        </div>
        <span className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground">{issue.explanation}</p>

          {/* Diff card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-red-200 bg-white dark:bg-red-950/30 dark:border-red-800 p-3">
              <p className="mb-1.5 text-xs font-semibold text-red-500 uppercase tracking-wide">Original</p>
              <p className="text-foreground leading-relaxed">&ldquo;{issue.excerpt}&rdquo;</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-white dark:bg-green-950/30 dark:border-green-800 p-3">
              <p className="mb-1.5 text-xs font-semibold text-green-600 uppercase tracking-wide">Sugestão</p>
              <p className="text-foreground leading-relaxed">{issue.rewrite}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComplianceAnalyzer() {
  const { user } = useAuth();
  const [vertical, setVertical] = useState<Vertical>("doctor");
  const [postText, setPostText] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [showImageDesc, setShowImageDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const charCount = postText.length;
  const isReady = postText.trim().length > 20;

  async function handleAnalyze() {
    if (!isReady || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/analyze-compliance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          text: postText,
          vertical,
          imageDescription: showImageDesc && imageDescription.trim() ? imageDescription.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erro desconhecido");
      }

      const data: AnalysisResult = await res.json();
      setResult(data);

      // Scroll to result
      setTimeout(() => {
        document.getElementById("compliance-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao analisar post. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const criticalCount = result?.issues.filter((i) => i.severity === "critical").length ?? 0;
  const warningCount = result?.issues.filter((i) => i.severity === "warning").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Analisador de Compliance</h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Cole o texto do seu post (ou de uma agência) e receba uma análise detalhada das normas do seu conselho profissional, com sugestões de reescrita para cada trecho problemático.
          </p>
        </div>

        {/* Vertical selector */}
        <div className="mb-6">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conselho</p>
          <div className="flex flex-wrap gap-2">
            {VERTICALS.map((v) => (
              <button
                key={v.value}
                onClick={() => setVertical(v.value)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
                  vertical === v.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {v.label}
                <span className="ml-1.5 text-xs opacity-70">{v.council}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Texto do post</p>
            <span className={cn("text-xs tabular-nums", charCount > 2200 ? "text-destructive" : "text-muted-foreground")}>
              {charCount.toLocaleString()} caracteres
            </span>
          </div>
          <Textarea
            placeholder="Cole aqui o texto completo do post que deseja analisar..."
            className="min-h-[200px] resize-y text-sm leading-relaxed"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
        </div>

        {/* Image description toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowImageDesc((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{showImageDesc ? "− " : "+ "}</span>
            Adicionar descrição de imagem (opcional)
          </button>

          {showImageDesc && (
            <Textarea
              placeholder="Descreva a imagem que acompanha o post (ex: foto de antes/depois, imagem de uma balança, etc.)..."
              className="mt-2 min-h-[80px] resize-none text-sm"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
            />
          )}
        </div>

        {/* CTA */}
        <Button
          onClick={handleAnalyze}
          disabled={!isReady || loading}
          className="w-full gap-2 py-6 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Analisar Compliance
            </>
          )}
        </Button>

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
          <div id="compliance-result" className="mt-8 space-y-6">
            {/* Status banner */}
            <div
              className={cn(
                "flex items-start gap-4 rounded-xl border p-5",
                result.approved
                  ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {result.approved ? (
                  <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                ) : (
                  <ShieldAlert className="h-7 w-7 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-base font-semibold",
                      result.approved ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    )}
                  >
                    {result.approved ? "Post aprovado" : "Problemas encontrados"}
                  </span>
                  <span className="rounded-full border border-current/30 px-2 py-0.5 text-xs font-semibold opacity-80">
                    {result.council}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{result.summary}</p>

                {/* Counters */}
                {!result.approved && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {criticalCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {criticalCount} {criticalCount === 1 ? "violação crítica" : "violações críticas"}
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {warningCount} {warningCount === 1 ? "alerta" : "alertas"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Problemas identificados
                </p>
                {result.issues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} index={i} />
                ))}
              </div>
            )}

            {/* Approved aspects */}
            {result.approved_aspects?.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20 p-4">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                  Aspectos aprovados
                </p>
                <ul className="space-y-1.5">
                  {result.approved_aspects.map((aspect, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
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
                  setImageDescription("");
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
    </div>
  );
}
