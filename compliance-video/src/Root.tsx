import { Composition } from "remotion";
import { ComplianceVideo, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH, TOTAL_DURATION } from "./ComplianceVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ComplianceVideo"
        component={ComplianceVideo}
        durationInFrames={TOTAL_DURATION}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{}}
      />
    </>
  );
};
