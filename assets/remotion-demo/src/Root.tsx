import "./index.css";

import { Composition } from "remotion";
import { MyComposition } from "./Composition";

// Intro: 120f + 6 screens × 150f + Outro: 120f = 1140f
// Minus 7 transitions × 18f overlap = -126f
// Total: 1014 frames ≈ 33.8s at 30fps
const DURATION = 1014;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ExtensionDemo"
        component={MyComposition}
        durationInFrames={DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
