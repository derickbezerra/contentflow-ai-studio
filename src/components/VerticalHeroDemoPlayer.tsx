import { Player } from "@remotion/player";
import { VerticalHeroDemo, type VerticalDemoProps } from "@/remotion/VerticalHeroDemo";

const VERTICAL_DEMO_DATA: Record<string, VerticalDemoProps> = {
  medicos: {
    filterRows: [
      { label: "Especialidade", options: ["Medicina", "Nutrição", "Odontologia", "Psicologia"], selectedIndex: 0 },
      { label: "Tipo de paciente", options: ["Estético", "Com dor", "Preventivo", "Crônico", "Premium"], selectedIndex: 2 },
      { label: "Gênero", options: ["Feminino", "Masculino", "Ambos"], selectedIndex: 0 },
      { label: "Faixa etária", options: ["18–25", "25–35", "35–50", "50+"], selectedIndex: 0 },
    ],
    typewriterText: "Colesterol alto em jovens",
    aiText: "Gerando conteúdo para Medicina · CFM…",
    slides: [
      { badge: "1 / 5", title: "Colesterol alto em jovens", body: "Mulheres jovens também têm risco. Um exame simples pode revelar algo que ninguém suspeitava.", cta: "Peça o exame na consulta →", handle: "@dra.ana.cardiologia" },
      { badge: "2 / 5", title: "5 hábitos que disparam o LDL", body: "Sedentarismo, ultraprocessados e estresse crônico antes dos 25 já formam placas arteriais silenciosas.", cta: "Identifique o seu →", handle: "@dra.ana.cardiologia" },
      { badge: "3 / 5", title: "O exame veio alterado. E agora?", body: "LDL acima de 130 mg/dL pede avaliação. Não ignore o número.", cta: "Agende sua consulta →", handle: "@dra.ana.cardiologia" },
    ],
    compliance: {
      council: "CFM · Aprovado",
      resolution: "Resolução CFM 1974/2011 · Código de Ética Médica",
      items: [
        "Sem linguagem de medo ou urgência",
        "Sem garantia de resultado clínico",
        "Sem comparações antes/depois",
        "Sem depoimentos de pacientes",
      ],
    },
  },

  dentistas: {
    filterRows: [
      { label: "Especialidade", options: ["Medicina", "Nutrição", "Odontologia", "Psicologia"], selectedIndex: 2 },
      { label: "Tipo de paciente", options: ["Estético", "Com dor", "Preventivo", "Crônico", "Premium"], selectedIndex: 0 },
      { label: "Gênero", options: ["Feminino", "Masculino", "Ambos"], selectedIndex: 0 },
      { label: "Faixa etária", options: ["18–25", "25–35", "35–50", "50+"], selectedIndex: 1 },
    ],
    typewriterText: "Clareamento dental sem dor",
    aiText: "Gerando conteúdo para Odontologia · CFO…",
    slides: [
      { badge: "1 / 5", title: "Clareamento: o que ninguém conta", body: "Sensibilidade é normal nos primeiros dias. O resultado pode durar até 2 anos com manutenção.", cta: "Saiba mais →", handle: "@dr.paulo.odonto" },
      { badge: "2 / 5", title: "Quanto tempo dura o clareamento?", body: "Com manutenção adequada, o resultado se mantém por até 2 anos. A rotina de cuidados faz toda a diferença.", cta: "Veja como manter →", handle: "@dra.paula.odonto" },
      { badge: "3 / 5", title: "Clareamento em casa ou no consultório?", body: "Os dois funcionam. A diferença está na velocidade e no nível de controle do processo. Saiba qual combina com você.", cta: "Compare as opções →", handle: "@dra.paula.odonto" },
    ],
    compliance: {
      council: "CFO · Aprovado",
      resolution: "Código de Ética Odontológica · CFO",
      items: [
        "Sem fotos antes/depois de sorriso",
        "Sem garantia de resultado estético",
        "Sem comparação com outros profissionais",
        "Sem preços como apelo publicitário",
      ],
    },
  },

  psicologos: {
    filterRows: [
      { label: "Especialidade", options: ["Medicina", "Nutrição", "Odontologia", "Psicologia"], selectedIndex: 3 },
      { label: "Tipo de paciente", options: ["Estético", "Com dor", "Preventivo", "Crônico", "Premium"], selectedIndex: 2 },
      { label: "Gênero", options: ["Feminino", "Masculino", "Ambos"], selectedIndex: 2 },
      { label: "Faixa etária", options: ["18–25", "25–35", "35–50", "50+"], selectedIndex: 1 },
    ],
    typewriterText: "Ansiedade no trabalho e burnout",
    aiText: "Gerando conteúdo para Psicologia · CFP…",
    slides: [
      { badge: "1 / 5", title: "Ansiedade não é frescura", body: "O que acontece no seu cérebro durante uma crise: uma explicação simples e sem julgamento.", cta: "Leia mais →", handle: "@psi.camila.saude" },
      { badge: "2 / 5", title: "Síndrome do impostor", body: "Por que você se sente uma fraude mesmo sendo capaz. Um fenômeno que afeta 70% das pessoas.", cta: "Reconhece isso? →", handle: "@psi.camila.saude" },
      { badge: "3 / 5", title: "Limites não são egoísmo", body: "Estabelecer limites é cuidar da saúde mental antes que o corpo precise pedir socorro.", cta: "Aprenda como →", handle: "@psi.camila.saude" },
    ],
    compliance: {
      council: "CFP · Aprovado",
      resolution: "Resolução CFP 11/2012 · Código de Ética",
      items: [
        "Sem divulgação de casos clínicos",
        "Sem garantia de resultado terapêutico",
        "Sem diagnóstico aplicado ao leitor",
        "Sem linguagem que banalize sofrimento",
      ],
    },
  },

  nutricionistas: {
    filterRows: [
      { label: "Especialidade", options: ["Medicina", "Nutrição", "Odontologia", "Psicologia"], selectedIndex: 1 },
      { label: "Tipo de paciente", options: ["Estético", "Com dor", "Preventivo", "Crônico", "Premium"], selectedIndex: 0 },
      { label: "Gênero", options: ["Feminino", "Masculino", "Ambos"], selectedIndex: 0 },
      { label: "Faixa etária", options: ["18–25", "25–35", "35–50", "50+"], selectedIndex: 1 },
    ],
    typewriterText: "Ansiedade e compulsão alimentar",
    aiText: "Gerando conteúdo para Nutrição · CFN…",
    slides: [
      { badge: "1 / 5", title: "Você come por fome ou por ansiedade?", body: "Reconhecer o gatilho é o primeiro passo. Ansiedade e fome real têm sinais completamente diferentes.", cta: "Aprenda a diferença →", handle: "@nutri.isabela.sp" },
      { badge: "2 / 5", title: "Por que a ansiedade aumenta o apetite", body: "O cortisol elevado sinaliza ao cérebro que você precisa de energia rápida. O resultado: vontade de doce e carboidrato.", cta: "Entenda o mecanismo →", handle: "@nutri.isabela.sp" },
      { badge: "3 / 5", title: "Alimentos que ajudam a reduzir a ansiedade", body: "Magnésio, triptofano e ômega-3 têm papel direto na regulação do humor. A alimentação pode ser uma aliada.", cta: "Veja a lista →", handle: "@nutri.isabela.sp" },
    ],
    compliance: {
      council: "CFN · Aprovado",
      resolution: "Código de Ética do Nutricionista · CFN",
      items: [
        "Sem promessa de emagrecimento específico",
        "Sem alimentos milagrosos ou proibidos",
        "Sem fotos antes/depois de corpo",
        "Sem termos sem base científica",
      ],
    },
  },
};

export function VerticalHeroDemoPlayer({ vertical }: { vertical: string }) {
  const inputProps = VERTICAL_DEMO_DATA[vertical] ?? VERTICAL_DEMO_DATA.medicos;

  return (
    <Player
      component={VerticalHeroDemo}
      inputProps={inputProps}
      durationInFrames={820}
      compositionWidth={720}
      compositionHeight={420}
      fps={30}
      loop
      autoPlay
      controls={false}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 20,
      }}
    />
  );
}
