import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const AnimatedChart = ({
  pair = "EUR/USD",
  timeframe = "15m",
  pnl = "-$2,450.00",
  width = "100%",
  height = "100%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── DYNAMIC CAMERA ZOOM ON SWEEP (FRAMES 22 -> 95) ───
  const cameraScale = interpolate(
    frame,
    [22, 45, 75, 95],
    [1.0, 1.15, 1.15, 1.04],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ─── CANDLESTICK COORDINATES & TIMINGS ───
  const c4Open = 440;
  const c4Close = 260;
  const c4High = 240;
  const c4Low = 450;

  // Stop-Loss level (Y coordinate in viewBox)
  const stopLossY = 550;
  const retailEntryY = 260;

  // Candle 5 (Liquidity Sweep Wick & Bearish Rejection)
  const c5WickLow = interpolate(frame, [25, 48], [260, 680], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c5BodyClose = interpolate(frame, [25, 48], [260, 580], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isSweepStarted = frame >= 25;
  const isSlBreached = frame >= 40;

  // Candle 6 (Follow-through Bearish continuation after frame 65)
  const c6Opacity = interpolate(frame, [65, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const c6Progress = interpolate(frame, [65, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Popup Alert Spring and Opacity when SL is hit
  const alertScale = spring({
    frame: frame - 42,
    fps,
    config: { damping: 12, mass: 0.8 },
  });
  const alertOpacity = interpolate(frame, [40, 48, 88, 98], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow for SL line and alerts
  const pulse = Math.sin(frame / 6) * 0.25 + 0.75;

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* AMBIENT GLOW INSIDE PANEL */}
      <div
        style={{
          position: "absolute",
          top: 100,
          right: 80,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: isSlBreached
            ? "radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(10, 15, 29, 0) 70%)"
            : "radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(10, 15, 29, 0) 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />

      {/* TOP TRADINGVIEW HEADER BAR */}
      <div
        style={{
          height: 80,
          padding: "0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(10, 14, 24, 0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 20,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            }}
          >
            {pair}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              backgroundColor: "rgba(56, 189, 248, 0.12)",
              color: "#38BDF8",
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid rgba(56, 189, 248, 0.3)",
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            }}
          >
            {timeframe}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#64748B",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: "0.08em",
            }}
          >
            <span>•</span>
            <span>SMART MONEY LIQUIDITY ENGINE</span>
          </div>
        </div>

        {/* LIVE TICKER */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: isSlBreached
                ? "rgba(239, 68, 68, 0.16)"
                : "rgba(16, 185, 129, 0.16)",
              border: `1px solid ${isSlBreached ? "rgba(239, 68, 68, 0.5)" : "rgba(16, 185, 129, 0.5)"}`,
              padding: "6px 16px",
              borderRadius: 100,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: isSlBreached ? "#EF4444" : "#10B981",
                boxShadow: `0 0 10px ${isSlBreached ? "#EF4444" : "#10B981"}`,
              }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: isSlBreached ? "#EF4444" : "#10B981",
                letterSpacing: "0.08em",
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              }}
            >
              {isSlBreached ? "STOPPED OUT" : "LIVE TICK"}
            </span>
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: isSlBreached ? "#EF4444" : "#10B981",
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            }}
          >
            {isSlBreached ? "1.08284" : "1.08865"}
          </div>
        </div>
      </div>

      {/* SVG CHART CONTAINER WITH DYNAMIC CAMERA ZOOM */}
      <div
        style={{
          flex: 1,
          width: "100%",
          position: "relative",
          transform: `scale(${cameraScale})`,
          transformOrigin: "72% 52%",
          transition: "transform 0.05s ease-out",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1080 870"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            {/* Fine Dotted Grid Pattern */}
            <pattern
              id="chartGrid"
              width="115"
              height="90"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 115 0 L 0 0 0 90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </pattern>

            <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>

            <linearGradient id="fvgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.18)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.02)" />
            </linearGradient>
          </defs>

          {/* BACKGROUND GRID */}
          <rect width="1080" height="870" fill="url(#chartGrid)" />

          {/* PRICE SCALE LABELS ON RIGHT */}
          {[
            { y: 160, label: "1.09100" },
            { y: 250, label: "1.08860" },
            { y: 350, label: "1.08620" },
            { y: 450, label: "1.08380" },
            { y: 550, label: "1.08140" },
            { y: 650, label: "1.07900" },
            { y: 750, label: "1.07660" },
          ].map((item, idx) => (
            <g key={idx}>
              <line
                x1="40"
                y1={item.y}
                x2="970"
                y2={item.y}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="1"
              />
              <text
                x="985"
                y={item.y + 5}
                fill="#64748B"
                fontSize="15"
                fontWeight="700"
                fontFamily="'JetBrains Mono', 'SF Mono', monospace"
              >
                {item.label}
              </text>
            </g>
          ))}

          {/* LIQUIDITY POOL SHADED ZONE BELOW STOP-LOSS */}
          <rect
            x="480"
            y={stopLossY}
            width="460"
            height="140"
            fill="url(#fvgGrad)"
            stroke="rgba(239, 68, 68, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            rx="8"
          />
          <rect
            x="485"
            y={stopLossY - 26}
            width="225"
            height="22"
            fill="rgba(10, 15, 29, 0.95)"
            stroke="rgba(239, 68, 68, 0.4)"
            strokeWidth="1"
            rx="4"
          />
          <text
            x="495"
            y={stopLossY - 10}
            fill="#EF4444"
            fontSize="12"
            fontWeight="900"
            letterSpacing="0.08em"
            fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          >
            SELL-SIDE LIQUIDITY (SSL)
          </text>

          {/* RETAIL ENTRY LINE (FOMO CHASE BUY) */}
          <line
            x1="520"
            y1={retailEntryY}
            x2="960"
            y2={retailEntryY}
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeDasharray="8 6"
          />
          <rect
            x="760"
            y={retailEntryY - 26}
            width="190"
            height="24"
            fill="#06B6D4"
            rx="4"
          />
          <text
            x="770"
            y={retailEntryY - 10}
            fill="#000000"
            fontSize="12"
            fontWeight="900"
            letterSpacing="0.06em"
            fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          >
            RETAIL ENTRY (FOMO BUY)
          </text>

          {/* RETAIL STOP-LOSS LINE (BREACHED BY SWEEP) */}
          <line
            x1="480"
            y1={stopLossY}
            x2="970"
            y2={stopLossY}
            stroke="#EF4444"
            strokeWidth={isSlBreached ? 3.5 : 2}
            strokeDasharray="10 8"
            style={{
              filter: isSlBreached ? `drop-shadow(0 0 12px rgba(239, 68, 68, ${pulse}))` : "none",
            }}
          />
          <rect
            x="750"
            y={stopLossY - 28}
            width="210"
            height="26"
            fill={isSlBreached ? "#EF4444" : "rgba(239, 68, 68, 0.25)"}
            stroke="#EF4444"
            strokeWidth="1.5"
            rx="4"
          />
          <text
            x="762"
            y={stopLossY - 11}
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="900"
            letterSpacing="0.06em"
            fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          >
            STOP-LOSS HIT (-$2,450.00)
          </text>

          {/* ─── CANDLESTICKS ─── */}
          {/* Candle 0 (x=160, Bullish) */}
          <line x1="160" y1="500" x2="160" y2="620" stroke="#10B981" strokeWidth="3" />
          <rect x="140" y="520" width="40" height="80" rx="3" fill="url(#bullGrad)" />

          {/* Candle 1 (x=275, Bullish continuation) */}
          <line x1="275" y1="460" x2="275" y2="545" stroke="#10B981" strokeWidth="3" />
          <rect x="255" y="480" width="40" height="50" rx="3" fill="url(#bullGrad)" />

          {/* Candle 2 (x=390, Small pullback) */}
          <line x1="390" y1="470" x2="390" y2="525" stroke="#EF4444" strokeWidth="3" />
          <rect x="370" y="480" width="40" height="35" rx="3" fill="url(#bearGrad)" />

          {/* Candle 3 (x=505, Bullish impulse) */}
          <line x1="505" y1="400" x2="505" y2="500" stroke="#10B981" strokeWidth="3" />
          <rect x="485" y="420" width="40" height="70" rx="3" fill="url(#bullGrad)" />

          {/* Candle 4 (x=620, FOMO BREAKOUT PUMP) */}
          <line x1="620" y1={c4High} x2="620" y2={c4Low} stroke="#10B981" strokeWidth="3.5" />
          <rect
            x="598"
            y={c4Close}
            width="44"
            height={c4Open - c4Close}
            rx="4"
            fill="url(#bullGrad)"
            style={{
              filter: "drop-shadow(0 0 16px rgba(16, 185, 129, 0.4))",
            }}
          />

          {/* Candle 5 (x=735, THE LIQUIDITY SWEEP CANDLE) */}
          {/* Upper wick */}
          <line
            x1="735"
            y1={isSweepStarted ? 215 : 240}
            x2="735"
            y2="260"
            stroke={isSweepStarted ? "#EF4444" : "#10B981"}
            strokeWidth="3.5"
          />
          {/* Violent lower wick sweeping through Stop-Loss */}
          <line
            x1="735"
            y1={isSweepStarted ? c5BodyClose : 260}
            x2="735"
            y2={c5WickLow}
            stroke="#EF4444"
            strokeWidth="4"
            style={{
              filter: isSlBreached ? "drop-shadow(0 0 14px rgba(239, 68, 68, 0.95))" : "none",
            }}
          />
          {/* Candle 5 Body */}
          <rect
            x="713"
            y="260"
            width="44"
            height={Math.max(10, c5BodyClose - 260)}
            rx="4"
            fill="url(#bearGrad)"
            style={{
              filter: isSlBreached ? "drop-shadow(0 0 20px rgba(239, 68, 68, 0.7))" : "none",
            }}
          />

          {/* Candle 6 (x=850, Post-Sweep Bearish Follow-through) */}
          {frame >= 65 && (
            <g opacity={c6Opacity}>
              <line
                x1="850"
                y1="570"
                x2="850"
                y2={570 + 150 * c6Progress}
                stroke="#EF4444"
                strokeWidth="3.5"
              />
              <rect
                x="828"
                y="580"
                width="44"
                height={Math.max(12, 110 * c6Progress)}
                rx="4"
                fill="url(#bearGrad)"
              />
            </g>
          )}

          {/* VOLUME BARS AT THE BOTTOM */}
          {[
            { x: 140, h: 60, col: "#10B981" },
            { x: 255, h: 45, col: "#10B981" },
            { x: 370, h: 35, col: "#EF4444" },
            { x: 485, h: 80, col: "#10B981" },
            { x: 598, h: 140, col: "#10B981" },
            { x: 713, h: isSlBreached ? 190 : 70, col: "#EF4444" },
            { x: 828, h: frame >= 65 ? 120 : 0, col: "#EF4444" },
          ].map((bar, i) => (
            <rect
              key={i}
              x={bar.x}
              y={830 - bar.h}
              width="44"
              height={bar.h}
              fill={bar.col}
              opacity="0.35"
              rx="2"
            />
          ))}
        </svg>

        {/* ─── POPUP ALERT: LIQUIDITY SWEPT · STOP-LOSS HIT ─── */}
        {frame >= 40 && frame <= 102 && (
          <div
            style={{
              position: "absolute",
              top: 360,
              left: "50%",
              transform: `translate(-50%, -50%) scale(${alertScale})`,
              opacity: alertOpacity,
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              gap: 16,
              backgroundColor: "rgba(22, 7, 7, 0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "2px solid rgba(239, 68, 68, 0.7)",
              borderRadius: 20,
              padding: "20px 36px",
              boxShadow: `0 0 50px rgba(239, 68, 68, ${pulse}), 0 24px 48px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)`,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.25)",
                border: "2px solid #EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              ⚠️
            </div>
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#EF4444",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                }}
              >
                LIQUIDITY SWEPT
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "-0.01em",
                  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                }}
              >
                STOP-LOSS HIT ({pnl})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
