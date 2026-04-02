import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// ── Font ──────────────────────────────────────────────────────────────────────
const { fontFamily } = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

// ── Constants ─────────────────────────────────────────────────────────────────
export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

const S = VIDEO_FPS; // 1 second in frames

// Scene durations in frames
const SCENE1_DUR = 2.2 * S;   // Hook
const SCENE2_DUR = 4.8 * S;   // Instagram post mockup
const SCENE3_DUR = 5.5 * S;   // ContentFlow interface + analyzing
const SCENE4_DUR = 8 * S;     // Violations revealed
const SCENE5_DUR = 7.5 * S;   // Corrected version
const SCENE6_DUR = 3 * S;     // CTA

// Scene start frames
const SCENE1_START = 0;
const SCENE2_START = SCENE1_START + SCENE1_DUR;
const SCENE3_START = SCENE2_START + SCENE2_DUR;
const SCENE4_START = SCENE3_START + SCENE3_DUR;
const SCENE5_START = SCENE4_START + SCENE4_DUR;
const SCENE6_START = SCENE5_START + SCENE5_DUR;

export const TOTAL_DURATION = Math.round(SCENE6_START + SCENE6_DUR);

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  surfaceLight: "#1a2337",
  border: "#1e2d45",
  green: "#10b981",
  greenLight: "#d1fae5",
  greenDark: "#065f46",
  red: "#ef4444",
  redLight: "#fee2e2",
  redDark: "#7f1d1d",
  amber: "#f59e0b",
  amberLight: "#fef3c7",
  white: "#ffffff",
  gray400: "#9ca3af",
  gray600: "#4b5563",
  gray700: "#374151",
  brand: "#0f9b6e",
  brandLight: "#d1fae5",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fadeIn(frame: number, start: number, dur = 0.5 * S) {
  return interpolate(frame - start, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideUp(frame: number, start: number, fps: number, delay = 0) {
  const s = spring({
    frame: frame - start - delay,
    fps,
    config: { damping: 200 },
  });
  const y = interpolate(s, [0, 1], [40, 0]);
  const opacity = interpolate(s, [0, 0.3], [0, 1]);
  return { y, opacity };
}

function slideInLeft(frame: number, start: number, fps: number, delay = 0) {
  const s = spring({
    frame: frame - start - delay,
    fps,
    config: { damping: 200 },
  });
  const x = interpolate(s, [0, 1], [-80, 0]);
  const opacity = interpolate(s, [0, 0.2], [0, 1]);
  return { x, opacity };
}

function scaleIn(frame: number, start: number, fps: number, delay = 0) {
  const s = spring({
    frame: frame - start - delay,
    fps,
    config: { damping: 18, stiffness: 180 },
  });
  return s;
}

// ── SCENE 1: Hook ─────────────────────────────────────────────────────────────
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = fadeIn(frame, 0, 0.4 * S);
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 0.4 * S, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const { y: y1, opacity: op1 } = slideUp(frame, 0, fps, 0);
  const { y: y2, opacity: op2 } = slideUp(frame, 0, fps, 8);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 50%, #012e20 0%, ${C.bg} 60%)`,
        opacity: opacity * exitOpacity,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: 140,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "5%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(15,155,110,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Eyebrow */}
      <div
        style={{
          transform: `translateY(${y1}px)`,
          opacity: op1,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.red,
            boxShadow: `0 0 16px ${C.red}`,
          }}
        />
        <span
          style={{
            color: C.red,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Alerta de compliance
        </span>
      </div>

      {/* Main headline */}
      <div style={{ transform: `translateY(${y1}px)`, opacity: op1 }}>
        <h1
          style={{
            color: C.white,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            margin: 0,
            maxWidth: 900,
          }}
        >
          Seu post pode violar as regras
          <br />
          do <span style={{ color: C.brand }}>Conselho?</span>
        </h1>
      </div>

      {/* Subtext */}
      <div
        style={{
          transform: `translateY(${y2}px)`,
          opacity: op2,
          marginTop: 36,
        }}
      >
        <p
          style={{
            color: C.gray400,
            fontSize: 28,
            fontWeight: 400,
            margin: 0,
            maxWidth: 660,
            lineHeight: 1.5,
          }}
        >
          Veja um caso real de médico e como a
          análise automática identifica infrações.
        </p>
      </div>

      {/* ContentFlow badge */}
      <div
        style={{
          transform: `translateY(${y2}px)`,
          opacity: op2,
          marginTop: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* ContentFlow logo SVG */}
        <svg width="160" height="38" viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M5 30 C11 26, 17 34, 23 30 C29 26, 35 34, 41 30 L41 37 C35 41, 29 33, 23 37 C17 41, 11 33, 5 37 Z" fill={C.brand} />
            <path d="M3 21 C9 17, 16 25, 23 21 C30 17, 37 25, 43 21 L43 28 C37 32, 30 24, 23 28 C16 32, 9 24, 3 28 Z" fill={C.brand} fillOpacity="0.6" />
            <path d="M1 13 C8 9, 16 17, 23 13 C30 9, 38 17, 45 13 L45 20 C38 24, 30 16, 23 20 C16 24, 8 16, 1 20 Z" fill={C.brand} fillOpacity="0.2" />
          </g>
          <text x="54" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="21" fontWeight="400">
            <tspan fill={C.white}>Content</tspan>
            <tspan fill={C.brand}>Flow</tspan>
          </text>
        </svg>
        <span style={{ color: C.gray600, fontSize: 16 }}>
          Analisador de Compliance
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE 2: Instagram Post ───────────────────────────────────────────────────
const POST_TEXT = `🚀 Meu PROTOCOLO EXCLUSIVO que já transformou centenas de pacientes!\n\nGARANTO redução de 30% no seu colesterol em apenas 30 dias.\n\nMétodo revolucionário que nenhum cardiologista te contou.\n\n✅ Resultados GARANTIDOS\n✅ Sem remédios\n✅ 100% natural\n\n👉 Agende sua consulta! Vagas LIMITADAS – só R$150!\n\n#cardiologista #colesterol #saude #resultados`;

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sceneOpacity = fadeIn(frame, 0, 0.4 * S);
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 0.4 * S, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const cardSpring = scaleIn(frame, 0, fps, 5);
  const cardScale = interpolate(cardSpring, [0, 1], [0.88, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 0.3], [0, 1]);

  const labelOpacity = fadeIn(frame, 10, 0.6 * S);
  const arrowSpring = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const arrowX = interpolate(arrowSpring, [0, 1], [-30, 0]);

  // Warning badge pops in at 1.5s
  const badgeSpring = scaleIn(frame, 1.5 * S, fps, 0);
  const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1]);

  const lines = POST_TEXT.split("\n");

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${C.bg} 0%, #0d1a2e 100%)`,
        opacity: sceneOpacity * exitOpacity,
        fontFamily,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
      }}
    >
      {/* Left label */}
      <div
        style={{
          opacity: labelOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 360,
        }}
      >
        <div
          style={{
            transform: `translateX(${arrowX}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.15)",
              border: `2px solid ${C.red}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 20 }}>⚠️</span>
          </div>
          <span
            style={{
              color: C.red,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Post problemático
          </span>
        </div>

        <h2
          style={{
            color: C.white,
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Post real de médico no Instagram
        </h2>
        <p style={{ color: C.gray400, fontSize: 20, margin: 0, lineHeight: 1.6 }}>
          Dr. Roberto Lima, cardiologista.
          Post publicado buscando novos pacientes.
        </p>
        <p style={{ color: C.gray600, fontSize: 16, margin: 0, lineHeight: 1.6 }}>
          Contém múltiplas infrações às resoluções
          CFM 1.974/11 e 2.336/23.
        </p>
      </div>

      {/* Instagram Card mockup */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          position: "relative",
        }}
      >
        {/* Phone frame */}
        <div
          style={{
            width: 380,
            background: "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {/* Instagram header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #efefef",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              👨‍⚕️
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
                dr.roberto.cardio
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>
                Cardiologista • São Paulo
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                fontSize: 22,
                color: "#111",
                lineHeight: 1,
              }}
            >
              ···
            </div>
          </div>

          {/* Post content */}
          <div
            style={{
              padding: "16px 16px 12px",
              maxHeight: 420,
              overflow: "hidden",
            }}
          >
            {lines.map((line, i) => (
              <p
                key={i}
                style={{
                  fontSize: 13,
                  color: line.startsWith("#") ? "#003569" : "#111",
                  margin: "0 0 4px 0",
                  lineHeight: 1.5,
                  fontWeight: line.includes("GARANTO") || line.includes("GARANTIDOS") ? 700 : 400,
                }}
              >
                {line || " "}
              </p>
            ))}
          </div>

          {/* Instagram actions */}
          <div
            style={{
              padding: "8px 16px 14px",
              display: "flex",
              gap: 16,
              borderTop: "1px solid #efefef",
            }}
          >
            <span style={{ fontSize: 22 }}>🤍</span>
            <span style={{ fontSize: 22 }}>💬</span>
            <span style={{ fontSize: 22 }}>✈️</span>
          </div>
        </div>

        {/* Warning badge overlay */}
        <div
          style={{
            position: "absolute",
            top: -18,
            right: -18,
            transform: `scale(${badgeScale})`,
            background: C.red,
            color: C.white,
            borderRadius: "50%",
            width: 70,
            height: 70,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            boxShadow: `0 8px 24px rgba(239,68,68,0.5)`,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>⚠️</span>
          <span>RISCO</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE 3: ContentFlow Interface ───────────────────────────────────────────
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sceneOpacity = fadeIn(frame, 0, 0.4 * S);
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 0.4 * S, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Browser frame enters
  const browserSpring = scaleIn(frame, 0, fps, 0);
  const browserY = interpolate(browserSpring, [0, 1], [60, 0]);
  const browserOpacity = interpolate(browserSpring, [0, 0.25], [0, 1]);

  // Typewriter for pasted text: starts at 0.8s
  const typeStart = 0.8 * S;
  const typeDur = 2.8 * S;
  const fullText = POST_TEXT.replace(/\n/g, " ").slice(0, 160) + "...";
  const charCount = Math.floor(
    interpolate(frame - typeStart, [0, typeDur], [0, fullText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typedText = fullText.slice(0, charCount);
  const cursorVisible = Math.floor((frame / 8) % 2) === 0;

  // Button pulse at 3.6s
  const buttonFrame = frame - 3.6 * S;
  const buttonSpring = spring({ frame: buttonFrame, fps, config: { damping: 18, stiffness: 200 } });
  const buttonScale = interpolate(buttonSpring, [0, 1], [0.8, 1]);
  const buttonOpacity = interpolate(buttonSpring, [0, 0.3], [0, 1]);

  // Loading dots at 4.4s
  const loadStart = 4.4 * S;
  const isLoading = frame >= loadStart;
  const dot1 = Math.sin((frame - loadStart) * 0.25) * 0.5 + 0.5;
  const dot2 = Math.sin((frame - loadStart) * 0.25 - 1) * 0.5 + 0.5;
  const dot3 = Math.sin((frame - loadStart) * 0.25 - 2) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #0d1117 0%, ${C.bg} 100%)`,
        opacity: sceneOpacity * exitOpacity,
        fontFamily,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Browser mockup */}
      <div
        style={{
          transform: `translateY(${browserY}px)`,
          opacity: browserOpacity,
          width: 920,
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            background: "#1c1c1e",
            borderRadius: "14px 14px 0 0",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div
                key={c}
                style={{ width: 13, height: 13, borderRadius: "50%", background: c }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              background: "#2c2c2e",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: 13,
              color: "#8e8e93",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: C.green, fontSize: 12 }}>🔒</span>
            flowcontent.com.br
          </div>
        </div>

        {/* App content */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderTop: "none",
            borderRadius: "0 0 14px 14px",
            padding: 32,
          }}
        >
          {/* App nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
              paddingBottom: 20,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: C.brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                ✦
              </div>
              <span style={{ color: C.white, fontWeight: 700, fontSize: 17 }}>
                ContentFlow
              </span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Conteúdo", "Compliance", "Perfil"].map((item, i) => (
                <span
                  key={item}
                  style={{
                    color: i === 1 ? C.brand : C.gray600,
                    fontSize: 14,
                    fontWeight: i === 1 ? 600 : 400,
                    borderBottom: i === 1 ? `2px solid ${C.brand}` : "none",
                    paddingBottom: 2,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Page title */}
          <h2
            style={{
              color: C.white,
              fontSize: 26,
              fontWeight: 800,
              margin: "0 0 6px 0",
            }}
          >
            Analisador de Compliance
          </h2>
          <p style={{ color: C.gray400, fontSize: 14, margin: "0 0 24px 0" }}>
            Cole seu post e verifique conformidade com CFM, CFO, CFN e CRP.
          </p>

          {/* Textarea */}
          <div
            style={{
              background: C.surfaceLight,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: 20,
              minHeight: 160,
              fontSize: 14,
              color: charCount > 0 ? C.white : C.gray600,
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            {charCount > 0 ? (
              <span>
                {typedText}
                {cursorVisible && frame < typeStart + typeDur + S && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 16,
                      background: C.brand,
                      marginLeft: 1,
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </span>
            ) : (
              "Cole aqui o texto do seu post..."
            )}
          </div>

          {/* Analyze button */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                transform: `scale(${buttonScale})`,
                opacity: buttonOpacity,
                background: isLoading
                  ? C.gray700
                  : `linear-gradient(135deg, ${C.brand}, #8b5cf6)`,
                color: C.white,
                borderRadius: 10,
                padding: "13px 32px",
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: isLoading ? "none" : `0 4px 24px rgba(99,102,241,0.4)`,
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ fontSize: 18 }}>⟳</span>
                  Analisando post
                  <span style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                    {[dot1, dot2, dot3].map((d, i) => (
                      <span
                        key={i}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: `rgba(255,255,255,${0.3 + d * 0.7})`,
                          display: "inline-block",
                          transform: `translateY(${-d * 4}px)`,
                        }}
                      />
                    ))}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 16 }}>🔍</span>
                  Analisar Compliance
                </>
              )}
            </div>
            {frame >= 3.6 * S && !isLoading && (
              <span style={{ color: C.gray600, fontSize: 13 }}>
                Verificação gratuita no plano Free
              </span>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE 4: Violations Found ─────────────────────────────────────────────────
const VIOLATIONS = [
  {
    code: "CFM Res. 1.974/11 – Art. 3°",
    title: "Promessa de resultado",
    desc: '"GARANTO redução de 30% no seu colesterol" — médico não pode garantir resultados terapêuticos.',
    quote: "GARANTO redução de 30%",
    severity: "critical",
    icon: "🚫",
  },
  {
    code: "CFM Res. 2.336/23 – Art. 5°",
    title: "Uso de superlativo e autopromoção",
    desc: '"Protocolo exclusivo" e "método revolucionário" configuram autopromoção excessiva vedada.',
    quote: "PROTOCOLO EXCLUSIVO · método revolucionário",
    severity: "high",
    icon: "⚠️",
  },
  {
    code: "CFM Res. 1.974/11 – Art. 6°",
    title: "Captação de pacientes",
    desc: '"Vagas LIMITADAS – só R$150!" caracteriza indução mercantil ao exercício da medicina.',
    quote: "Vagas LIMITADAS – só R$150!",
    severity: "high",
    icon: "⚠️",
  },
  {
    code: "CFM – Código de Ética",
    title: "Propaganda enganosa",
    desc: '"Sem remédios · 100% natural" sem base científica comprovada, violação do Art. 67.',
    quote: "Sem remédios · 100% natural",
    severity: "medium",
    icon: "ℹ️",
  },
];

const ViolationCard: React.FC<{
  violation: (typeof VIOLATIONS)[0];
  frame: number;
  fps: number;
  delay: number;
  index: number;
}> = ({ violation, frame, fps, delay, index }) => {
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const x = interpolate(s, [0, 1], [-60, 0]);
  const opacity = interpolate(s, [0, 0.25], [0, 1]);

  const colors = {
    critical: { bg: "#1a0505", border: "#7f1d1d", badge: C.red, badgeBg: "#450a0a" },
    high: { bg: "#1a0e00", border: "#78350f", badge: C.amber, badgeBg: "#451a03" },
    medium: { bg: "#0a0f1a", border: "#1e3a5f", badge: "#60a5fa", badgeBg: "#0c1a30" },
  };
  const col = colors[violation.severity as keyof typeof colors];

  return (
    <div
      style={{
        transform: `translateX(${x}px)`,
        opacity,
        background: col.bg,
        border: `1px solid ${col.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: col.badgeBg,
          border: `1px solid ${col.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {violation.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: col.badge,
              fontSize: 11,
              fontWeight: 700,
              background: col.badgeBg,
              border: `1px solid ${col.border}`,
              borderRadius: 6,
              padding: "2px 8px",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            {violation.code}
          </span>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>
            {violation.title}
          </span>
        </div>
        <p style={{ color: C.gray400, fontSize: 13, margin: "0 0 8px 0", lineHeight: 1.5 }}>
          {violation.desc}
        </p>
        <div
          style={{
            background: col.badgeBg,
            borderLeft: `3px solid ${col.badge}`,
            borderRadius: "0 6px 6px 0",
            padding: "5px 12px",
            fontSize: 12,
            color: col.badge,
            fontStyle: "italic",
            fontFamily: "monospace",
          }}
        >
          "{violation.quote}"
        </div>
      </div>

      {/* Number */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: col.badgeBg,
          border: `1px solid ${col.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 800,
          color: col.badge,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>
    </div>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sceneOpacity = fadeIn(frame, 0, 0.3 * S);
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 0.4 * S, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const { y: headerY, opacity: headerOp } = slideUp(frame, 0, fps);

  // Score counter animates from 0 to 4
  const scoreProgress = interpolate(frame, [0.3 * S, 2 * S], [0, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const score = Math.floor(scoreProgress);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #0d0505 0%, ${C.bg} 60%)`,
        opacity: sceneOpacity * exitOpacity,
        fontFamily,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1200 }}>
        {/* Header */}
        <div
          style={{
            transform: `translateY(${headerY}px)`,
            opacity: headerOp,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: C.red,
                  boxShadow: `0 0 12px ${C.red}`,
                }}
              />
              <span
                style={{
                  color: C.red,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Análise concluída
              </span>
            </div>
            <h2
              style={{
                color: C.white,
                fontSize: 46,
                fontWeight: 900,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {score} infrações encontradas
            </h2>
          </div>

          {/* Risk badge */}
          <div
            style={{
              background: "rgba(239,68,68,0.12)",
              border: `2px solid ${C.red}`,
              borderRadius: 16,
              padding: "16px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: C.red,
                fontSize: 42,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              ALTO
            </div>
            <div
              style={{
                color: C.gray400,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              RISCO
            </div>
          </div>
        </div>

        {/* Violations list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {VIOLATIONS.map((v, i) => (
            <ViolationCard
              key={i}
              violation={v}
              frame={frame}
              fps={fps}
              delay={0.4 * S + i * 0.55 * S}
              index={i}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE 5: Corrected Version ────────────────────────────────────────────────
const CORRECTED_TEXT =
  "Colesterol alto é um dos principais fatores de risco para doenças cardiovasculares. " +
  "Em consulta, avaliamos seu perfil lipídico de forma individualizada e discutimos as " +
  "melhores condutas baseadas em evidências científicas atualizadas. " +
  "Cada caso é único — o tratamento adequado depende de uma avaliação clínica completa. " +
  "Consulte seu cardiologista.";

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const sceneOpacity = fadeIn(frame, 0, 0.3 * S);
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 0.4 * S, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Left panel (original, faded)
  const leftSpring = scaleIn(frame, 0, fps, 0);
  const leftX = interpolate(leftSpring, [0, 1], [-40, 0]);
  const leftOpacity = interpolate(leftSpring, [0, 0.25], [0, 1]);

  // Right panel (corrected, hero)
  const rightSpring = scaleIn(frame, 0.4 * S, fps, 0);
  const rightX = interpolate(rightSpring, [0, 1], [60, 0]);
  const rightOpacity = interpolate(rightSpring, [0, 0.25], [0, 1]);

  // Typewriter for corrected text
  const typeStart = 0.8 * S;
  const typeDur = 4 * S;
  const charCount = Math.floor(
    interpolate(frame - typeStart, [0, typeDur], [0, CORRECTED_TEXT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typedText = CORRECTED_TEXT.slice(0, charCount);
  const cursorVisible = Math.floor((frame / 8) % 2) === 0 && frame < typeStart + typeDur + S;

  // Check badges appear progressively
  const checkItems = [
    "Sem promessa de resultado",
    "Baseado em evidências",
    "Autonomia do paciente respeitada",
    "Conformidade CFM ✓",
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #020d08 0%, ${C.bg} 60%)`,
        opacity: sceneOpacity * exitOpacity,
        fontFamily,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        gap: 48,
      }}
    >
      {/* Left: original (faded out, blurred) */}
      <div
        style={{
          transform: `translateX(${leftX}px)`,
          opacity: leftOpacity * 0.45,
          flex: "0 0 380px",
        }}
      >
        <div
          style={{
            background: C.surfaceLight,
            border: `1px solid #7f1d1d`,
            borderRadius: 16,
            padding: 24,
            filter: "blur(1.5px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 18 }}>❌</span>
            <span
              style={{
                color: C.red,
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Versão original — Reprovada
            </span>
          </div>
          <p
            style={{
              color: "#9ca3af",
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {POST_TEXT.slice(0, 220)}...
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          opacity: rightOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          flex: "0 0 auto",
        }}
      >
        <div
          style={{
            width: 2,
            height: 60,
            background: `linear-gradient(to bottom, transparent, ${C.green})`,
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: C.greenDark,
            border: `2px solid ${C.green}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          →
        </div>
        <div
          style={{
            width: 2,
            height: 60,
            background: `linear-gradient(to bottom, ${C.green}, transparent)`,
          }}
        />
      </div>

      {/* Right: corrected version */}
      <div
        style={{
          transform: `translateX(${rightX}px)`,
          opacity: rightOpacity,
          flex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: C.greenDark,
              border: `1px solid ${C.green}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            ✅
          </div>
          <div>
            <div
              style={{
                color: C.green,
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              Versão corrigida — ContentFlow
            </div>
            <div style={{ color: C.gray600, fontSize: 12 }}>
              Aprovada pelo verificador de compliance
            </div>
          </div>
        </div>

        {/* Corrected text card */}
        <div
          style={{
            background: "#071a0f",
            border: `1.5px solid ${C.green}`,
            borderRadius: 16,
            padding: 28,
            marginBottom: 20,
            boxShadow: `0 0 40px rgba(16,185,129,0.12)`,
          }}
        >
          <p
            style={{
              color: "#d1fae5",
              fontSize: 18,
              lineHeight: 1.75,
              margin: 0,
              fontWeight: 400,
            }}
          >
            {typedText}
            {cursorVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 18,
                  background: C.green,
                  marginLeft: 2,
                  verticalAlign: "middle",
                }}
              />
            )}
          </p>
        </div>

        {/* Check badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {checkItems.map((item, i) => {
            const delay = typeStart + (i + 1) * 0.8 * S;
            const checkOpacity = interpolate(frame - delay, [0, 0.3 * S], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const checkX = interpolate(
              spring({ frame: frame - delay, fps, config: { damping: 200 } }),
              [0, 1],
              [20, 0]
            );
            return (
              <div
                key={i}
                style={{
                  transform: `translateX(${checkX}px)`,
                  opacity: checkOpacity,
                  background: C.greenDark,
                  border: `1px solid ${C.green}30`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  color: C.greenLight,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: C.green }}>✓</span>
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE 6: CTA ──────────────────────────────────────────────────────────────
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bg = fadeIn(frame, 0, 0.5 * S);

  const logoSpring = scaleIn(frame, 0.2 * S, fps, 0);
  const logoScale = interpolate(logoSpring, [0, 1], [0.7, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 0.3], [0, 1]);

  const { y: textY, opacity: textOp } = slideUp(frame, 0.5 * S, fps);

  const urlSpring = spring({ frame: frame - 1.2 * S, fps, config: { damping: 200 } });
  const urlScale = interpolate(urlSpring, [0, 1], [0.9, 1]);
  const urlOpacity = interpolate(urlSpring, [0, 0.3], [0, 1]);

  // Glow pulse
  const glow = Math.sin(frame * 0.08) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 60%, #0a1a0f 0%, ${C.bg} 65%)`,
        opacity: bg,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(16,185,129,${0.08 + glow * 0.06}) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 36,
        }}
      >
        <svg width="220" height="52" viewBox="0 0 220 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <path d="M5 36 C13 30, 21 42, 29 36 C37 30, 45 42, 53 36 L53 44 C45 50, 37 38, 29 44 C21 50, 13 38, 5 44 Z" fill={C.brand} />
            <path d="M3 25 C11 19, 20 31, 29 25 C38 19, 47 31, 55 25 L55 33 C47 39, 38 27, 29 33 C20 39, 11 27, 3 33 Z" fill={C.brand} fillOpacity="0.6" />
            <path d="M1 14 C10 8, 20 20, 29 14 C38 8, 48 20, 57 14 L57 22 C48 28, 38 16, 29 22 C20 28, 10 16, 1 22 Z" fill={C.brand} fillOpacity="0.2" />
          </g>
          <text x="68" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="28" fontWeight="400">
            <tspan fill={C.white}>Content</tspan>
            <tspan fill={C.brand}>Flow</tspan>
          </text>
        </svg>
      </div>

      {/* Headline */}
      <div
        style={{
          transform: `translateY(${textY}px)`,
          opacity: textOp,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: C.white,
            fontSize: 56,
            fontWeight: 900,
            margin: "0 0 16px 0",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Analise seus posts{" "}
          <span style={{ color: C.green }}>antes</span> de publicar.
        </h2>
        <p style={{ color: C.gray400, fontSize: 22, margin: "0 0 48px 0" }}>
          Compliance automático para médicos, dentistas, psicólogos e nutricionistas.
        </p>
      </div>

      {/* URL pill */}
      <div
        style={{
          transform: `scale(${urlScale})`,
          opacity: urlOpacity,
          background: "rgba(16,185,129,0.1)",
          border: `2px solid ${C.green}`,
          borderRadius: 100,
          padding: "16px 48px",
          boxShadow: `0 0 40px rgba(16,185,129,${0.15 + glow * 0.1})`,
        }}
      >
        <span
          style={{
            color: C.green,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.01em",
          }}
        >
          flowcontent.com.br
        </span>
      </div>

      <p
        style={{
          color: C.gray600,
          fontSize: 15,
          marginTop: 20,
          opacity: urlOpacity,
        }}
      >
        Teste grátis · Sem cartão de crédito
      </p>
    </AbsoluteFill>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────
export const ComplianceVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily }}>
      <Sequence from={SCENE1_START} durationInFrames={Math.round(SCENE1_DUR)} premountFor={S}>
        <Scene1 />
      </Sequence>

      <Sequence from={Math.round(SCENE2_START)} durationInFrames={Math.round(SCENE2_DUR)} premountFor={S}>
        <Scene2 />
      </Sequence>

      <Sequence from={Math.round(SCENE3_START)} durationInFrames={Math.round(SCENE3_DUR)} premountFor={S}>
        <Scene3 />
      </Sequence>

      <Sequence from={Math.round(SCENE4_START)} durationInFrames={Math.round(SCENE4_DUR)} premountFor={S}>
        <Scene4 />
      </Sequence>

      <Sequence from={Math.round(SCENE5_START)} durationInFrames={Math.round(SCENE5_DUR)} premountFor={S}>
        <Scene5 />
      </Sequence>

      <Sequence from={Math.round(SCENE6_START)} durationInFrames={Math.round(SCENE6_DUR)} premountFor={S}>
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};
