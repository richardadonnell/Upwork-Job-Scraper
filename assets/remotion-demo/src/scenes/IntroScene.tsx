import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo / icon entrance
  const iconScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
    durationInFrames: Math.round(0.8 * fps),
  });

  // Title entrance
  const titleProgress = spring({
    frame: frame - Math.round(0.3 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.6 * fps),
  });
  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);

  // Subtitle entrance
  const subtitleProgress = spring({
    frame: frame - Math.round(0.7 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.6 * fps),
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [40, 0]);

  // Tagline entrance
  const taglineProgress = spring({
    frame: frame - Math.round(1.1 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.6 * fps),
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [30, 0]);

  // Animated green line
  const lineWidth = interpolate(
    frame,
    [0.5 * fps, 1.2 * fps],
    [0, 200],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill className="bg-[#0a0e17]">
      {/* Subtle grid background */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,255,136,0.08) 0%, transparent 60%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Icon */}
        <Img
          src={staticFile("logo-128.png")}
          style={{
            transform: `scale(${iconScale})`,
            marginBottom: 30,
            width: 100,
            height: 100,
            borderRadius: 22,
            boxShadow: "0 0 50px rgba(61,214,140,0.4)",
          }}
        />

        {/* Title */}
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleProgress,
          }}
        >
          <h1
            className="text-[56px] font-bold text-white text-center"
            style={{ lineHeight: 1.1 }}
          >
            Upwork Job Scraper
          </h1>
        </div>

        {/* Green accent line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
            marginTop: 16,
            marginBottom: 16,
            borderRadius: 2,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            transform: `translateY(${subtitleY}px)`,
            opacity: subtitleProgress,
          }}
        >
          <p
            className="text-[26px] font-medium text-center"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            + Webhook Extension
          </p>
        </div>

        {/* Tagline */}
        <div
          style={{
            transform: `translateY(${taglineY}px)`,
            opacity: taglineProgress,
            marginTop: 8,
          }}
        >
          <p
            className="text-[20px] text-center"
            style={{ color: "rgba(0,255,136,0.7)" }}
          >
            Automate your Upwork job hunt
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
