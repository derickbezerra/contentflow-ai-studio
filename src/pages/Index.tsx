import { useState, useEffect } from "react";
import { Sparkles, Loader2, Zap, LayoutGrid, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import CarouselOutput from "@/components/CarouselOutput";
import PostOutput from "@/components/PostOutput";
import StoryOutput from "@/components/StoryOutput";
import PricingModal from "@/components/PricingModal";
import OnboardingModal from "@/components/OnboardingModal";
import BillingWall from "@/components/BillingWall";
import { usePlan, FREE_LIMIT } from "@/hooks/usePlan";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import TrendingTopics from "@/components/TrendingTopics";
import TemplatesModal from "@/components/TemplatesModal";
import BenchmarkWidget from "@/components/BenchmarkWidget";
import { useLocation } from "react-router-dom";

type ContentType = "carousel" | "post" | "story";
type Vertical = "doctor" | "nutritionist" | "dentist" | "psychologist";
type Gender = "male" | "female" | "both";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeneratedResult = { type: ContentType } & Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BatchResults = { carousel: Record<string, any>; post: Record<string, any>; story: Record<string, any> };

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [idea, setIdea] = useState("");
  const [contentType, setContentType] = useState<ContentType>("carousel");
  const [vertical, setVertical] = useState<Vertical>("doctor");
  const [gender, setGender] = useState<Gender>("both");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchResults | null>(null);
  const { planInfo, setPlanInfo, refetch } = usePlan();

  // Check if user needs onboarding
  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('vertical, instagram_handle, onboarding_goal')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.vertical || !data?.onboarding_goal) {
          setShowOnboarding(true);
        } else {
          setVertical(data.vertical as Vertical);
        }
        if (data?.instagram_handle) {
          setInstagramHandle(data.instagram_handle);
        }
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

  // Show success toast if redirected from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Assinatura confirmada! Bem-vindo ao ContentFlow.");
      window.history.replaceState({}, "", "/app");
      setTimeout(() => refetch(), 3000);
    }
  }, [refetch]);

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

      const body = batchMode
        ? { topic: idea, vertical, gender, batch: true }
        : { topic: idea, content_type: contentType, vertical, gender };

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        }
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

      // Update local counter from server response
      if (typeof data.new_count === 'number') {
        setPlanInfo(prev => prev ? {
          ...prev,
          generationCount: data.new_count,
          canGenerate: data.new_count < prev.planLimit,
        } : prev);
      }

      if (data.batch) {
        setBatchResults(data.outputs);
        if (user) {
          await supabase.from("content").insert([
            { user_id: user.id, type: "carousel", input: idea, output_json: data.outputs.carousel },
            { user_id: user.id, type: "post",     input: idea, output_json: data.outputs.post },
            { user_id: user.id, type: "story",    input: idea, output_json: data.outputs.story },
          ]);
        }
      } else {
        setResult({ type: contentType, ...data.output });
        if (user) {
          await supabase.from("content").insert({
            user_id: user.id,
            type: contentType,
            input: idea,
            output_json: data.output,
          });
        }
      }
    } catch (err: unknown) {
      toast.error("Erro ao gerar conteúdo. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

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

      <main className="relative flex flex-1 flex-col items-center px-4 pb-16 pt-8 md:pt-16">
        {/* Trial banner */}
        {planInfo?.isInTrial && (
          <div className="mb-6 flex w-full max-w-xl items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
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
          <div className="mb-6 flex w-full max-w-xl items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5">
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
        <div className="mb-8 animate-fade-in text-center md:mb-12">
          <svg className="mx-auto mb-3" width="52" height="52" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 16 C9 10, 17 22, 24 16 C31 10, 39 22, 46 16 L46 23 C39 29, 31 17, 24 23 C17 29, 9 17, 2 23 Z" fill="hsl(var(--primary) / 0.18)"/>
            <path d="M4 26 C10 20, 17 32, 24 26 C31 20, 38 32, 44 26 L44 33 C38 39, 31 27, 24 33 C17 39, 10 27, 4 33 Z" fill="hsl(var(--primary) / 0.55)"/>
            <path d="M6 36 C12 30, 18 42, 24 36 C30 30, 36 42, 42 36 L42 43 C36 49, 30 37, 24 43 C18 49, 12 37, 6 43 Z" fill="hsl(var(--primary))"/>
          </svg>
          {!result && !loading && (
            <p className="text-sm text-muted-foreground">
              Transforme qualquer ideia em conteúdo pronto para postar
            </p>
          )}
        </div>

        {/* Input area */}
        <div className="w-full max-w-xl animate-fade-up space-y-4">

          {/* Trending topics + Templates (button rendered inside header row) */}
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
            <textarea
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
              className="w-full resize-none bg-transparent px-5 py-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          {/* Instagram handle */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors focus-within:border-primary/40">
            <span className="text-sm font-medium text-muted-foreground">@</span>
            <input
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              onBlur={async () => {
                if (!user) return;
                await supabase.from('users').update({ instagram_handle: instagramHandle }).eq('id', user.id);
              }}
              placeholder="seu.perfil.instagram"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          {/* Perfil */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Perfil:</span>
            {VERTICALS.map((v) => (
              <Button key={v.value} variant={vertical === v.value ? "pill-active" : "pill"} size="sm" onClick={() => setVertical(v.value)}>
                {v.label}
              </Button>
            ))}
          </div>

          {/* Público */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Público:</span>
            {GENDERS.map((g) => (
              <Button key={g.value} variant={gender === g.value ? "pill-active" : "pill"} size="sm" onClick={() => setGender(g.value)}>
                {g.label}
              </Button>
            ))}
          </div>

          {/* Tipo */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo:</span>
            {!batchMode && CONTENT_TYPES.map((ct) => (
              <Button key={ct.value} variant={contentType === ct.value ? "pill-active" : "pill"} size="sm" onClick={() => setContentType(ct.value)}>
                {ct.label}
              </Button>
            ))}
            <button
              onClick={() => { setBatchMode(b => !b); setResult(null); setBatchResults(null); }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                batchMode
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              {batchMode ? 'Todos os 3 formatos' : 'Gerar tudo'}
            </button>
          </div>

          {/* Usage bar */}
          {planInfo && (
            <div className="space-y-1.5 px-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{planInfo.generationCount} / {planInfo.planLimit} gerações este mês</span>
                {(!isPaid || planInfo.plan !== "pro") && (
                  <button onClick={() => setShowPricing(true)} className="font-semibold text-primary hover:underline">
                    {isPaid ? "Upgrade de plano" : "Fazer upgrade"}
                  </button>
                )}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
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
                  onClick={() => { setResult(null); setBatchResults(null); setIdea(""); }}
                  title="Novo conteúdo"
                >
                  <Sparkles className="h-5 w-5" /> Novo
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Single output */}
        {result && (
          <div className="mt-10 w-full max-w-xl space-y-6 md:mt-14">
            {result.type === "carousel" && (
              <CarouselOutput slides={result.slides} caption={result.caption} handle={instagramHandle} />
            )}
            {result.type === "post" && (
              <PostOutput hook={result.hook} body={result.body} cta={result.cta} handle={instagramHandle} />
            )}
            {result.type === "story" && <StoryOutput script={result.script} />}
          </div>
        )}

        {/* Batch output */}
        {batchResults && (
          <div className="mt-10 w-full max-w-xl space-y-8 md:mt-14">
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
          </div>
        )}
      </main>

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
          onComplete={(v) => {
            setVertical(v);
            setShowOnboarding(false);
          }}
          onShowPricing={(v) => {
            setVertical(v);
            setShowOnboarding(false);
            setShowPricing(true);
          }}
        />
      )}
    </div>
  );
};

export default Index;
