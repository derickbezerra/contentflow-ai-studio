import { Copy, Download, ChevronLeft, ChevronRight, Check, X, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useRef } from "react";

// ── Canvas rendering helpers ──────────────────────────────────────────────────

function hslToRgb(hsl: string): string {
  const m = hsl.match(/hsl\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/);
  if (!m) return hsl;
  const h = parseInt(m[1]), s = parseFloat(m[2]) / 100, l = parseFloat(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m1 = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return `rgb(${Math.round((r + m1) * 255)},${Math.round((g + m1) * 255)},${Math.round((b + m1) * 255)})`;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function wrapWords(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderSlideToCanvas(
  slide: Slide,
  index: number,
  total: number,
  handle?: string
): HTMLCanvasElement {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const preset = GRADIENT_PRESETS[slide.gradient];
  const grd = ctx.createLinearGradient(0, 0, W, H);
  if (slide.customColor) {
    grd.addColorStop(0, slide.customColor);
    grd.addColorStop(1, hexToRgba(slide.customColor, 0.78));
  } else {
    grd.addColorStop(0, hslToRgb(preset.from));
    grd.addColorStop(1, hslToRgb(preset.to));
  }
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  const PAD = 84;
  const FONT = "-apple-system, BlinkMacSystemFont, Arial, sans-serif";

  // Badge "X / N"
  const badgeText = `${index + 1} / ${total}`;
  ctx.font = `600 28px ${FONT}`;
  const bW = ctx.measureText(badgeText).width + 44;
  const bH = 52;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  drawRoundedRect(ctx, PAD, PAD, bW, bH, bH / 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, PAD + 22, PAD + bH / 2);

  // Measure content for vertical centering
  ctx.font = `800 78px ${FONT}`;
  const titleLines = wrapWords(ctx, slide.title, W - PAD * 2);
  const titleLineH = 96;

  ctx.font = `500 44px ${FONT}`;
  const bodyLines = wrapWords(ctx, slide.body, W - PAD * 2);
  const bodyLineH = 62;

  const SEP_GAP = 52;
  const totalH = titleLines.length * titleLineH + SEP_GAP + 3 + SEP_GAP + bodyLines.length * bodyLineH;
  const startY = (H - totalH) / 2;

  // Title
  ctx.font = `800 78px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  titleLines.forEach((line, li) => ctx.fillText(line, PAD, startY + li * titleLineH));

  // Separator
  const sepY = startY + titleLines.length * titleLineH + SEP_GAP;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(PAD, sepY, 110, 3);

  // Body
  ctx.font = `500 44px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const bodyY = sepY + 3 + SEP_GAP;
  bodyLines.forEach((line, li) => ctx.fillText(line, PAD, bodyY + li * bodyLineH));

  // Handle
  if (handle) {
    ctx.font = `500 32px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.textBaseline = "bottom";
    ctx.fillText(`@${handle}`, PAD, H - PAD);
  }

  return canvas;
}

interface Slide {
  title: string;
  body: string;
  gradient: number;
  customColor?: string;
}

interface CarouselOutputProps {
  slides: { title: string; body: string }[];
  caption: string;
  handle?: string;
  readOnly?: boolean;
}

const GRADIENT_PRESETS = [
  // Verde
  { label: "Esmeralda", from: "hsl(160,60%,22%)", to: "hsl(170,50%,18%)", cat: "Verde" },
  { label: "Floresta", from: "hsl(150,55%,20%)", to: "hsl(190,50%,28%)", cat: "Verde" },
  { label: "Jade", from: "hsl(158,70%,26%)", to: "hsl(172,65%,18%)", cat: "Verde" },
  { label: "Musgo", from: "hsl(130,40%,24%)", to: "hsl(155,45%,18%)", cat: "Verde" },
  { label: "Ártico", from: "hsl(195,50%,25%)", to: "hsl(160,45%,35%)", cat: "Verde" },
  // Azul
  { label: "Oceano", from: "hsl(200,55%,24%)", to: "hsl(215,50%,20%)", cat: "Azul" },
  { label: "Marinho", from: "hsl(215,65%,20%)", to: "hsl(230,60%,14%)", cat: "Azul" },
  { label: "Safira", from: "hsl(225,70%,28%)", to: "hsl(240,65%,20%)", cat: "Azul" },
  { label: "Céu profundo", from: "hsl(200,80%,28%)", to: "hsl(220,70%,18%)", cat: "Azul" },
  // Roxo
  { label: "Lavanda", from: "hsl(260,35%,32%)", to: "hsl(270,30%,24%)", cat: "Roxo" },
  { label: "Ametista", from: "hsl(270,55%,30%)", to: "hsl(285,50%,22%)", cat: "Roxo" },
  { label: "Noturno", from: "hsl(230,40%,18%)", to: "hsl(280,35%,28%)", cat: "Roxo" },
  { label: "Galáxia", from: "hsl(250,60%,22%)", to: "hsl(300,55%,28%)", cat: "Roxo" },
  // Vermelho / Rosa
  { label: "Vinho", from: "hsl(340,45%,28%)", to: "hsl(350,40%,20%)", cat: "Rosa" },
  { label: "Cereja", from: "hsl(350,60%,24%)", to: "hsl(5,55%,18%)", cat: "Rosa" },
  { label: "Rosa escuro", from: "hsl(330,55%,28%)", to: "hsl(345,50%,20%)", cat: "Rosa" },
  { label: "Coral", from: "hsl(350,55%,38%)", to: "hsl(20,60%,42%)", cat: "Rosa" },
  // Laranja / Dourado
  { label: "Dourado", from: "hsl(35,55%,30%)", to: "hsl(25,50%,22%)", cat: "Quente" },
  { label: "Âmbar", from: "hsl(30,70%,32%)", to: "hsl(15,65%,24%)", cat: "Quente" },
  { label: "Terra", from: "hsl(20,55%,28%)", to: "hsl(35,50%,22%)", cat: "Quente" },
  { label: "Pôr do sol", from: "hsl(15,65%,35%)", to: "hsl(45,60%,38%)", cat: "Quente" },
  { label: "Fogo", from: "hsl(5,75%,32%)", to: "hsl(35,80%,42%)", cat: "Quente" },
  // Neutros
  { label: "Grafite", from: "hsl(220,15%,22%)", to: "hsl(230,12%,14%)", cat: "Neutro" },
  { label: "Obsidiana", from: "hsl(240,20%,14%)", to: "hsl(250,15%,8%)", cat: "Neutro" },
  { label: "Carvão", from: "hsl(0,0%,18%)", to: "hsl(0,0%,8%)", cat: "Neutro" },
  { label: "Titânio", from: "hsl(210,20%,20%)", to: "hsl(220,15%,12%)", cat: "Neutro" },
  { label: "Cappuccino", from: "hsl(25,35%,26%)", to: "hsl(15,30%,18%)", cat: "Neutro" },
  // Degradês vibrantes
  { label: "Aurora", from: "hsl(280,50%,30%)", to: "hsl(340,55%,35%)", cat: "Degradê" },
  { label: "Flamingo", from: "hsl(320,65%,32%)", to: "hsl(20,70%,42%)", cat: "Degradê" },
  { label: "Tropical", from: "hsl(175,65%,26%)", to: "hsl(210,70%,32%)", cat: "Degradê" },
  { label: "Oceano vivo", from: "hsl(195,75%,20%)", to: "hsl(230,70%,26%)", cat: "Degradê" },
  { label: "Crepúsculo", from: "hsl(240,50%,22%)", to: "hsl(330,60%,32%)", cat: "Degradê" },
];

const CarouselOutput = ({ slides: initialSlides, caption: initialCaption, handle, readOnly = false }: CarouselOutputProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides.map((s) => ({ ...s, gradient: 0 }))
  );
  const [caption, setCaption] = useState(initialCaption);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editingCaption, setEditingCaption] = useState(false);
  const [editCaptionText, setEditCaptionText] = useState("");
  const [colorPickerIndex, setColorPickerIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [locked, setLocked] = useState(readOnly);

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
    toast.success("Legenda copiada!");
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditTitle(slides[index].title);
    setEditBody(slides[index].body);
    setColorPickerIndex(null);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...slides];
    updated[editingIndex] = { ...updated[editingIndex], title: editTitle, body: editBody };
    setSlides(updated);
    setEditingIndex(null);
    toast.success("Slide atualizado!");
  };

  const cancelEdit = () => setEditingIndex(null);

  const setSlideGradient = (slideIndex: number, gradientIndex: number) => {
    const updated = [...slides];
    updated[slideIndex] = { ...updated[slideIndex], gradient: gradientIndex, customColor: undefined };
    setSlides(updated);
  };

  const applyGradientToAll = (gradientIndex: number) => {
    setSlides(slides.map((s) => ({ ...s, gradient: gradientIndex, customColor: undefined })));
    toast.success("Cor aplicada a todos os slides!");
  };

  const setSlideCustomColor = (slideIndex: number, color: string) => {
    const updated = [...slides];
    updated[slideIndex] = { ...updated[slideIndex], customColor: color };
    setSlides(updated);
  };

  const applyCustomColorToAll = (color: string) => {
    setSlides(slides.map((s) => ({ ...s, customColor: color })));
    toast.success("Cor aplicada a todos os slides!");
  };

  const downloadSlides = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const canvas = renderSlideToCanvas(slides[i], i, slides.length, handle);
        const link = document.createElement("a");
        link.download = `slide-${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise((r) => setTimeout(r, 300));
      }
      toast.success("Slides baixados! (1080×1350px)");
      setLocked(true);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao baixar slides.");
    } finally {
      setDownloading(false);
    }
  };

  const startCaptionEdit = () => {
    setEditingCaption(true);
    setEditCaptionText(caption);
  };

  const saveCaptionEdit = () => {
    setCaption(editCaptionText);
    setEditingCaption(false);
    toast.success("Legenda atualizada!");
  };

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    setActiveIndex(clamped);
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[clamped] as HTMLElement;
    if (card) {
      container.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const children = Array.from(container.children) as HTMLElement[];
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const dist = Math.abs(child.offsetLeft - 16 - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="relative">
        {activeIndex > 0 && (
          <button
            onClick={() => scrollTo(activeIndex - 1)}
            className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-card-hover transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
        )}
        {activeIndex < slides.length - 1 && (
          <button
            onClick={() => scrollTo(activeIndex + 1)}
            className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-card-hover transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {slides.map((slide, i) => {
            const isEditing = editingIndex === i;
            const showColorPicker = colorPickerIndex === i;
            const grad = GRADIENT_PRESETS[slide.gradient];
            const bg = slide.customColor
              ? `linear-gradient(135deg, ${slide.customColor}, ${slide.customColor}cc)`
              : `linear-gradient(135deg, ${grad.from}, ${grad.to})`;

            return (
              <div
                key={i}
                ref={(el) => { slideRefs.current[i] = el; }}
                className="group relative flex aspect-[4/5] min-w-[260px] max-w-[300px] flex-shrink-0 snap-center flex-col overflow-hidden rounded-2xl shadow-card-hover transition-all duration-300 hover:shadow-lg"
                style={{ background: bg, animationDelay: `${i * 80}ms` }}
              >
                {/* Toolbar — visible on hover */}
                {!isEditing && !locked && (
                  <div className="absolute right-2.5 top-2.5 z-10 flex gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
                    <button
                      onClick={() => setColorPickerIndex(showColorPicker ? null : i)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25"
                      title="Mudar cor"
                    >
                      <Palette className="h-3 w-3 text-white/80" />
                    </button>
                    <button
                      onClick={() => startEdit(i)}
                      className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/25"
                    >
                      Editar
                    </button>
                  </div>
                )}

                {/* Color picker dropdown */}
                {showColorPicker && !isEditing && !locked && (
                  <div className="absolute left-0 right-0 top-11 z-20 animate-fade-in rounded-2xl bg-black/60 p-3.5 backdrop-blur-xl" style={{ maxHeight: '75%', overflowY: 'auto' }}>
                    {(['Verde','Azul','Roxo','Rosa','Quente','Neutro','Degradê'] as const).map((cat) => {
                      const items = GRADIENT_PRESETS.filter(p => p.cat === cat);
                      return (
                        <div key={cat} className="mb-3">
                          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40">{cat}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {items.map((preset, _) => {
                              const gi = GRADIENT_PRESETS.indexOf(preset);
                              return (
                                <button
                                  key={gi}
                                  onClick={() => { setSlideGradient(i, gi); setColorPickerIndex(null); }}
                                  className={`h-6 w-6 rounded-full border-2 transition-all duration-150 hover:scale-110 ${slide.gradient === gi && !slide.customColor ? "border-white shadow-lg scale-110" : "border-white/20"}`}
                                  style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                                  title={preset.label}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-1 flex items-center gap-2 border-t border-white/10 pt-2.5">
                      <label
                        className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-white/20 overflow-hidden hover:scale-110 transition-all"
                        title="Cor personalizada"
                        style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
                      >
                        <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          onChange={(e) => { setSlideCustomColor(i, e.target.value); setColorPickerIndex(null); }} />
                      </label>
                      <span className="text-[10px] text-white/40">Cor livre</span>
                      <button
                        onClick={() => { if (slide.customColor) applyCustomColorToAll(slide.customColor); else applyGradientToAll(slide.gradient); setColorPickerIndex(null); }}
                        className="ml-auto rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70 transition-colors hover:bg-white/20"
                      >
                        Aplicar a todos
                      </button>
                    </div>
                  </div>
                )}

                {isEditing && !locked ? (
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Editando slide {i + 1}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 transition-colors hover:bg-white/30">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </button>
                        <button onClick={cancelEdit} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20">
                          <X className="h-3.5 w-3.5 text-white/70" />
                        </button>
                      </div>
                    </div>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-base font-bold text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                      placeholder="Título"
                    />
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={4}
                      className="flex-1 resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm leading-relaxed text-white/90 placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                      placeholder="Conteúdo"
                    />
                    {/* Inline color selection in edit mode */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-white/40">Cor:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {GRADIENT_PRESETS.map((preset, gi) => (
                          <button
                            key={gi}
                            onClick={() => setSlideGradient(i, gi)}
                            className={`h-5 w-5 rounded-full border transition-all duration-150 hover:scale-110 ${
                              slide.gradient === gi ? "border-white scale-110" : "border-white/20"
                            }`}
                            style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col justify-center px-6 py-8">
                    <span className="mb-4 inline-flex w-fit rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                      {i + 1} / {slides.length}
                    </span>
                    <h3
                      className="mb-4 text-[1.65rem] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm"
                      style={{ textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
                    >
                      {slide.title}
                    </h3>
                    <div className="mb-4 h-[2px] w-10 rounded-full bg-white/25" />
                    <p
                      className="text-[15px] font-medium leading-[1.6] text-white/85"
                      style={{ textShadow: "0 1px 8px rgba(0,0,0,0.1)" }}
                    >
                      {slide.body}
                    </p>
                    {handle && (
                      <p className="mt-auto pt-4 text-[11px] font-medium text-white/40">@{handle}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Caption */}
      <div className="group relative rounded-xl border border-border/60 bg-card p-5 shadow-card">
        {!editingCaption && !locked && (
          <button
            onClick={startCaptionEdit}
            className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-all duration-200 hover:bg-muted group-hover:opacity-100"
          >
            Editar
          </button>
        )}
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Legenda
        </p>
        {editingCaption ? (
          <div className="space-y-3">
            <textarea
              value={editCaptionText}
              onChange={(e) => setEditCaptionText(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveCaptionEdit}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingCaption(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{caption}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={copyCaption}>
          <Copy className="h-3.5 w-3.5" /> Copiar legenda
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSlides} disabled={downloading}>
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {downloading ? "Baixando..." : "Baixar imagens"}
        </Button>
      </div>
    </div>
  );
};

export default CarouselOutput;
