import { useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, ChevronDown, ChevronUp } from "lucide-react";

export interface Compliance {
  approved: boolean;
  council: "CFM" | "CFO" | "CFP" | "CFN";
  issues: string[];
  warnings: string[];
}

const COUNCIL_NAMES: Record<string, string> = {
  CFM: "Conselho Federal de Medicina",
  CFO: "Conselho Federal de Odontologia",
  CFP: "Conselho Federal de Psicologia",
  CFN: "Conselho Federal de Nutrição",
};

const ContentValidator = ({ compliance }: { compliance: Compliance }) => {
  const [expanded, setExpanded] = useState(false);

  const hasIssues = compliance.issues.length > 0;
  const hasWarnings = compliance.warnings.length > 0;
  const hasDetails = hasIssues || hasWarnings;

  const status = hasIssues ? "error" : hasWarnings ? "warning" : "ok";

  const config = {
    ok: {
      icon: ShieldCheck,
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      iconColor: "text-emerald-500",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      label: "Aprovado pelo",
    },
    warning: {
      icon: ShieldAlert,
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      iconColor: "text-amber-500",
      badgeBg: "bg-amber-500/10",
      badgeText: "text-amber-600 dark:text-amber-400",
      label: "Aprovado com ressalvas",
    },
    error: {
      icon: ShieldX,
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      iconColor: "text-red-500",
      badgeBg: "bg-red-500/10",
      badgeText: "text-red-600 dark:text-red-400",
      label: "Verificar antes de publicar",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} px-4 py-3`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon className={`h-4 w-4 shrink-0 ${config.iconColor}`} />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold text-foreground">
              {config.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}>
              {compliance.council}
            </span>
          </div>
        </div>

        {hasDetails && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {expanded ? "Fechar" : "Ver detalhes"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {!hasDetails && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Conteúdo dentro das diretrizes do {COUNCIL_NAMES[compliance.council]}.
        </p>
      )}

      {hasDetails && expanded && (
        <div className="mt-3 space-y-2.5">
          {hasIssues && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-500/80">
                Pontos a corrigir
              </p>
              <ul className="space-y-1">
                {compliance.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasWarnings && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                Atenção
              </p>
              <ul className="space-y-1">
                {compliance.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/60">
            Baseado nas diretrizes públicas do {COUNCIL_NAMES[compliance.council]}. Não substitui orientação jurídica.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentValidator;
