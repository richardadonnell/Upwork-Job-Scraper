import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Six distinct 3D perspective entrance styles — one per screenshot.
 * Each returns { rotateX, rotateY, translateX, translateY, translateZ, scale }
 * based on the entrance spring progress + a subtle continuous float.
 */
export type PerspectiveStyle =
  | "swingRight"
  | "orbitLeft"
  | "tiltUp"
  | "zoomDepth"
  | "flipReveal"
  | "riseRotate";

type ScreenSceneProps = {
  image: string;
  title: string;
  subtitle: string;
  perspectiveStyle?: PerspectiveStyle;
};

const getPerspectiveTransform = (
  style: PerspectiveStyle,
  enter: number,
  frame: number,
  fps: number,
) => {
  // Continuous subtle float — makes the card feel alive
  const t = frame / fps;
  const microRx = Math.sin(t * 0.9) * 1.2;
  const microRy = Math.cos(t * 0.65) * 1.2;

  switch (style) {
    case "swingRight": {
      // Swings in from the right on Y-axis
      const ry = interpolate(enter, [0, 1], [-28, 0]);
      const tx = interpolate(enter, [0, 1], [250, 0]);
      const s = interpolate(enter, [0, 1], [0.88, 1]);
      return { rx: microRx, ry: ry + microRy, tx, ty: 0, tz: 0, s };
    }
    case "orbitLeft": {
      // Swings in from the left on Y-axis
      const ry = interpolate(enter, [0, 1], [30, 0]);
      const tx = interpolate(enter, [0, 1], [-250, 0]);
      const s = interpolate(enter, [0, 1], [0.88, 1]);
      return { rx: microRx, ry: ry + microRy, tx, ty: 0, tz: 0, s };
    }
    case "tiltUp": {
      // Tilts up from below on X-axis
      const rx = interpolate(enter, [0, 1], [22, 0]);
      const ty = interpolate(enter, [0, 1], [180, 0]);
      const s = interpolate(enter, [0, 1], [0.92, 1]);
      return { rx: rx + microRx, ry: microRy, tx: 0, ty, tz: 0, s };
    }
    case "zoomDepth": {
      // Zooms in from far away with slight rotation
      const tz = interpolate(enter, [0, 1], [-600, 0]);
      const rx = interpolate(enter, [0, 1], [10, 0]);
      const ry = interpolate(enter, [0, 1], [-6, 0]);
      const s = interpolate(enter, [0, 1], [0.7, 1]);
      return { rx: rx + microRx, ry: ry + microRy, tx: 0, ty: 0, tz, s };
    }
    case "flipReveal": {
      // Quick flip on Y-axis
      const ry = interpolate(enter, [0, 0.45, 1], [-90, -12, 0]);
      const s = interpolate(enter, [0, 1], [0.75, 1]);
      return { rx: microRx, ry: ry + microRy, tx: 0, ty: 0, tz: 0, s };
    }
    case "riseRotate": {
      // Rises from below with X+Y compound rotation
      const rx = interpolate(enter, [0, 1], [-18, 0]);
      const ry = interpolate(enter, [0, 1], [15, 0]);
      const ty = interpolate(enter, [0, 1], [300, 0]);
      const s = interpolate(enter, [0, 1], [0.82, 1]);
      return { rx: rx + microRx, ry: ry + microRy, tx: 0, ty, tz: 0, s };
    }
  }
};

export const ScreenScene: React.FC<ScreenSceneProps> = ({
  image,
  title,
  subtitle,
  perspectiveStyle = "swingRight",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main entrance — slightly underdamped for a satisfying settle
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 80 },
    durationInFrames: Math.round(1.4 * fps),
  });

  const p = getPerspectiveTransform(perspectiveStyle, enterProgress, frame, fps);

  // Dynamic shadow reacts to current rotation angle
  const shadowX = p.ry * 0.6;
  const shadowY = 18 + Math.abs(p.rx) * 0.4;
  const shadowBlur = 50 + Math.abs(p.ry) * 0.8;

  // Edge glow follows entrance — starts as a bright line, fades to subtle
  const edgeGlow = interpolate(
    enterProgress,
    [0.3, 0.7, 1],
    [0, 0.5, 0.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Gloss sweep across the card surface
  const glossPct = interpolate(
    frame,
    [Math.round(0.6 * fps), Math.round(2.8 * fps)],
    [-30, 130],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Title badge springs in partway through
  const badgeProgress = spring({
    frame: frame - Math.round(0.7 * fps),
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: Math.round(0.7 * fps),
  });
  const badgeScale = interpolate(badgeProgress, [0, 1], [0.6, 1]);

  // Subtitle fades in after badge
  const subProgress = spring({
    frame: frame - Math.round(1.1 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.5 * fps),
  });

  return (
    <AbsoluteFill className="bg-[#0a0e17]">
      {/* Ambient radial glow behind the card */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,136,0.05) 0%, transparent 100%)",
        }}
      />

      {/* ──── 3D Perspective Container ──── */}
      <AbsoluteFill
        style={{
          perspective: 1200,
          perspectiveOrigin: "50% 48%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* The floating screenshot card */}
        <div
          style={{
            width: "84%",
            height: "84%",
            transformStyle: "preserve-3d",
            transform: [
              `translateX(${p.tx}px)`,
              `translateY(${p.ty}px)`,
              `translateZ(${p.tz}px)`,
              `rotateX(${p.rx}deg)`,
              `rotateY(${p.ry}deg)`,
              `scale(${p.s})`,
            ].join(" "),
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: [
              `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.55)`,
              `0 0 80px rgba(0,255,136,${edgeGlow})`,
            ].join(", "),
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Screenshot image */}
          <Img
            src={staticFile(image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Gloss / light sweep across the surface */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(
                108deg,
                transparent ${glossPct - 15}%,
                rgba(255,255,255,0.06) ${glossPct}%,
                transparent ${glossPct + 15}%
              )`,
              pointerEvents: "none",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Bottom gradient for text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(10,14,23,0.95) 0%, rgba(10,14,23,0.4) 25%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* ──── Title Badge ──── */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 0 54px 80px",
        }}
      >
        <div
          style={{
            transform: `scale(${badgeScale})`,
            opacity: badgeProgress,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 4,
                height: 34,
                borderRadius: 2,
                background: "#00ff88",
                boxShadow: "0 0 14px rgba(0,255,136,0.5)",
              }}
            />
            <h2
              className="text-[38px] font-bold text-white"
              style={{
                lineHeight: 1.1,
                textShadow: "0 2px 20px rgba(0,0,0,0.9)",
              }}
            >
              {title}
            </h2>
          </div>
          <p
            className="text-[20px]"
            style={{
              color: "rgba(255,255,255,0.6)",
              opacity: subProgress,
              paddingLeft: 18,
              textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            }}
          >
            {subtitle}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
