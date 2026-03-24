import { Copy, Download, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface PostOutputProps {
  hook: string;
  body: string;
  cta: string;
  handle?: string;
  readOnly?: boolean;
}

// ── Color presets ─────────────────────────────────────────────────────────────

interface Preset { label: string; from: string; to: string; cat: string }

const PRESETS: Preset[] = [
  { label: "Esmeralda",  from: "#1a2e23", to: "#3d6b52", cat: "Verde"  },
  { label: "Floresta",   from: "#162818", to: "#2a5e38", cat: "Verde"  },
  { label: "Jade",       from: "#1a3d2a", to: "#1a6b4a", cat: "Verde"  },
  { label: "Oceano",     from: "#1a2e3d", to: "#2d526b", cat: "Azul"   },
  { label: "Marinho",    from: "#101e42", to: "#1a3468", cat: "Azul"   },
  { label: "Safira",     from: "#151d4a", to: "#1a2880", cat: "Azul"   },
  { label: "Lavanda",    from: "#2e2452", to: "#3d2e6b", cat: "Roxo"   },
  { label: "Ametista",   from: "#2a1a52", to: "#4a1a6b", cat: "Roxo"   },
  { label: "Vinho",      from: "#3d1a2e", to: "#6b2d3d", cat: "Rosa"   },
  { label: "Cereja",     from: "#3d1018", to: "#6b1a24", cat: "Rosa"   },
  { label: "Dourado",    from: "#3d2e1a", to: "#6b522d", cat: "Quente" },
  { label: "Terra",      from: "#3d200e", to: "#6b3618", cat: "Quente" },
  { label: "Grafite",    from: "#1a1e28", to: "#0f1219", cat: "Neutro" },
  { label: "Obsidiana",  from: "#0e1219", to: "#080b12", cat: "Neutro" },
  { label: "Aurora",     from: "#2a1852", to: "#5a1842", cat: "Degradê"},
  { label: "Crepúsculo", from: "#181a42", to: "#42184a", cat: "Degradê"},
];

// ── Canvas helpers ────────────────────────────────────────────────────────────

function wrapTextCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `${hex}${a}`;
}

function renderPostToCanvas(
  hook: string,
  body: string,
  cta: string,
  handle: string | undefined,
  presetIndex: number,
  customColor: string | null
): HTMLCanvasElement {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const preset = PRESETS[presetIndex];

  // Background gradient
  const grd = ctx.createLinearGradient(0, 0, W, H);
  if (customColor) {
    grd.addColorStop(0, customColor);
    grd.addColorStop(1, hexWithAlpha(customColor, 0.75));
  } else {
    grd.addColorStop(0, preset.from);
    grd.addColorStop(1, preset.to);
  }
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Subtle dot texture
  for (let tx = 40; tx < W; tx += 60) {
    for (let ty = 40; ty < H; ty += 60) {
      ctx.beginPath();
      ctx.arc(tx, ty, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
    }
  }

  const PAD = 90;
  const FONT = "-apple-system, BlinkMacSystemFont, Arial, sans-serif";

  ctx.textAlign = "center";

  // Only the hook — mirrors exactly what's visible in the card image area
  ctx.font = `800 74px ${FONT}`;
  const hookLines = wrapTextCenter(ctx, hook, W - PAD * 2);
  const hookLineH = 92;
  const totalH = hookLines.length * hookLineH;
  const startY = (H - totalH) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  hookLines.forEach((line, i) =>
    ctx.fillText(line, W / 2, startY + i * hookLineH)
  );

  // Handle watermark
  if (handle) {
    ctx.font = `500 30px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(`@${handle}`, W - PAD, H - PAD + 10);
  }

  return canvas;
}

// ── Component ─────────────────────────────────────────────────────────────────

const PostOutput = ({ hook, body, cta, handle, readOnly = false }: PostOutputProps) => {
  const [presetIndex, setPresetIndex] = useState(0);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fullText = `${hook}\n\n${body}\n\n${cta}`;

  const preset = PRESETS[presetIndex];
  const bgFrom = customColor ?? preset.from;
  const bgTo   = customColor ? `${customColor}bb` : preset.to;
  const bg     = `linear-gradient(135deg, ${bgFrom}, ${bgTo})`;

  const copyAll = () => {
    navigator.clipboard.writeText(fullText);
    toast.success("Post copiado!");
  };

  const download = async () => {
    setDownloading(true);
    try {
      const canvas = renderPostToCanvas(hook, body, cta, handle, presetIndex, customColor);
      const link = document.createElement("a");
      link.download = "post-instagram.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Post baixado! (1080×1080px)");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao baixar imagem.");
    } finally {
      setDownloading(false);
    }
  };

  const categories = Array.from(new Set(PRESETS.map(p => p.cat)));

  return (
    <div className="animate-fade-up space-y-4">
      {/* Instagram post card */}
      <div className="overflow-hidden rounded-2xl shadow-card">

        {/* Image area */}
        <div
          className="relative flex min-h-[280px] items-center justify-center px-8 py-10"
          style={{ background: bg }}
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Color palette button */}
          {!readOnly && (
            <button
              onClick={() => setShowPalette(v => !v)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25"
              title="Mudar cor"
            >
              <Palette className="h-3.5 w-3.5 text-white/80" />
            </button>
          )}

          {/* Color picker panel */}
          {showPalette && !readOnly && (
            <div className="absolute inset-x-3 top-11 z-20 rounded-2xl bg-black/60 p-3.5 backdrop-blur-xl" style={{ maxHeight: "72%", overflowY: "auto" }}>
              {categories.map(cat => (
                <div key={cat} className="mb-3">
                  <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40">{cat}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.filter(p => p.cat === cat).map(p => {
                      const gi = PRESETS.indexOf(p);
                      const active = gi === presetIndex && !customColor;
                      return (
                        <button
                          key={gi}
                          onClick={() => { setPresetIndex(gi); setCustomColor(null); setShowPalette(false); }}
                          className={`h-6 w-6 rounded-full border-2 transition-all duration-150 hover:scale-110 ${active ? "border-white scale-110 shadow-lg" : "border-white/20"}`}
                          style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                          title={p.label}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-1 flex items-center gap-2 border-t border-white/10 pt-2.5">
                <label
                  className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-white/20 overflow-hidden hover:scale-110 transition-all"
                  title="Cor personalizada"
                  style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
                >
                  <input
                    type="color"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={e => { setCustomColor(e.target.value); setShowPalette(false); }}
                  />
                </label>
                <span className="text-[10px] text-white/40">Cor livre</span>
              </div>
            </div>
          )}

          <p className="relative text-center text-xl font-bold leading-tight text-white drop-shadow-sm">
            {hook}
          </p>
          {handle && (
            <p className="absolute bottom-3 right-4 text-[11px] font-medium text-white/40">@{handle}</p>
          )}
        </div>

        {/* Caption area */}
        <div className="bg-card px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">{body}</p>
          <p className="mt-3 text-sm font-semibold text-primary">{cta}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={copyAll}>
          <Copy className="h-3.5 w-3.5" /> Copiar post
        </Button>
        <Button variant="outline" size="sm" onClick={download} disabled={downloading}>
          {downloading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Download className="h-3.5 w-3.5" />}
          {downloading ? "Baixando..." : "Baixar imagem"}
        </Button>
      </div>
    </div>
  );
};

export default PostOutput;
