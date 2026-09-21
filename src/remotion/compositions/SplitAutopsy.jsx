import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { AnimatedChart } from "../components/AnimatedChart.jsx";
import { BrandLogo } from "../components/BrandLogo.jsx";
import { NoiseOverlay } from "../components/NoiseOverlay.jsx";
import { useScreenShake } from "../hooks/useScreenShake.js";

/**
 * Helper to generate kinetic typewriter output with an active weapon-lock cursor █
 */
const renderTypewriter = (text, startFrame, speed, currentFrame) => {
  if (currentFrame < startFrame) return "";
  const charsCount = Math.floor((currentFrame - startFrame) * speed);
  const isDone = charsCount >= text.length;
  const visible = text.slice(0, Math.min(charsCount, text.length));
  const showCursor = !isDone
    ? Math.floor(currentFrame / 3) % 2 === 0
      ? " █"
      : "  "
    : "";
  return visible + showCursor;
};

export const SplitAutopsy = ({
  tradePair = "EUR/USD",
  timeframe = "15m",
  pnl = "-$2,450.00",
  aiScore = 24,
  leakBadge = "TILT WARNING · CRITICAL COGNITIVE LEAK",
  leakTitle = "LATE CHASE INTO RESISTANCE",
  surgicalExplanation = "Entered 18 pips after breakout candle. 0 confirmation. Pure emotional FOMO.",
  fixBadge = "INSTITUTIONAL FIX",
  fixRule = "Wait for pullback into Fair Value Gap (FVG). Do not execute at market high.",
  ctaText = "Audit your next trade free → mysmartjournal.app",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── 1. REMOTION PHYSICS: CAMERA MICRO-DRIFT & STOP-LOSS TRAUMA SHAKE ───
  // Continuous micro-drift over 450 frames: scale 1.0 -> 1.03 with subtle upward drift
  const cameraDriftScale = interpolate(frame, [0, 450], [1.0, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cameraDriftY = interpolate(frame, [0, 450], [0, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stop-Loss trauma impact at frame 42 (when sweep breaches the SL line)
  const shake = useScreenShake(frame, 42, 16, 28);

  // ─── 2. BREATHING RADIAL MESH GRADIENTS ───
  // Dual-frequency organic breathing
  const breathTop = Math.sin(frame / 22) * 0.14 + 0.86;
  const breathBottom = Math.cos(frame / 28) * 0.12 + 0.88;

  // Liquidated loss state (from frame 25 to 240)
  const isLossActive = frame >= 25 && frame < 240;
  const lossAlpha = interpolate(frame, [25, 42, 230, 245], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ─── 3. MID LASER SEPARATOR GLOW ───
  const laserPulse = Math.sin(frame / 5) * 0.35 + 0.65;

  // ─── 4. TIMELINE PHASES (AI TERMINAL) ───
  // Phase 1: Scanner Radar (0 -> 90 frames)
  const isPhase1 = frame < 95;
  const phase1Opacity = interpolate(frame, [85, 93], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanBeamY = (frame * 12) % 760;

  // Phase 2: Diagnostic Reveal & Shock (90 -> 240 frames)
  const isPhase2 = frame >= 90 && frame < 245;
  const phase2Scale = spring({
    frame: frame - 90,
    fps,
    config: { damping: 13, mass: 0.8 },
  });
  const phase2Opacity = interpolate(frame, [90, 98, 236, 244], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const animatedScore = interpolate(frame, [98, 145], [0, aiScore], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Circular gauge: radius 65, circumference ~408.4
  const gaugeCircumference = 2 * Math.PI * 65;
  const gaugeOffset =
    gaugeCircumference - gaugeCircumference * (animatedScore / 100);

  // Tilt alarm pulsing text glow
  const tiltPulse = Math.sin(frame / 3) * 0.35 + 0.65;

  // Phase 3: Institutional Correction (240 -> 380 frames)
  const isPhase3 = frame >= 240 && frame < 385;
  const phase3Scale = spring({
    frame: frame - 240,
    fps,
    config: { damping: 13, mass: 0.8 },
  });
  const phase3Opacity = interpolate(frame, [240, 248, 376, 384], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 4: Brand Outro (380 -> 450 frames)
  const isPhase4 = frame >= 380;
  const phase4Scale = spring({
    frame: frame - 380,
    fps,
    config: { damping: 12, mass: 0.8 },
  });
  const phase4Opacity = interpolate(frame, [380, 392], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonPulse = Math.sin(frame / 6) * 0.15 + 0.85;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: "#09090B",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════
          CINEMATIC SVG FILM GRAIN / NOISE OVERLAY (TACTILE 35MM TEXTURE)
      ══════════════════════════════════════════════════════════════════ */}
      <NoiseOverlay opacity={0.045} />

      {/* ══════════════════════════════════════════════════════════════════
          CONCUSSIVE TRAUMA RED FLASH (TRIGGERED AT FRAME 42 UPON LOSS)
      ══════════════════════════════════════════════════════════════════ */}
      {shake.redFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 85,
            backgroundColor: `rgba(239, 68, 68, ${shake.redFlash})`,
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ANIMATED LOW-OPACITY BREATHING RADIAL MESH GRADIENTS
      ══════════════════════════════════════════════════════════════════ */}
      {/* Top Mesh (behind Chart): Menacing Crimson on Loss, Cyber-Cyan on Normal */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 850 * breathTop,
          height: 850 * breathTop,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${
            isLossActive
              ? `rgba(220, 38, 38, ${0.12 + 0.14 * lossAlpha})`
              : "rgba(6, 182, 212, 0.14)"
          } 0%, rgba(9, 9, 11, 0) 70%)`,
          pointerEvents: "none",
          filter: "blur(90px)",
          zIndex: 1,
          transition: "background 0.3s ease-out",
        }}
      />

      {/* Bottom Mesh (behind Terminal): Cold Cyber-Cyan / Deep Ember */}
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -120,
          width: 900 * breathBottom,
          height: 900 * breathBottom,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${
            isPhase2
              ? "rgba(220, 38, 38, 0.18)"
              : "rgba(6, 182, 212, 0.16)"
          } 0%, rgba(9, 9, 11, 0) 70%)`,
          pointerEvents: "none",
          filter: "blur(100px)",
          zIndex: 1,
          transition: "background 0.3s ease-out",
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          ROOT VIEWPORT WRAPPER (MICRO-DRIFT + PHYSICS SHAKE MATRIX)
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          width: 1080,
          height: 1920,
          padding: "36px 30px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translate3d(${shake.x}px, ${
            shake.y + cameraDriftY
          }px, 0) scale(${cameraDriftScale * shake.scalePunch}) rotate(${
            shake.rotation
          }deg)`,
          transformOrigin: "center 46%",
          filter: shake.shockBlur > 0 ? `blur(${shake.shockBlur}px)` : undefined,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* ════════════════════════════════════════════════════════════════
            TOP PANEL (CHART): FROSTED GLASS HARDWARE CARD
        ════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            width: 1020,
            height: 870,
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            background:
              "linear-gradient(180deg, rgba(18, 24, 38, 0.72) 0%, rgba(10, 13, 22, 0.88) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow:
              "0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}
        >
          <AnimatedChart pair={tradePair} timeframe={timeframe} pnl={pnl} />
        </div>

        {/* ════════════════════════════════════════════════════════════════
            MID SEPARATOR: NEON CYAN LASER TELEMETRY BRIDGE (#06B6D4)
        ════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            width: 1020,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            margin: "6px 0",
          }}
        >
          {/* Neon Laser Line */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: 2,
              backgroundColor: "#06B6D4",
              boxShadow: `0 0 20px #06B6D4, 0 0 40px rgba(6, 182, 212, ${laserPulse})`,
            }}
          />

          {/* Central Telemetry HUD Badge */}
          <div
            style={{
              zIndex: 30,
              backgroundColor: "#080C14",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(6, 182, 212, 0.6)",
              borderRadius: 100,
              padding: "5px 22px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#06B6D4",
                boxShadow: "0 0 8px #06B6D4",
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "#06B6D4",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              }}
            >
              MYSMARTJOURNAL AI CORE • REAL-TIME AUDIT
            </span>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            BOTTOM PANEL (AI TERMINAL): FROSTED GLASS HARDWARE CARD
        ════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            width: 1020,
            height: 920,
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            background:
              "linear-gradient(180deg, rgba(14, 18, 30, 0.75) 0%, rgba(8, 11, 18, 0.92) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow:
              "0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "44px 50px",
            boxSizing: "border-box",
          }}
        >
          {/* ─── PHASE 1: SCANNING RADAR & TYPEWRITER TELEMETRY (0 -> 90 FRAMES) ─── */}
          {isPhase1 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: phase1Opacity,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "44px 50px",
                boxSizing: "border-box",
                zIndex: 10,
              }}
            >
              {/* Vertical Laser Radar Beam */}
              <div
                style={{
                  position: "absolute",
                  top: scanBeamY,
                  left: 0,
                  right: 0,
                  height: 70,
                  background:
                    "linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.12) 75%, rgba(6, 182, 212, 0.7) 100%)",
                  borderBottom: "2px solid #06B6D4",
                  boxShadow: "0 0 24px #06B6D4",
                  pointerEvents: "none",
                  zIndex: 15,
                }}
              />

              {/* Terminal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingBottom: 18,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <BrandLogo size={42} showText={false} />
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#FFFFFF",
                        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      AI RISK ENGINE V4.2
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#06B6D4",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                      }}
                    >
                      PROP TRADING DESK AUDIT
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#38BDF8",
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    backgroundColor: "rgba(6, 182, 212, 0.12)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                  }}
                >
                  FEED: LIVE AUDIT
                </div>
              </div>

              {/* Holographic Target Lock Box */}
              <div
                style={{
                  backgroundColor: "rgba(10, 14, 24, 0.8)",
                  borderRadius: 20,
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  padding: "36px 44px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 26 }}>
                  <div
                    style={{
                      fontSize: 38,
                      fontWeight: 900,
                      color: "#06B6D4",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      textShadow: "0 0 24px rgba(6, 182, 212, 0.6)",
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    }}
                  >
                    [ AI AUTOPSY IN PROGRESS ]
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      color: "#94A3B8",
                      marginTop: 6,
                      fontWeight: 600,
                    }}
                  >
                    Scanning broker execution footprint against institutional depth...
                  </div>
                </div>

                {/* KINETIC TYPEWRITER TELEMETRY LOGS */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    fontSize: 19,
                    lineHeight: 1.35,
                  }}
                >
                  {frame >= 10 && (
                    <div style={{ color: "#38BDF8" }}>
                      {renderTypewriter(
                        `> [TICK-DATA] Parsing order #${tradePair} 5.0 Lots Long...`,
                        10,
                        2.1,
                        frame
                      )}
                    </div>
                  )}
                  {frame >= 26 && (
                    <div style={{ color: "#E2E8F0" }}>
                      {renderTypewriter(
                        "> [SPREAD-SPIKE] Entry: 1.08865 | Chasing deviation: +18.4 pips",
                        26,
                        2.1,
                        frame
                      )}
                    </div>
                  )}
                  {frame >= 42 && (
                    <div
                      style={{
                        color: "#EF4444",
                        fontWeight: 800,
                        textShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
                      }}
                    >
                      {renderTypewriter(
                        `> [LIQUIDATION DETECTED] Stop-Loss swept at key support (${pnl})`,
                        42,
                        2.1,
                        frame
                      )}
                    </div>
                  )}
                  {frame >= 62 && (
                    <div style={{ color: "#F59E0B", fontWeight: 800 }}>
                      {renderTypewriter(
                        "> [BIAS DIAGNOSIS] Psychological trigger: High-stress FOMO breakout chase",
                        62,
                        2.1,
                        frame
                      )}
                    </div>
                  )}
                  {frame >= 78 && (
                    <div
                      style={{
                        color: "#10B981",
                        fontWeight: 900,
                        textShadow: "0 0 10px rgba(16, 185, 129, 0.6)",
                      }}
                    >
                      {renderTypewriter(
                        "> [FINAL VERDICT] Autopsy complete. Synthesizing cognitive leak...",
                        78,
                        2.2,
                        frame
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom HUD Metadata */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  color: "#64748B",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                }}
              >
                <span>NEURAL CLUSTER: LATENCY 12MS</span>
                <span>COMPATIBLE WITH FTMO & MFF</span>
              </div>
            </div>
          )}

          {/* ─── PHASE 2: DIAGNOSTIC REVEAL & SHOCK (90 -> 240 FRAMES) ─── */}
          {isPhase2 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${phase2Scale})`,
                opacity: phase2Opacity,
                width: 920,
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
            >
              {/* TILT WARNING PULSING GLOW BADGE */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "rgba(239, 68, 68, 0.16)",
                  border: "2px solid rgba(239, 68, 68, 0.8)",
                  padding: "10px 28px",
                  borderRadius: 100,
                  boxShadow: `0 0 35px rgba(239, 68, 68, ${
                    tiltPulse * 0.5
                  }), inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#EF4444",
                    boxShadow: "0 0 14px #EF4444",
                  }}
                />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#FF3333",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    textShadow: `0 0 12px rgba(255, 51, 51, ${
                      tiltPulse * 0.85
                    }), 0 0 24px rgba(255, 51, 51, ${tiltPulse * 0.45})`,
                  }}
                >
                  {leakBadge}
                </span>
              </div>

              {/* GIANT KINETIC TITLE */}
              <h2
                style={{
                  fontSize: 50,
                  fontWeight: 900,
                  margin: 0,
                  textAlign: "center",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
              >
                {leakTitle}
              </h2>

              {/* TECHNICAL DISCIPLINE GAUGE & STATS STRIP */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(12, 17, 28, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 22,
                  padding: "26px 36px",
                  boxShadow:
                    "0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {/* Circular Gauge */}
                <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                  <div style={{ position: "relative", width: 140, height: 140 }}>
                    <svg
                      width="140"
                      height="140"
                      viewBox="0 0 140 140"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <circle
                        cx="70"
                        cy="70"
                        r="58"
                        fill="transparent"
                        stroke="#1E293B"
                        strokeWidth="12"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="58"
                        fill="transparent"
                        stroke="#EF4444"
                        strokeWidth="12"
                        strokeDasharray={2 * Math.PI * 58}
                        strokeDashoffset={
                          2 * Math.PI * 58 -
                          (2 * Math.PI * 58 * animatedScore) / 100
                        }
                        strokeLinecap="round"
                        style={{
                          filter: "drop-shadow(0 0 12px rgba(239, 68, 68, 0.85))",
                        }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 42,
                          fontWeight: 900,
                          color: "#EF4444",
                          lineHeight: 1,
                          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                        }}
                      >
                        {Math.round(animatedScore)}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#6B7FA3",
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                        }}
                      >
                        / 100
                      </span>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#FFFFFF",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      DISCIPLINE SCORE
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: "#EF4444",
                        fontWeight: 800,
                        marginTop: 4,
                        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                      }}
                    >
                      FAILS PROP FIRM STANDARDS
                    </div>
                  </div>
                </div>

                {/* Technical Weapon-Lock Stats */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingLeft: 28,
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 14, color: "#64748B", fontWeight: 700 }}>
                      CHASING DISTANCE:{" "}
                    </span>
                    <span style={{ fontSize: 16, color: "#EF4444", fontWeight: 900 }}>
                      +18.4 PIPS
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 14, color: "#64748B", fontWeight: 700 }}>
                      EXECUTION BIAS:{" "}
                    </span>
                    <span style={{ fontSize: 16, color: "#F59E0B", fontWeight: 900 }}>
                      EMOTIONAL FOMO
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 14, color: "#64748B", fontWeight: 700 }}>
                      DRAWDOWN IMPACT:{" "}
                    </span>
                    <span style={{ fontSize: 16, color: "#EF4444", fontWeight: 900 }}>
                      {pnl}
                    </span>
                  </div>
                </div>
              </div>

              {/* KINETIC TYPEWRITER SURGICAL VERDICT CARD */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "rgba(10, 14, 25, 0.9)",
                  borderLeft: "5px solid #EF4444",
                  borderTop: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRight: "1px solid rgba(239, 68, 68, 0.2)",
                  borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "0 18px 18px 0",
                  padding: "24px 32px",
                  boxShadow: "0 15px 35px rgba(239, 68, 68, 0.15)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    color: "#EF4444",
                    fontWeight: 900,
                    marginBottom: 8,
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  AI SURGICAL AUDIT VERDICT:
                </div>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.35,
                    color: "#F8FAFC",
                    fontStyle: "italic",
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                  }}
                >
                  "{renderTypewriter(surgicalExplanation, 102, 1.6, frame)}"
                </p>
              </div>
            </div>
          )}

          {/* ─── PHASE 3: INSTITUTIONAL FIX & SMC PROTOCOL (240 -> 380 FRAMES) ─── */}
          {isPhase3 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${phase3Scale})`,
                opacity: phase3Opacity,
                width: 920,
                zIndex: 25,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
            >
              {/* EMERALD BADGE */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "rgba(16, 185, 129, 0.14)",
                  border: "2px solid #10B981",
                  padding: "10px 28px",
                  borderRadius: 100,
                  boxShadow:
                    "0 0 30px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#10B981",
                    boxShadow: "0 0 14px #10B981",
                  }}
                />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#10B981",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                  }}
                >
                  {fixBadge}
                </span>
              </div>

              {/* PROTOCOL HEADER */}
              <h2
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  margin: 0,
                  textAlign: "center",
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
              >
                SMC EXECUTION PROTOCOL V4
              </h2>

              {/* EMERALD FIX CARD */}
              <div
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(10, 16, 26, 0.9) 100%)",
                  border: "2px solid #10B981",
                  borderRadius: 24,
                  padding: "32px 40px",
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 24 }}>🎯</span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#10B981",
                      letterSpacing: "0.1em",
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    }}
                  >
                    MANDATORY PROP FIRM RULE
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 29,
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1.35,
                    color: "#FFFFFF",
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                  }}
                >
                  "{renderTypewriter(fixRule, 248, 1.8, frame)}"
                </p>
              </div>

              {/* 3-STEP EXECUTION CHECKLIST */}
              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(10, 14, 25, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 16,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: "#10B981",
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    }}
                  >
                    STEP 1: SWEEP
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#E2E8F0",
                      marginTop: 4,
                    }}
                  >
                    Wait for Liquidity Pool run first
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(10, 14, 25, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 16,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: "#38BDF8",
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    }}
                  >
                    STEP 2: FVG
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#E2E8F0",
                      marginTop: 4,
                    }}
                  >
                    Mark Fair Value Gap on M5 chart
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(10, 14, 25, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 16,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: "#F59E0B",
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    }}
                  >
                    STEP 3: LIMIT
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#E2E8F0",
                      marginTop: 4,
                    }}
                  >
                    Set Limit Order — Never buy highs
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── PHASE 4: BRAND OUTRO & CTA (380 -> 450 FRAMES) ─── */}
          {isPhase4 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${phase4Scale})`,
                opacity: phase4Opacity,
                width: 920,
                textAlign: "center",
                zIndex: 30,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* REAL INSTITUTIONAL BOOK LOGO */}
              <BrandLogo
                size={82}
                subtitle="AI RISK & PERFORMANCE DESK"
                style={{ marginBottom: 28 }}
              />

              {/* PUNCHY TITLES */}
              <h2
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
                }}
              >
                STOP DONATING TO THE MARKET.
              </h2>
              <p
                style={{
                  fontSize: 28,
                  color: "#94A3B8",
                  margin: "18px auto 40px auto",
                  maxWidth: 780,
                  lineHeight: 1.4,
                  fontWeight: 600,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
                }}
              >
                Institutional discipline engine for Prop Firm traders.
              </p>

              {/* HIGH-IMPACT CALL TO ACTION BUTTON */}
              <div
                style={{
                  backgroundColor: "#10B981",
                  color: "#041510",
                  fontSize: 32,
                  fontWeight: 900,
                  padding: "24px 54px",
                  borderRadius: 20,
                  boxShadow: `0 0 50px rgba(16, 185, 129, ${buttonPulse})`,
                  display: "inline-block",
                  letterSpacing: "-0.01em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {ctaText}
              </div>

              {/* TRUST BADGE */}
              <div
                style={{
                  marginTop: 36,
                  fontSize: 16,
                  color: "#64748B",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                }}
              >
                JOIN 1,400+ FUNDED TRADERS • FTMO • FUNDEDNEXT • TOPSTEP
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
