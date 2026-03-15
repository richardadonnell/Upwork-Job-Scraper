import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Icon entrance
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

  // CTA entrance
  const ctaProgress = spring({
    frame: frame - Math.round(0.8 * fps),
    fps,
    config: { damping: 15, stiffness: 100 },
    durationInFrames: Math.round(0.8 * fps),
  });
  const ctaScale = interpolate(ctaProgress, [0, 1], [0.8, 1]);

  // Stats row entrance
  const statsProgress = spring({
    frame: frame - Math.round(1.2 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.6 * fps),
  });
  const statsY = interpolate(statsProgress, [0, 1], [30, 0]);

  return (
    <AbsoluteFill className="bg-[#0a0e17]">
      {/* Grid background */}
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
            "radial-gradient(ellipse at center, rgba(0,255,136,0.1) 0%, transparent 55%)",
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
            marginBottom: 24,
            width: 90,
            height: 90,
            borderRadius: 20,
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
            className="text-[48px] font-bold text-white text-center"
            style={{ lineHeight: 1.2 }}
          >
            Upwork Job Scraper + Webhook Browser Extension
          </h1>
          <h1
            className="text-[32px] font-medium text-gray-400 text-center"
            style={{ lineHeight:1.6 }}
          >
            Searching sucks. Automate that $h!t.
          </h1>
        </div>

        {/* CTA button */}
        <div
          style={{
            transform: `scale(${ctaScale})`,
            opacity: ctaProgress,
            marginTop: 30,
          }}
        >
          <div
            style={{
              padding: "16px 48px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #00ff88, #00cc6a)",
              color: "#0a0e17",
              fontSize: 22,
              fontWeight: 700,
              boxShadow: "0 0 30px rgba(0,255,136,0.3)",
            }}
          >
            100% Free on Chrome Web Store
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            transform: `translateY(${statsY}px)`,
            opacity: statsProgress,
            marginTop: 40,
            display: "flex",
            gap: 60,
          }}
        >
          {[
            { value: "100%", label: "Free & Open Source" },
            { value: "n8n", label: "Webhook Ready" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                className="text-[28px] font-bold"
                style={{ color: "#00ff88" }}
              >
                {stat.value}
              </span>
              <span
                className="text-[14px]"
                style={{ color: "rgba(255,255,255,0.5)", marginTop: 4 }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
