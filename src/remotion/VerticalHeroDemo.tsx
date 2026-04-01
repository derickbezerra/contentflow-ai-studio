import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";

const PRIMARY = "hsl(160,65%,52%)";

function smooth(frame: number, fps: number, delay = 0) {
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
}
function snappy(frame: number, fps: number, delay = 0) {
  return spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 200 } });
}

function Typewriter({ text, startFrame, fps }: { text: string; startFrame: number; fps: number }) {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  const visible = Math.max(0, Math.floor(elapsed * 0.36));
  const showCursor = elapsed >= 0 && visible <= text.length;
  return (
    <span>
      {text.slice(0, visible)}
      {showCursor && (
        <span style={{ opacity: Math.floor(elapsed / 14) % 2 === 0 ? 1 : 0, color: PRIMARY }}>|</span>
      )}
    </span>
  );
}

function FilterPill({ label, selected, delay }: { label: string; selected: boolean; delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = smooth(frame, fps, delay);
  return (
    <div style={{
      padding: "3px 10px", borderRadius: 99,
      border: `1px solid ${selected ? PRIMARY : "rgba(255,255,255,0.14)"}`,
      background: selected ? `${PRIMARY}22` : "rgba(255,255,255,0.04)",
      fontSize: 9.5, fontWeight: selected ? 700 : 500,
      color: selected ? PRIMARY : "rgba(255,255,255,0.45)",
      fontFamily: "system-ui,sans-serif",
      opacity: interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      transform: `scale(${interpolate(enter, [0, 1], [0.82, 1], { extrapolateRight: "clamp" })})`,
      transition: "none",
    }}>
      {label}
    </div>
  );
}

function FilterRow({ label, options, selectedIndex, rowDelay }: {
  label: string; options: string[]; selectedIndex: number; rowDelay: number
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = smooth(frame, fps, rowDelay);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      opacity: interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translateX(${interpolate(enter, [0, 1], [-14, 0])}px)`,
    }}>
      <span style={{
        fontSize: 9, color: "rgba(255,255,255,0.30)",
        fontFamily: "system-ui,sans-serif", fontWeight: 500,
        width: 90, flexShrink: 0, textAlign: "right",
      }}>{label}</span>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {options.map((opt, i) => (
          <FilterPill key={opt} label={opt} selected={i === selectedIndex} delay={rowDelay + 6 + i * 5} />
        ))}
      </div>
    </div>
  );
}

const GRADIENTS = [
  ["hsl(160,60%,22%)", "hsl(170,50%,18%)"],
  ["hsl(200,55%,24%)", "hsl(215,50%,20%)"],
  ["hsl(250,60%,22%)", "hsl(300,55%,28%)"],
];

export interface SlideData {
  badge: string;
  title: string;
  body: string;
  cta: string;
  handle: string;
}

function SlideCard({ slide, delay, gi, highlight }: {
  slide: SlideData; delay: number; gi: number; highlight: boolean
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = snappy(frame, fps, delay);
  const highlightPulse = highlight
    ? interpolate(Math.sin(((frame - (delay + 60)) / fps) * Math.PI * 1.5), [-1, 1], [0.08, 0.18])
    : 0;
  const [from, to] = GRADIENTS[gi % GRADIENTS.length];
  return (
    <div style={{
      width: 162, height: 218, borderRadius: 14,
      background: `linear-gradient(145deg, ${from}, ${to})`,
      display: "flex", flexDirection: "column", padding: "14px 13px",
      boxShadow: highlight
        ? `0 20px 50px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(0,200,120,${highlightPulse})`
        : "0 16px 40px rgba(0,0,0,0.45)",
      transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) scale(${highlight ? 1.03 : 1})`,
      opacity: interpolate(enter, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
      flexShrink: 0,
      transition: "none",
    }}>
      <span style={{
        fontSize: 6.5, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase",
        color: "rgba(255,255,255,0.40)", fontFamily: "system-ui,sans-serif",
        background: "rgba(255,255,255,0.09)", padding: "2px 7px", borderRadius: 99,
        alignSelf: "flex-start",
      }}>{slide.badge}</span>
      <div style={{ marginTop: "auto" }}>
        <h3 style={{
          fontSize: 13.5, fontWeight: 800, color: "#fff", lineHeight: 1.18,
          fontFamily: "system-ui,sans-serif", margin: "0 0 7px",
        }}>{slide.title}</h3>
        <div style={{ height: 2, width: 22, background: "rgba(255,255,255,0.28)", borderRadius: 2, marginBottom: 7 }} />
        <p style={{
          fontSize: 8.5, color: "rgba(255,255,255,0.70)", lineHeight: 1.6,
          fontFamily: "system-ui,sans-serif", margin: "0 0 9px",
        }}>{slide.body}</p>
        <p style={{
          fontSize: 8, fontWeight: 700, color: "hsl(160,65%,62%)",
          fontFamily: "system-ui,sans-serif", margin: 0, letterSpacing: 0.2,
        }}>{slide.cta}</p>
      </div>
      <p style={{ marginTop: 8, fontSize: 7, color: "rgba(255,255,255,0.22)", fontFamily: "system-ui,sans-serif" }}>
        {slide.handle}
      </p>
    </div>
  );
}

export interface ComplianceData {
  council: string;
  resolution: string;
  items: string[];
}

function ComplianceCard({ delay, compliance }: { delay: number; compliance: ComplianceData }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = smooth(frame, fps, delay);
  const checkScale = snappy(frame, fps, delay + 4);
  return (
    <div style={{
      background: "rgba(0,200,120,0.06)", border: "1.5px solid rgba(0,200,120,0.3)",
      borderRadius: 14, padding: "14px 18px", width: 400,
      opacity: interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(0,200,120,0.15)", border: "2px solid rgba(0,200,120,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${interpolate(checkScale, [0, 1], [0.4, 1], { extrapolateRight: "clamp" })})`,
          fontSize: 13,
        }}>✓</div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "hsl(160,65%,60%)", fontFamily: "system-ui,sans-serif" }}>
            {compliance.council}
          </p>
          <p style={{ margin: 0, fontSize: 8.5, color: "rgba(255,255,255,0.30)", fontFamily: "system-ui,sans-serif" }}>
            {compliance.resolution}
          </p>
        </div>
        <div style={{
          marginLeft: "auto", background: "rgba(0,200,120,0.15)", borderRadius: 99,
          padding: "3px 10px", fontSize: 8, fontWeight: 700,
          color: "hsl(160,65%,60%)", fontFamily: "system-ui,sans-serif",
          letterSpacing: 1, textTransform: "uppercase",
        }}>Aprovado</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {compliance.items.map((item, i) => {
          const itemEnter = smooth(frame, fps, delay + 14 + i * 22);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              opacity: interpolate(itemEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateX(${interpolate(itemEnter, [0, 1], [-10, 0])}px)`,
            }}>
              <span style={{ fontSize: 9, color: PRIMARY, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", fontFamily: "system-ui,sans-serif" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CouncilBadges({ delay }: { delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const councils = [
    { name: "CFM", sub: "Medicina",    color: "hsl(160,65%,52%)" },
    { name: "CFO", sub: "Odontologia", color: "hsl(195,75%,52%)" },
    { name: "CFP", sub: "Psicologia",  color: "hsl(270,65%,62%)" },
    { name: "CFN", sub: "Nutrição",    color: "hsl(90,65%,48%)"  },
  ];
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {councils.map((c, i) => {
        const enter = smooth(frame, fps, delay + i * 10);
        return (
          <div key={c.name} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            opacity: interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(enter, [0, 1], [10, 0])}px)`,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800, color: c.color, fontFamily: "system-ui,sans-serif",
              background: `${c.color}18`, border: `1px solid ${c.color}40`,
              borderRadius: 6, padding: "3px 9px",
            }}>{c.name}</div>
            <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.30)", fontFamily: "system-ui,sans-serif" }}>{c.sub}</span>
          </div>
        );
      })}
      <div style={{
        width: 1, height: 28, background: "rgba(255,255,255,0.1)", margin: "0 6px",
        opacity: interpolate(smooth(frame, fps, delay + 48), [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      }} />
      <span style={{
        fontSize: 8.5, color: "rgba(255,255,255,0.32)", fontFamily: "system-ui,sans-serif",
        maxWidth: 130, lineHeight: 1.45,
        opacity: interpolate(smooth(frame, fps, delay + 52), [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      }}>Conteúdo validado pelo conselho da sua especialidade</span>
    </div>
  );
}

export interface VerticalDemoProps {
  filterRows: Array<{ label: string; options: string[]; selectedIndex: number }>;
  typewriterText: string;
  aiText: string;
  slides: SlideData[];
  compliance: ComplianceData;
}

export function VerticalHeroDemo({ filterRows, typewriterText, aiText, slides, compliance }: VerticalDemoProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity  = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const glowAlpha  = frame > 540
    ? interpolate(Math.sin(((frame - 540) / fps) * Math.PI * 1.2), [-1, 1], [0.05, 0.14])
    : 0.05;

  const badgeS = smooth(frame, fps, 10);
  const headS  = smooth(frame, fps, 18);
  const formS  = smooth(frame, fps, 55);
  const inputS = smooth(frame, fps, 250);

  const showForm       = frame >= 55 && frame < 408;
  const showAI         = frame >= 385 && frame < 425;
  const showCards      = frame >= 420 && frame < 622;
  const showCompliance = frame >= 618 && frame < 762;
  const showCouncils   = frame >= 758;

  const gerarGlow    = frame >= 370;
  const gerarClick   = frame >= 385 && frame < 400;
  const gerarClickS  = snappy(frame, fps, 385);

  const formOpacity = frame >= 385
    ? interpolate(frame, [385, 408], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  const ROW_DELAYS = [65, 102, 140, 178];

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(145deg, #0a1628 0%, #0d1f1a 50%, #0a1628 100%)",
      opacity: bgOpacity,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: "0 48px",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "0%", left: "50%",
        transform: "translateX(-50%)",
        width: 500, height: 260, borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(0,180,100,${glowAlpha}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(0,200,120,0.10)", border: "1px solid rgba(0,200,120,0.22)",
        borderRadius: 99, padding: "4px 14px",
        fontSize: 10, fontWeight: 600, color: "hsl(160,60%,58%)",
        fontFamily: "system-ui,sans-serif", letterSpacing: 0.5,
        opacity: interpolate(badgeS, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(badgeS, [0, 1], [12, 0])}px)`,
      }}>
        <span style={{ fontSize: 8 }}>✦</span>
        IA especializada em saúde · Validação pelo conselho profissional
      </div>

      <h1 style={{
        fontSize: 23, fontWeight: 800, color: "#fff",
        fontFamily: "system-ui,sans-serif",
        textAlign: "center", lineHeight: 1.12, margin: 0,
        opacity: interpolate(headS, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(headS, [0, 1], [16, 0])}px)`,
      }}>
        Da ideia ao post pronto{" "}
        <span style={{ color: PRIMARY }}>em 30 segundos</span>
      </h1>

      {showForm && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16, padding: "16px 20px",
          width: 500, display: "flex", flexDirection: "column", gap: 10,
          opacity: interpolate(formS, [0, 1], [0, 1], { extrapolateRight: "clamp" }) * formOpacity,
          transform: `translateY(${interpolate(formS, [0, 1], [18, 0])}px)`,
        }}>
          {filterRows.map((row, i) => (
            <FilterRow
              key={row.label}
              label={row.label}
              options={row.options}
              selectedIndex={row.selectedIndex}
              rowDelay={ROW_DELAYS[i] ?? 65 + i * 38}
            />
          ))}

          {frame >= 245 && (
            <div style={{
              height: 1, background: "rgba(255,255,255,0.07)",
              opacity: interpolate(smooth(frame, fps, 245), [0, 1], [0, 1], { extrapolateRight: "clamp" }),
            }} />
          )}

          {frame >= 250 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              opacity: interpolate(inputS, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <div style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${gerarGlow ? "rgba(0,200,120,0.35)" : "rgba(255,255,255,0.11)"}`,
                borderRadius: 8, padding: "7px 12px",
                fontSize: 10.5, color: "rgba(255,255,255,0.85)",
                fontFamily: "system-ui,sans-serif",
                boxShadow: gerarGlow ? "0 0 0 2px rgba(0,180,100,0.12)" : "none",
              }}>
                {frame >= 260
                  ? <Typewriter text={typewriterText} startFrame={260} fps={fps} />
                  : <span style={{ color: "rgba(255,255,255,0.25)" }}>Tema ou ideia do post…</span>
                }
              </div>
              <div style={{
                background: gerarGlow
                  ? "linear-gradient(135deg, hsl(160,65%,38%), hsl(160,60%,28%))"
                  : "rgba(255,255,255,0.08)",
                borderRadius: 8, padding: "7px 16px",
                fontSize: 10.5, fontWeight: 700,
                color: gerarGlow ? "#fff" : "rgba(255,255,255,0.30)",
                fontFamily: "system-ui,sans-serif",
                boxShadow: gerarGlow ? "0 4px 16px rgba(0,160,90,0.35)" : "none",
                transform: `scale(${gerarClick
                  ? interpolate(gerarClickS, [0, 1], [1, 0.93], { extrapolateRight: "clamp" })
                  : 1})`,
                cursor: "default", whiteSpace: "nowrap",
              }}>
                Gerar ✦
              </div>
            </div>
          )}
        </div>
      )}

      {showAI && (
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui,sans-serif",
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => {
              const dots = Math.floor((frame - 385) / 10) % 4;
              return <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: i < dots ? PRIMARY : "rgba(255,255,255,0.15)",
              }} />;
            })}
          </div>
          {aiText}
        </div>
      )}

      {showCards && (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          {slides.map((slide, i) => (
            <SlideCard
              key={i}
              slide={slide}
              delay={420 + i * 18}
              gi={i}
              highlight={i === 0 && frame >= 490}
            />
          ))}
        </div>
      )}

      {showCompliance && (
        <ComplianceCard delay={618} compliance={compliance} />
      )}

      {showCouncils && (
        <CouncilBadges delay={758} />
      )}
    </AbsoluteFill>
  );
}
