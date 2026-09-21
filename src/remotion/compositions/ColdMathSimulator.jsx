import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { BrandLogo } from "../components/BrandLogo.jsx";
import { NoiseOverlay } from "../components/NoiseOverlay.jsx";
import { MonteCarloSimulation } from "../components/MonteCarloSimulation.jsx";
import { useScreenShake } from "../hooks/useScreenShake.js";

export const ColdMathSimulator = ({
  hook = {
    text: "Stop risking 1% per trade on Prop Firms.",
    strikeThroughColor: "#DC2626",
    sfx: "marker_slash_sub_drop.mp3",
  },
  mathExecution = {
    text: "5% Daily limit. 5 consecutive losses = Game Over.",
    stepsToRuin: 5,
    sfx: "fast_negative_chimes.wav",
  },
  probabilityFlex = {
    text: "A 5-loss streak is statistically inevitable.",
    monteCarloLines: 100,
    failureRateText: "85% FAILURE RATE",
    sfx: "cyber_data_crunch.mp3",
  },
  productSolution = {
    text: "Calculate your true survival rate. Link in bio.",
    uiMockup: "monte_carlo_survival_99.png",
    sfx: "tech_success_cut.wav",
  },
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ─── 1. PHYSICAL CONCUSSIVE TRAUMA & CAMERA RECOIL ───
  // Shake 1: Strike-through impact on "1% per trade" (Frame 36)
  const shake1 = useScreenShake(frame, 36, 14, 22);
  // Shake 2: Account Liquidation crash on Trade #5 (Frame 175)
  const shake2 = useScreenShake(frame, 175, 18, 28);
  // Shake 3: 85% FAILURE RATE stamp slam (Frame 285)
  const shake3 = useScreenShake(frame, 285, 12, 18);

  const totalShakeX = shake1.x + shake2.x + shake3.x;
  const totalShakeY = shake1.y + shake2.y + shake3.y;
  const totalShakeRot = shake1.rotation + shake2.rotation + shake3.rotation;
  const redFlash = Math.max(shake1.redFlash, shake2.redFlash, shake3.redFlash);
  const shockBlur = Math.max(shake1.shockBlur, shake2.shockBlur, shake3.shockBlur);
  const scalePunch = Math.max(shake1.scalePunch, shake2.scalePunch, shake3.scalePunch);

  // Slow continuous cinematic camera drift (scale: 1.0 -> 1.025)
  const cameraDrift = interpolate(frame, [0, 450], [1.0, 1.025], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Breathing background ambient gradients
  const ambientRed = interpolate(frame, [30, 60, 220, 285, 340, 360], [0.08, 0.24, 0.16, 0.35, 0.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ambientCyan = interpolate(frame, [0, 340, 370, 450], [0.05, 0.04, 0.28, 0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── 2. ACT 1: THE HOOK (Frames 0 -> 105) ───
  const isAct1 = frame < 108;
  const act1Opacity = interpolate(frame, [0, 12, 98, 106], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const act1Scale = spring({
    frame: frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  // Violent marker strike-through line across "1% per trade" (Frames 35 -> 43)
  const strikeWidth = interpolate(frame, [35, 43], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decal warning after strike
  const decalScale = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 11, mass: 0.6 },
  });

  // ─── 3. ACT 2: MATH EXECUTION (Frames 105 -> 220) ───
  const isAct2 = frame >= 105 && frame < 224;
  const act2Opacity = interpolate(frame, [106, 114, 214, 222], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Buffer progress draining from 100% down to 0%
  const bufferPercent = interpolate(
    frame,
    [112, 125, 138, 151, 168],
    [100, 80, 60, 40, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Liquidation stamp impact at frame 175
  const isLiquidated = frame >= 175;
  const stampScale = spring({
    frame: Math.max(0, frame - 175),
    fps,
    config: { damping: 9, mass: 0.7 },
  });

  // ─── 4. ACT 3: PROBABILITY FLEX (Frames 220 -> 345) ───
  const isAct3 = frame >= 220 && frame < 348;
  const act3Opacity = interpolate(frame, [220, 228, 338, 346], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 85% Failure Rate Badge Slam at frame 285
  const isFailureSlam = frame >= 285;
  const failureBadgeScale = spring({
    frame: Math.max(0, frame - 285),
    fps,
    config: { damping: 10, mass: 0.65 },
  });

  // ─── 5. ACT 4: PRODUCT SOLUTION (Frames 345 -> 450) ───
  const isAct4 = frame >= 345;
  const act4Opacity = interpolate(frame, [345, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const act4Scale = spring({
    frame: Math.max(0, frame - 345),
    fps,
    config: { damping: 13, mass: 0.8 },
  });

  // Hero survival progress ring animation (0% -> 99.4%)
  const animatedSurvival = interpolate(frame, [360, 410], [0, 99.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringRadius = 88;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (animatedSurvival / 100) * ringCircumference;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: "#09090B",
        color: "#E8EDF5",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
        transform: `translate(${totalShakeX}px, ${totalShakeY}px) rotate(${totalShakeRot}deg) scale(${cameraDrift * scalePunch})`,
        filter: shockBlur > 0 ? `blur(${shockBlur}px)` : "none",
      }}
    >
      {/* ─── 35MM TACTILE NOISE OVERLAY ─── */}
      <NoiseOverlay opacity={0.04} />

      {/* ─── CONCUSSIVE RED OPTICAL FLASH ─── */}
      {redFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#EF4444",
            opacity: redFlash,
            pointerEvents: "none",
            zIndex: 100,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* ─── AMBIENT BREATHING GRADIENTS ─── */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1100,
          height: 850,
          background: `radial-gradient(ellipse at center, rgba(220, 38, 38, ${ambientRed}) 0%, transparent 70%)`,
          filter: "blur(110px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "18%",
          left: "50%",
          transform: "translate(-50%, 50%)",
          width: 1100,
          height: 950,
          background: `radial-gradient(ellipse at center, rgba(6, 182, 212, ${ambientCyan}) 0%, rgba(16, 185, 129, ${ambientCyan * 0.7}) 40%, transparent 70%)`,
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ─── FLOATING INSTITUTIONAL TOP BAR (ALWAYS VISIBLE) ─── */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          right: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 30,
        }}
      >
        <BrandLogo size={38} subtitle="AI RISK PROTOCOL" />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(16px)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 800,
            color: "#94A3B8",
            letterSpacing: "0.12em",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isAct4 ? "#10B981" : "#EF4444",
              boxShadow: isAct4 ? "0 0 10px #10B981" : "0 0 10px #EF4444",
            }}
          />
          <span>COLD MATH SIMULATOR // EVAL V4</span>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── ACT 1: THE HOOK (FRAMES 0 -> 105) ─── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {isAct1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "0 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            opacity: act1Opacity,
            transform: `scale(${act1Scale})`,
            zIndex: 10,
          }}
        >
          {/* Eyebrow Chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 22px",
              borderRadius: 999,
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#EF4444",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.15em",
              marginBottom: 44,
            }}
          >
            <span>⚠️ PROP FIRM COMMON DOGMA BUSTED</span>
          </div>

          {/* Main Hook Headline */}
          <h1
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              maxWidth: 960,
              marginBottom: 50,
            }}
          >
            Stop risking{" "}
            <span
              style={{
                position: "relative",
                display: "inline-block",
                color: frame >= 36 ? "#EF4444" : "#FFFFFF",
                textShadow: frame >= 36 ? "0 0 25px rgba(239, 68, 68, 0.6)" : "none",
                transition: "color 0.1s ease",
              }}
            >
              1% per trade
              {/* Blood-Red Strike-Through Bar */}
              <span
                style={{
                  position: "absolute",
                  left: -10,
                  top: "52%",
                  height: 14,
                  width: `${strikeWidth}%`,
                  backgroundColor: hook.strikeThroughColor || "#DC2626",
                  boxShadow: "0 0 30px rgba(220, 38, 38, 0.9)",
                  borderRadius: 7,
                  transform: "translateY(-50%) rotate(-3deg)",
                  pointerEvents: "none",
                }}
              />
            </span>{" "}
            on Prop Firms.
          </h1>

          {/* Fatal Error Decal Box */}
          {frame >= 40 && (
            <div
              style={{
                transform: `scale(${decalScale})`,
                padding: "30px 42px",
                borderRadius: 22,
                backgroundColor: "rgba(20, 10, 14, 0.92)",
                border: "1px solid rgba(239, 68, 68, 0.45)",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(239, 68, 68, 0.3)",
                maxWidth: 880,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#EF4444",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}
              >
                <span>[FATAL MATHEMATICAL ILLUSION]</span>
              </div>
              <p
                style={{
                  fontSize: 24,
                  color: "#CBD5E1",
                  lineHeight: 1.45,
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Traders assume 1% risk per trade is safe.
                <br />
                <strong style={{ color: "#FFFFFF", fontWeight: 800 }}>
                  Under a 5% daily limit, account liquidation is mathematically guaranteed.
                </strong>
              </p>

              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  justifyContent: "space-around",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "#94A3B8",
                }}
              >
                <span>WIN RATE: <strong style={{ color: "#FFFFFF" }}>50.0%</strong></span>
                <span>•</span>
                <span>DAILY LIMIT: <strong style={{ color: "#EF4444" }}>5.0%</strong></span>
                <span>•</span>
                <span>RUIN PROBABILITY: <strong style={{ color: "#EF4444" }}>85.4%</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── ACT 2: MATH EXECUTION - STEPS TO RUIN (FRAMES 105 -> 220) ─── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {isAct2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "200px 60px 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: act2Opacity,
            zIndex: 10,
          }}
        >
          {/* Act 2 Header */}
          <div style={{ textAlign: "center", marginBottom: 38 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 800,
                color: "#EF4444",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              ACT 2 // THE DIRECT ROAD TO LIQUIDATION
            </div>
            <h2
              style={{
                fontSize: 50,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                margin: 0,
                lineHeight: 1.15,
                maxWidth: 960,
              }}
            >
              {mathExecution.text}
            </h2>
          </div>

          {/* 5-Step Liquidation Ladder Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "100%",
              maxWidth: 960,
              position: "relative",
            }}
          >
            {[1, 2, 3, 4, 5].map((step) => {
              const triggerFrame = 112 + (step - 1) * 14;
              const isRevealed = frame >= triggerFrame;
              const isStep5 = step === 5;

              const stepSpring = spring({
                frame: Math.max(0, frame - triggerFrame),
                fps,
                config: { damping: 12, mass: 0.6 },
              });

              if (!isRevealed) {
                return (
                  <div
                    key={step}
                    style={{
                      height: 90,
                      borderRadius: 18,
                      border: "1px dashed rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      color: "#475569",
                    }}
                  >
                    STEP 0{step} // AWAITING TRADE EXECUTION
                  </div>
                );
              }

              const lossAmount = `-$${(step * 1000).toLocaleString()}`;
              const remainingBalance = `$${(100000 - step * 1000).toLocaleString()}`;
              const bufferLeft = `${(100 - step * 20)}% BUFFER REMAINING`;

              return (
                <div
                  key={step}
                  style={{
                    transform: `scale(${stepSpring})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px 28px",
                    borderRadius: 18,
                    backgroundColor: isStep5
                      ? "rgba(220, 38, 38, 0.3)"
                      : step === 4
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(255, 255, 255, 0.035)",
                    border: isStep5
                      ? "2px solid #EF4444"
                      : step === 4
                      ? "1px solid rgba(245, 158, 11, 0.45)"
                      : "1px solid rgba(255, 255, 255, 0.09)",
                    boxShadow: isStep5
                      ? "0 0 50px rgba(239, 68, 68, 0.55), inset 0 0 25px rgba(239, 68, 68, 0.3)"
                      : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        backgroundColor: isStep5 ? "#EF4444" : "#1E293B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#FFFFFF",
                      }}
                    >
                      {step}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#FFFFFF",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Trade #{step}: -1.00% Risk
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isStep5 ? "#FCA5A5" : "#94A3B8",
                          marginTop: 3,
                        }}
                      >
                        EQUITY: {remainingBalance} • TOTAL LOSS: {lossAmount}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
                    <div
                      style={{
                        fontSize: 19,
                        fontWeight: 900,
                        color: isStep5 ? "#EF4444" : step === 4 ? "#F59E0B" : "#38BDF8",
                      }}
                    >
                      {isStep5 ? "💥 5.0% BREACH" : `-${step}.0% LOSS`}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                      {isStep5 ? "ACCOUNT TERMINATED" : bufferLeft}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Drawdown Gauge Bar Placed Right Below Step 5 */}
            <div
              style={{
                marginTop: 14,
                padding: "22px 30px",
                borderRadius: 18,
                backgroundColor: "rgba(10, 13, 22, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#94A3B8",
                  marginBottom: 12,
                }}
              >
                <span>DAILY DRAWDOWN LIMIT: 5.00% ($5,000)</span>
                <span style={{ color: bufferPercent === 0 ? "#EF4444" : "#10B981", fontWeight: 900 }}>
                  {bufferPercent.toFixed(0)}% CAPACITY REMAINING
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 999,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${bufferPercent}%`,
                    background:
                      bufferPercent === 0
                        ? "#EF4444"
                        : bufferPercent <= 20
                        ? "linear-gradient(90deg, #EF4444, #F59E0B)"
                        : "linear-gradient(90deg, #10B981, #06B6D4)",
                    boxShadow: bufferPercent === 0 ? "0 0 30px #EF4444" : "0 0 15px rgba(16, 185, 129, 0.5)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>

            {/* Liquidation Stamp Overlay on Frame 175 */}
            {isLiquidated && (
              <div
                style={{
                  position: "absolute",
                  top: "46%",
                  left: "50%",
                  transform: `translate(-50%, -50%) scale(${stampScale}) rotate(-6deg)`,
                  padding: "30px 56px",
                  borderRadius: 24,
                  backgroundColor: "#160507",
                  border: "4px solid #EF4444",
                  boxShadow: "0 0 90px rgba(239, 68, 68, 0.95), inset 0 0 40px rgba(239, 68, 68, 0.4)",
                  textAlign: "center",
                  zIndex: 40,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#FCA5A5",
                    letterSpacing: "0.25em",
                    marginBottom: 6,
                  }}
                >
                  ● PROP FIRM LIQUIDATION ALERT
                </div>
                <div
                  style={{
                    fontSize: 58,
                    fontWeight: 900,
                    color: "#EF4444",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  GAME OVER
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    marginTop: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  DAILY DRAWDOWN BREACHED: -$5,000.00
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── ACT 3: PROBABILITY FLEX - MONTE CARLO (FRAMES 220 -> 345) ─── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {isAct3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "190px 60px 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: act3Opacity,
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 800,
                color: "#EF4444",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              ACT 3 // MATHEMATICAL REALITY
            </div>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                margin: 0,
                lineHeight: 1.15,
                maxWidth: 960,
              }}
            >
              {probabilityFlex.text}
            </h2>
          </div>

          {/* Monte Carlo 100-Path Vector Simulation */}
          <MonteCarloSimulation
            frame={frame}
            startFrame={225}
            duration={60}
            numLines={probabilityFlex.monteCarloLines || 100}
            failureRate={85}
            width={960}
            height={640}
          />

          {/* 85% Failure Rate Badge Slam (Frame 285+) */}
          <div style={{ width: "100%", maxWidth: 960, marginTop: 28 }}>
            {isFailureSlam ? (
              <div
                style={{
                  transform: `scale(${failureBadgeScale})`,
                  padding: "28px 40px",
                  borderRadius: 22,
                  backgroundColor: "rgba(22, 8, 12, 0.95)",
                  border: "2px solid #EF4444",
                  boxShadow: "0 0 60px rgba(239, 68, 68, 0.65), inset 0 0 30px rgba(239, 68, 68, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#FCA5A5",
                      letterSpacing: "0.15em",
                      marginBottom: 4,
                    }}
                  >
                    BINOMIAL STOCHASTIC ANALYSIS
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#FFFFFF",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Over 100 trades with 50% Win Rate:
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#94A3B8",
                      fontFamily: "'JetBrains Mono', monospace",
                      marginTop: 4,
                    }}
                  >
                    P(Streak ≥ 5 Losses) = <strong style={{ color: "#EF4444" }}>85.4%</strong>
                  </div>
                </div>

                <div
                  style={{
                    padding: "18px 30px",
                    borderRadius: 16,
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                    boxShadow: "0 0 40px rgba(220, 38, 38, 0.9)",
                    textAlign: "center",
                  }}
                >
                  {probabilityFlex.failureRateText || "85% FAILURE RATE"}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "24px 30px",
                  borderRadius: 20,
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  textAlign: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  color: "#64748B",
                }}
              >
                SIMULATING 10,000 STOCHASTIC PROP RUNS...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ─── ACT 4: PRODUCT SOLUTION - SURVIVAL CALCULATOR (FRAMES 345 -> 450) ─── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {isAct4 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "190px 60px 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: act4Opacity,
            transform: `scale(${act4Scale})`,
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 800,
                color: "#10B981",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              ACT 4 // THE MATHEMATICAL SHIELD
            </div>
            <h2
              style={{
                fontSize: 50,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                margin: 0,
                lineHeight: 1.15,
                maxWidth: 960,
              }}
            >
              {productSolution.text}
            </h2>
          </div>

          {/* High-Res Vector Coded Terminal UI Mockup (monte_carlo_survival_99.png) */}
          <div
            style={{
              width: "100%",
              maxWidth: 960,
              borderRadius: 26,
              backgroundColor: "#0C101A",
              border: "1px solid rgba(6, 182, 212, 0.35)",
              boxShadow: "0 40px 90px rgba(0, 0, 0, 0.9), 0 0 60px rgba(6, 182, 212, 0.2)",
              overflow: "hidden",
            }}
          >
            {/* Terminal Window Header */}
            <div
              style={{
                padding: "18px 26px",
                backgroundColor: "#070B14",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#EF4444" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#10B981" }} />
                <span
                  style={{
                    marginLeft: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748B",
                  }}
                >
                  mysmartjournal.app/risk-engine/survival-calculator
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#10B981",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  padding: "5px 12px",
                  borderRadius: 6,
                }}
              >
                OPTIMAL RISK CALIBRATED
              </span>
            </div>

            {/* Terminal Body Grid */}
            <div
              style={{
                padding: "40px 36px",
                display: "grid",
                gridTemplateColumns: "1.2fr 0.95fr",
                gap: 32,
                alignItems: "center",
                background: "linear-gradient(180deg, #0C101A 0%, #080C16 100%)",
              }}
            >
              {/* Left Parameters */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div
                  style={{
                    padding: "18px 22px",
                    borderRadius: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748B", fontWeight: 700 }}>
                    RECOMMENDED RISK CALIBRATION (DYNAMIC LOT)
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#10B981", marginTop: 4 }}>
                    0.25% - 0.35%{" "}
                    <span style={{ fontSize: 15, color: "#94A3B8", fontWeight: 500 }}>
                      per trade ($250-$350)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: "18px 22px",
                    borderRadius: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.025)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#64748B", fontWeight: 700 }}>
                    CONSECUTIVE LOSSES TO BREACH 5% DAILY LIMIT
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#38BDF8", marginTop: 4 }}>
                    20 TRADES{" "}
                    <span style={{ fontSize: 15, color: "#94A3B8", fontWeight: 500 }}>
                      (Vs 5 trades at 1%)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "#94A3B8",
                  }}
                >
                  <span style={{ color: "#10B981", fontWeight: 800 }}>✓</span>
                  <span>Probability of 20 consecutive losses: &lt; 0.0001%</span>
                </div>
              </div>

              {/* Right Hero Circular Gauge: 99.4% Survival Rate */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                  borderRadius: 22,
                  backgroundColor: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  boxShadow: "0 0 50px rgba(16, 185, 129, 0.18)",
                }}
              >
                {/* SVG Circular Progress Ring */}
                <div style={{ position: "relative", width: 210, height: 210 }}>
                  <svg width="210" height="210" viewBox="0 0 210 210" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx="105"
                      cy="105"
                      r={ringRadius}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="14"
                      fill="transparent"
                    />
                    <circle
                      cx="105"
                      cy="105"
                      r={ringRadius}
                      stroke="#10B981"
                      strokeWidth="14"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{
                        filter: "drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))",
                        transition: "stroke-dashoffset 0.1s ease",
                      }}
                    />
                  </svg>

                  {/* Centered Number */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 44,
                        fontWeight: 900,
                        color: "#FFFFFF",
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                      }}
                    >
                      {animatedSurvival.toFixed(1)}%
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "#10B981",
                        fontWeight: 800,
                        marginTop: 4,
                        letterSpacing: "0.12em",
                      }}
                    >
                      SURVIVAL
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#10B981",
                    letterSpacing: "0.08em",
                  }}
                >
                  ● FTMO & TOPSTEP COMPLIANT
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Statistical Proof Banner */}
          <div
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              width: "100%",
              maxWidth: 960,
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderRadius: 18,
                backgroundColor: "rgba(220, 38, 38, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#EF4444",
                  letterSpacing: "0.1em",
                }}
              >
                1.00% RISK // CONVENTIONAL DOGMA
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                5 Losses ➔ Account Blown
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#FCA5A5",
                  marginTop: 4,
                }}
              >
                Statistical Ruin Probability: <strong style={{ color: "#EF4444" }}>85.4%</strong>
              </div>
            </div>

            <div
              style={{
                padding: "20px 24px",
                borderRadius: 18,
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                boxShadow: "0 0 25px rgba(16, 185, 129, 0.15)",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#10B981",
                  letterSpacing: "0.1em",
                }}
              >
                0.25% RISK // MYSMARTJOURNAL SHIELD
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                20 Losses ➔ Maximum Cushion
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#86EFAC",
                  marginTop: 4,
                }}
              >
                Calculated Survival Probability: <strong style={{ color: "#10B981" }}>99.4%</strong>
              </div>
            </div>
          </div>

          {/* High-Converting Final CTA Button positioned at Y ~ 1480px */}
          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                padding: "24px 64px",
                borderRadius: 22,
                background: "linear-gradient(90deg, #10B981 0%, #06B6D4 100%)",
                color: "#051410",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "0.02em",
                boxShadow: "0 0 50px rgba(16, 185, 129, 0.6), 0 0 95px rgba(6, 182, 212, 0.35)",
              }}
            >
              <span>CALCULATE YOUR SURVIVAL RATE →</span>
            </div>

            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 15,
                fontWeight: 700,
                color: "#94A3B8",
                letterSpacing: "0.08em",
              }}
            >
              Free Prop Firm Risk Simulator • mysmartjournal.app • Link in bio
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
