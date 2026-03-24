import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "bezerra@belvy.com.br";

const VERTICAL_LABELS: Record<string, string> = {
  doctor: "Medicina",
  nutritionist: "Nutrição",
  dentist: "Odontologia",
  psychologist: "Psicologia",
};

const PLAN_COLORS: Record<string, string> = {
  starter: "#3d6b52",
  growth: "#5a8a6a",
  pro: "#c8ddd0",
  free: "#e5e7eb",
};

const PLAN_BADGE_CLASSES: Record<string, string> = {
  starter: "bg-green-100 text-green-800",
  growth: "bg-emerald-100 text-emerald-800",
  pro: "bg-teal-100 text-teal-800",
  free: "bg-gray-100 text-gray-500",
};

function fmtDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function fmtBRL(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  return `${days}d atrás`;
}

interface StatsData {
  users: {
    total: number;
    paying: number;
    inTrial: number;
    churned: number;
    cancelingCount: number;
    churnRate: number;
    conversionRate: number;
    byPlan: Record<string, number>;
    byVertical: Record<string, number>;
    growth: { date: string; novos: number; total: number }[];
    recent: { email: string; plan: string; vertical: string; joinedAt: string }[];
  };
  content: {
    total: number;
    byType: Record<string, number>;
    growth: { date: string; count: number }[];
    geracoes30d: number;
  };
  financeiro: {
    mrr: number;
    arpu: number;
    custos: {
      anthropic: number;
      stripe: number;
      infraestrutura: number;
      total: number;
    };
    lucro: number;
    margem: number;
  };
  activation: {
    activationRate: number;
    avgDaysToFirstGeneration: number | null;
    generationsPerActiveUser: number;
    activeUsers: number;
  };
  cohorts: {
    month: string;
    label: string;
    total: number;
    paying: number;
    churned: number;
    free: number;
    retentionRate: number;
  }[];
  cancelSurveys: {
    byReason: Record<string, number>;
    reasonLabels: Record<string, string>;
    recent: { reason: string; comment: string | null; createdAt: string }[];
  };
  mrr: number;
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ProtectedRoute guarantees user is set when this component mounts.
  // Run only once — no dependency on user/navigate to avoid stale redirects.
  useEffect(() => {
    if (!user) { navigate("/app"); return; }
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      navigate("/app");
      return;
    }

    async function fetchStats() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessão expirada. Faça login novamente.");

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          }
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Carregando métricas…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm text-destructive">Erro: {error}</p>
          <Button className="mt-4" onClick={() => navigate("/app")}>Voltar</Button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { financeiro } = stats;
  const isProfit = financeiro.lucro >= 0;

  const pieData = Object.entries(stats.users.byPlan)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const verticalData = Object.entries(stats.users.byVertical).map(([key, value]) => ({
    name: VERTICAL_LABELS[key] ?? key,
    value,
  }));

  const custoData = [
    { name: "Anthropic", value: financeiro.custos.anthropic, color: "#f59e0b" },
    { name: "Stripe", value: financeiro.custos.stripe, color: "#6366f1" },
    { name: "Infraestrutura", value: financeiro.custos.infraestrutura, color: "#94a3b8" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-8">

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/app")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Painel de Métricas</h1>
      </div>

      {/* KPIs — Usuários */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usuários</p>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.users.total}</p>
          {stats.users.inTrial > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{stats.users.inTrial} em trial</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pagantes</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-bold text-foreground">{stats.users.paying}</p>
            <span className="mb-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {stats.users.conversionRate}%
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">taxa de conversão</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ARPU</p>
          <p className="mt-2 text-3xl font-bold text-foreground">R$ {fmtBRL(financeiro.arpu)}</p>
          <p className="mt-1 text-xs text-muted-foreground">receita por usuário pagante</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gerações (30d)</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.content.geracoes30d}</p>
          <div className="mt-1 flex gap-2 flex-wrap">
            {Object.entries(stats.content.byType).map(([type, count]) => (
              <span key={type} className="text-xs text-muted-foreground">{count} {type}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm col-span-2 lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Churn</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-3xl font-bold text-foreground">{stats.users.churned}</p>
            <span className="mb-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
              {stats.users.churnRate}% churn
            </span>
            {stats.users.cancelingCount > 0 && (
              <span className="mb-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                {stats.users.cancelingCount} cancelando
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            cancelados acumulado · {stats.users.cancelingCount > 0 ? `${stats.users.cancelingCount} ainda com acesso ativo` : 'nenhum cancelamento pendente'}
          </p>
        </div>
      </div>

      {/* KPIs — Financeiro */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financeiro</p>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MRR</p>
          <p className="mt-2 text-3xl font-bold text-foreground">R$ {fmtBRL(financeiro.mrr)}</p>
          <p className="mt-1 text-xs text-muted-foreground">receita mensal recorrente</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custos totais</p>
          <p className="mt-2 text-3xl font-bold text-foreground">R$ {fmtBRL(financeiro.custos.total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Anthropic + Stripe + infra</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lucro líquido</p>
          <div className="mt-2 flex items-end gap-2">
            <p className={`text-3xl font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
              R$ {fmtBRL(financeiro.lucro)}
            </p>
            {isProfit
              ? <TrendingUp className="mb-1 h-4 w-4 text-primary" />
              : <TrendingDown className="mb-1 h-4 w-4 text-destructive" />
            }
          </div>
          <p className="mt-1 text-xs text-muted-foreground">MRR menos custos</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Margem</p>
          <p className={`mt-2 text-3xl font-bold ${financeiro.margem >= 50 ? "text-primary" : financeiro.margem >= 0 ? "text-foreground" : "text-destructive"}`}>
            {financeiro.margem}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${isProfit ? "bg-primary" : "bg-destructive"}`}
              style={{ width: `${Math.min(100, Math.max(0, financeiro.margem))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Crescimento de usuários
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.users.growth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d6b52" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3d6b52" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5a8a6a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5a8a6a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip labelFormatter={fmtDate} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#3d6b52" fill="url(#colorTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="novos" name="Novos" stroke="#5a8a6a" fill="url(#colorNovos)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gerações por dia
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.content.growth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip labelFormatter={fmtDate} contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Gerações" fill="#3d6b52" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Distribuição por plano */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Distribuição por plano
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={PLAN_COLORS[entry.name] ?? "#e5e7eb"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => {
                  const total = pieData.reduce((s, d) => s + d.value, 0)
                  const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0
                  return [`${value} (${pct}%)`, name]
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.name] ?? "#e5e7eb" }} />
                <span className="text-xs capitalize text-muted-foreground">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por vertical */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por vertical</p>
          {verticalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={verticalData} margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Usuários" fill="#5a8a6a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados de vertical ainda.</p>
          )}
        </div>

        {/* Breakdown de custos */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Breakdown de custos
          </p>
          <div className="space-y-3">
            {custoData.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">R$ {fmtBRL(item.value)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: financeiro.custos.total > 0 ? `${(item.value / financeiro.custos.total) * 100}%` : "0%",
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs font-semibold text-foreground">Total de custos</span>
              <span className="text-sm font-bold text-foreground">R$ {fmtBRL(financeiro.custos.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">MRR</span>
              <span className="text-sm font-bold text-primary">R$ {fmtBRL(financeiro.mrr)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Lucro</span>
              <span className={`text-sm font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
                R$ {fmtBRL(financeiro.lucro)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Últimos cadastros */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Últimos cadastros</p>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.users.recent.map((u, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground" title={u.email}>
                  {u.email.length > 24 ? u.email.slice(0, 22) + "…" : u.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {u.vertical ? (VERTICAL_LABELS[u.vertical] ?? u.vertical) : "—"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${PLAN_BADGE_CLASSES[u.plan] ?? "bg-gray-100 text-gray-500"}`}>
                  {u.plan}
                </span>
                <span className="text-[10px] text-muted-foreground">{relativeDate(u.joinedAt)}</span>
              </div>
            </div>
          ))}
          {stats.users.recent.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum cadastro ainda.</p>
          )}
        </div>
      </div>

      {/* Analytics de ativação */}
      <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ativação</p>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Taxa de ativação</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.activation.activationRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">usuários com ≥1 geração</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usuários ativos</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.activation.activeUsers}</p>
          <p className="mt-1 text-xs text-muted-foreground">geraram ao menos 1 conteúdo</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tempo até 1ª geração</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {stats.activation.avgDaysToFirstGeneration != null
              ? `${stats.activation.avgDaysToFirstGeneration}d`
              : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">média de dias após cadastro</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gerações / usuário ativo</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{stats.activation.generationsPerActiveUser}</p>
          <p className="mt-1 text-xs text-muted-foreground">média acumulada</p>
        </div>
      </div>

      {/* Cohort dashboard */}
      {stats.cohorts.length > 0 && (
        <>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cohort por mês de cadastro</p>
          <div className="mb-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Mês</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Cadastros</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Pagantes</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Free/Trial</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Churned</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.cohorts].reverse().map((c) => (
                  <tr key={c.month} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{c.label}</td>
                    <td className="px-4 py-2.5 text-right text-foreground">{c.total}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="font-semibold text-primary">{c.paying}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{c.free}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{c.churned}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${
                        c.retentionRate >= 30
                          ? "bg-primary/10 text-primary"
                          : c.retentionRate > 0
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {c.retentionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Cancel surveys */}
      {(stats.cancelSurveys.recent.length > 0 || Object.values(stats.cancelSurveys.byReason).some(v => v > 0)) && (
        <>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Motivos de cancelamento</p>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold text-muted-foreground">Por motivo</p>
              <div className="space-y-2">
                {Object.entries(stats.cancelSurveys.byReason)
                  .filter(([, v]) => v > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([reason, count]) => {
                    const total = Object.values(stats.cancelSurveys.byReason).reduce((s, v) => s + v, 0)
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={reason}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">
                            {stats.cancelSurveys.reasonLabels[reason] ?? reason}
                          </span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold text-muted-foreground">Respostas recentes</p>
              <div className="space-y-3">
                {stats.cancelSurveys.recent.map((s, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {stats.cancelSurveys.reasonLabels[s.reason] ?? s.reason}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{relativeDate(s.createdAt)}</span>
                    </div>
                    {s.comment && (
                      <p className="mt-1 text-xs text-muted-foreground">"{s.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
