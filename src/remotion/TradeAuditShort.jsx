import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

export const TradeAuditShort = ({
  pair = "EUR/USD",
  tradePair,
  direction = "LONG",
  entryPrice = "1.08450",
  stopLoss = "1.08250",
  takeProfit = "1.09090",
  rr = "1:3.2",
  overallScore = 8.4,
  disciplineScore,
  psychologyScore,
  executionScore,
  mainLeak = "Late entry beyond M15 discount zone mitigation",
  mainRule = "Wait for liquidity pool sweep before market execution",
  cta = "mysmartjournal.app",
  // New props from scripts.json
  id,
  hookText,
  pnl,
  leakBadge,
  aiScore,
  aiVerdict,
  ctaText,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const resolvedPair = tradePair || pair;
  const resolvedHook = hookText || "Auditing Institutional Edge...";
  const resolvedBadge = leakBadge || (direction === "LONG" ? "Logged Trade Entry" : "Short Execution");
  const resolvedVerdict = aiVerdict || mainLeak;
  const resolvedRule = leakBadge ? `Risk desk mandatory protocol: ${leakBadge}` : mainRule;
  const resolvedCta = ctaText || cta;

  const isScale100 = typeof aiScore === "number";
  const numericScore = isScale100 ? aiScore : (typeof overallScore === "number" ? overallScore * 10 : 84);
  const targetScoreFill = isScale100 ? numericScore : (numericScore / 10);
  const scoreColor = numericScore < 40 ? "#EF4444" : numericScore < 70 ? "#F59E0B" : "#10B981";

  const resolvedDiscipline = disciplineScore ?? Math.max(1, Math.min(10, (numericScore / 10) * 1.05));
  const resolvedPsychology = psychologyScore ?? Math.max(1, Math.min(10, (numericScore / 10) * 0.95));
  const resolvedExecution = executionScore ?? Math.max(1, Math.min(10, (numericScore / 10) * 1.0));

  // ─── TRANSITIONS & TIMELINE ───────────────────────────────────────────────
  // Scene 1: Trade Submission & Scan (0 -> 75 frames)
  // Scene 2: Score & Rubric Reveal (70 -> 175 frames)
  // Scene 3: Identified Leak & Institutional Rule (165 -> 250 frames)
  // Scene 4: Outro & Call to Action (240 -> 300 frames)

  const scene1Opacity = interpolate(frame, [0, 15, 65, 75], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene1Scale = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const scene2Opacity = interpolate(frame, [72, 85, 165, 175], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene2Scale = spring({
    frame: frame - 72,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const scene3Opacity = interpolate(frame, [172, 185, 242, 252], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene3Scale = spring({
    frame: frame - 172,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const scene4Opacity = interpolate(frame, [248, 260, 300], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene4Scale = spring({
    frame: frame - 248,
    fps,
    config: { damping: 12, mass: 0.8 },
  });

  // Dynamic animations within scenes
  const scanBarProgress = interpolate(frame, [25, 65], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scoreFill = interpolate(frame, [85, 135], [0, targetScoreFill], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barDiscipline = interpolate(frame, [100, 140], [0, resolvedDiscipline * 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barPsychology = interpolate(frame, [110, 150], [0, resolvedPsychology * 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barExecution = interpolate(frame, [120, 160], [0, resolvedExecution * 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse & ambient glow
  const glowPulse = Math.sin(frame / 8) * 0.15 + 0.85;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: "#080C14",
        color: "#E8EDF5",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "100px 70px 120px 70px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* AMBIENT BACKGROUND GLOWS */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -100,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(8, 12, 20, 0) 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: -100,
          width: 750,
          height: 750,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(8, 12, 20, 0) 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />

      {/* TOP HEADER (PERSISTENT BRAND) */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "2px solid #10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(16, 185, 129, 0.35)",
            }}
          >
            <span style={{ fontSize: 30, color: "#10B981", fontWeight: 900 }}>⚡</span>
          </div>
          <div>
            <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>
              My<span style={{ color: "#10B981" }}>Smart</span>Journal
            </h1>
            <p style={{ fontSize: 20, color: "#6B7FA3", margin: 0, fontWeight: 600 }}>
              AI RISK & PERFORMANCE DESK
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            padding: "12px 24px",
            borderRadius: 100,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#10B981",
              boxShadow: `0 0 16px rgba(16, 185, 129, ${glowPulse})`,
            }}
          />
          <span style={{ fontSize: 20, fontWeight: 800, color: "#10B981", letterSpacing: "0.05em" }}>
            LIVE AUDIT
          </span>
        </div>
      </div>

      {/* ─── SCENE 1: THE TRADE INPUT & SCAN (0 - 75 frames) ─── */}
      {frame < 80 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${scene1Scale})`,
            opacity: scene1Opacity,
            width: 940,
            zIndex: 5,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: scoreColor,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                backgroundColor: `${scoreColor}18`,
                padding: "8px 24px",
                borderRadius: 8,
                border: `1px solid ${scoreColor}44`,
              }}
            >
              {resolvedBadge}
            </span>
            <h2
              style={{
                fontSize: 52,
                fontWeight: 900,
                margin: "24px 0 0 0",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                textTransform: "uppercase",
              }}
            >
              {resolvedHook}
            </h2>
          </div>

          <div
            style={{
              backgroundColor: "#0D1421",
              borderRadius: 32,
              border: "2px solid #1E2D45",
              padding: 50,
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* LASER SCANNING BAR */}
            <div
              style={{
                position: "absolute",
                top: `${scanBarProgress}%`,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: "#3B82F6",
                boxShadow: "0 0 28px 8px rgba(59, 130, 246, 0.8)",
                zIndex: 2,
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
              <div>
                <span style={{ fontSize: 24, color: "#6B7FA3", fontWeight: 600 }}>ASSET PAIR</span>
                <p style={{ fontSize: 52, fontWeight: 900, margin: "4px 0 0 0" }}>{resolvedPair}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {pnl && (
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: pnl.startsWith("-") ? "#EF4444" : "#10B981",
                      backgroundColor: pnl.startsWith("-") ? "rgba(239, 68, 68, 0.16)" : "rgba(16, 185, 129, 0.16)",
                      padding: "14px 26px",
                      borderRadius: 16,
                      border: `2px solid ${pnl.startsWith("-") ? "rgba(239, 68, 68, 0.35)" : "rgba(16, 185, 129, 0.35)"}`,
                    }}
                  >
                    {pnl}
                  </div>
                )}
                <div
                  style={{
                    backgroundColor: direction === "LONG" ? "rgba(16, 185, 129, 0.16)" : "rgba(239, 68, 68, 0.16)",
                    border: `2px solid ${direction === "LONG" ? "#10B981" : "#EF4444"}`,
                    color: direction === "LONG" ? "#10B981" : "#EF4444",
                    fontSize: 32,
                    fontWeight: 900,
                    padding: "16px 36px",
                    borderRadius: 16,
                  }}
                >
                  {direction}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 20,
                backgroundColor: "#101926",
                padding: 30,
                borderRadius: 20,
                border: "1px solid #1E2D45",
              }}
            >
              <div>
                <span style={{ fontSize: 20, color: "#6B7FA3" }}>ENTRY</span>
                <p style={{ fontSize: 32, fontWeight: 800, margin: "6px 0 0 0" }}>{entryPrice}</p>
              </div>
              <div>
                <span style={{ fontSize: 20, color: "#EF4444" }}>STOP LOSS</span>
                <p style={{ fontSize: 32, fontWeight: 800, margin: "6px 0 0 0" }}>{stopLoss}</p>
              </div>
              <div>
                <span style={{ fontSize: 20, color: "#10B981" }}>TAKE PROFIT</span>
                <p style={{ fontSize: 32, fontWeight: 800, margin: "6px 0 0 0" }}>{takeProfit}</p>
              </div>
            </div>

            <div
              style={{
                marginTop: 32,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 26, color: "#94A3B8", fontWeight: 700 }}>Risk:Reward Profile</span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#6366F1",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  padding: "8px 24px",
                  borderRadius: 12,
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                }}
              >
                {rr}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCENE 2: SCORE & RUBRIC REVEAL (70 - 175 frames) ─── */}
      {frame >= 70 && frame < 180 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${scene2Scale})`,
            opacity: scene2Opacity,
            width: 940,
            zIndex: 6,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#10B981",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              AI Risk Desk Verdict
            </span>
            <h2
              style={{
                fontSize: 60,
                fontWeight: 900,
                margin: "20px 0 0 0",
                letterSpacing: "-0.03em",
              }}
            >
              Prop Firm Calibration
            </h2>
          </div>

          <div
            style={{
              backgroundColor: "#0D1421",
              borderRadius: 36,
              border: "2px solid #1E2D45",
              padding: 50,
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 36,
            }}
          >
            {/* BIG CIRCULAR SCORE */}
            <div
              style={{
                width: 260,
                height: 260,
                borderRadius: "50%",
                border: `8px solid ${scoreColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 60px ${scoreColor}44`,
                backgroundColor: `${scoreColor}14`,
              }}
            >
              <span style={{ fontSize: 92, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                {scoreFill.toFixed(isScale100 ? 0 : 1)}
              </span>
              <span style={{ fontSize: 24, color: "#6B7FA3", fontWeight: 800, marginTop: 6 }}>
                {isScale100 ? "/ 100 AI SCORE" : "/ 10 OVERALL"}
              </span>
            </div>

            {/* THREE BREAKDOWN BARS */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
              {/* DISCIPLINE */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#E8EDF5" }}>Discipline & Risk Caps</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#10B981" }}>
                    {(barDiscipline / 10).toFixed(1)}/10
                  </span>
                </div>
                <div style={{ width: "100%", height: 16, backgroundColor: "#101926", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${barDiscipline}%`,
                      height: "100%",
                      backgroundColor: "#10B981",
                      borderRadius: 8,
                      boxShadow: "0 0 16px rgba(16, 185, 129, 0.5)",
                    }}
                  />
                </div>
              </div>

              {/* PSYCHOLOGY */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#E8EDF5" }}>Psychological Discipline</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#3B82F6" }}>
                    {(barPsychology / 10).toFixed(1)}/10
                  </span>
                </div>
                <div style={{ width: "100%", height: 16, backgroundColor: "#101926", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${barPsychology}%`,
                      height: "100%",
                      backgroundColor: "#3B82F6",
                      borderRadius: 8,
                      boxShadow: "0 0 16px rgba(59, 130, 246, 0.5)",
                    }}
                  />
                </div>
              </div>

              {/* EXECUTION */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#E8EDF5" }}>Technical Execution (SMC)</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#F59E0B" }}>
                    {(barExecution / 10).toFixed(1)}/10
                  </span>
                </div>
                <div style={{ width: "100%", height: 16, backgroundColor: "#101926", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${barExecution}%`,
                      height: "100%",
                      backgroundColor: "#F59E0B",
                      borderRadius: 8,
                      boxShadow: "0 0 16px rgba(245, 158, 11, 0.5)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCENE 3: LEAKS & ACTIONABLE CORRECTION (165 - 250 frames) ─── */}
      {frame >= 165 && frame < 255 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${scene3Scale})`,
            opacity: scene3Opacity,
            width: 940,
            zIndex: 7,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#EF4444",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              Trading Leak Identified
            </span>
            <h2
              style={{
                fontSize: 60,
                fontWeight: 900,
                margin: "20px 0 0 0",
                letterSpacing: "-0.03em",
              }}
            >
              Institutional Feedback
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* LEAK CARD */}
            <div
              style={{
                backgroundColor: "#0D1421",
                borderRadius: 28,
                border: "2px solid rgba(239, 68, 68, 0.4)",
                padding: 40,
                boxShadow: "0 20px 40px rgba(239, 68, 68, 0.15)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>⚠️</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#EF4444", letterSpacing: "0.05em" }}>
                  IDENTIFIED LEAK
                </span>
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.4, color: "#E8EDF5" }}>
                "{resolvedVerdict}"
              </p>
            </div>

            {/* RULE CARD */}
            <div
              style={{
                backgroundColor: "#0D1421",
                borderRadius: 28,
                border: "2px solid rgba(16, 185, 129, 0.4)",
                padding: 40,
                boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>🎯</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: "#10B981", letterSpacing: "0.05em" }}>
                  ACTIONABLE PROTOCOL
                </span>
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.4, color: "#E8EDF5" }}>
                "{resolvedRule}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCENE 4: CALL TO ACTION & OUTRO (245 - 300 frames) ─── */}
      {frame >= 245 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${scene4Scale})`,
            opacity: scene4Opacity,
            width: 940,
            textAlign: "center",
            zIndex: 8,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 30,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "3px solid #10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 50px rgba(16, 185, 129, 0.4)",
              margin: "0 auto 36px auto",
            }}
          >
            <span style={{ fontSize: 64, color: "#10B981" }}>⚡</span>
          </div>

          <h2
            style={{
              fontSize: 72,
              fontWeight: 900,
              margin: 0,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            STOP BLOWING ACCOUNTS.
          </h2>
          <p
            style={{
              fontSize: 36,
              color: "#94A3B8",
              margin: "24px auto 50px auto",
              maxWidth: 780,
              lineHeight: 1.4,
              fontWeight: 600,
            }}
          >
            Turn every trade into institutional risk data with AI.
          </p>

          <div
            style={{
              backgroundColor: "#10B981",
              color: "#000",
              fontSize: 38,
              fontWeight: 900,
              padding: "26px 60px",
              borderRadius: 20,
              boxShadow: "0 10px 40px rgba(16, 185, 129, 0.5)",
              display: "inline-block",
              letterSpacing: "-0.01em",
            }}
          >
            Audit Free → {resolvedCta}
          </div>
        </div>
      )}

      {/* BOTTOM FOOTER */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          borderTop: "1px solid rgba(30, 45, 69, 0.6)",
          paddingTop: 30,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 24, color: "#6B7FA3", fontWeight: 700, letterSpacing: "0.08em" }}>
          THE INSTITUTIONAL TRADING JOURNAL • POWERED BY GPT-4o
        </span>
      </div>
    </div>
  );
};
