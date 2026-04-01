import { Player } from "@remotion/player";
import { HeroDemo } from "@/remotion/HeroDemo";

export function HeroDemoPlayer() {
  return (
    <Player
      component={HeroDemo}
      durationInFrames={820}
      compositionWidth={720}
      compositionHeight={420}
      fps={30}
      loop
      autoPlay
      controls={false}
      acknowledgeRemotionLicense
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 20,
      }}
    />
  );
}
