import React, { useMemo } from "react";
import { interpolate } from "remotion";

/**
 * Fast deterministic PRNG (mulberry32) for reproducible simulation curves
 */
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * MonteCarloSimulation
 * Renders 100 simulated equity curves with 85% statistically crossing the -5% daily limit.
 */
export const MonteCarloSimulation = ({
  frame,
  startFrame = 225,
  duration = 60,
  numLines = 100,
  failureRate = 85,
  width = 960,
  height = 640,
}) => {
  // Animation progress from 0.0 to 1.0
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Precompute 100 deterministic paths once
  const { paths, thresholdY, initialY } = useMemo(() => {
    const rng = mulberry32(428913);
    const stepsCount = 32; // 32 trade intervals along X axis
    const paddingLeft = 36;
    const paddingRight = 36;
    const usableW = width - paddingLeft - paddingRight;

    // Y mapping:
    // 100k (start) -> Y ~ 150
    // 95k (-5% breach) -> Y ~ 510
    // 103k (+3% peak) -> Y ~ 70
    const startY = 150;
    const limitY = 510;

    const generated = [];

    for (let i = 0; i < numLines; i++) {
      const willBreach = i < failureRate;
      const points = [];
      let curVal = 100000;
      let hasBreached = false;
      let breachIdx = -1;

      // Start point
      points.push({
        x: paddingLeft,
        y: startY,
        val: curVal,
        breached: false,
      });

      // Target step where breach will happen if willBreach is true (between step 8 and 24)
      const targetBreachStep = willBreach
        ? Math.floor(rng() * 14) + 9
        : -1;

      for (let s = 1; s <= stepsCount; s++) {
        const x = paddingLeft + (s / stepsCount) * usableW;

        if (willBreach) {
          if (!hasBreached) {
            if (s >= targetBreachStep) {
              // Forced downward streak (5 losses)
              curVal -= 1000 + (rng() - 0.5) * 200;
              if (curVal <= 95000) {
                curVal = 94850 - rng() * 600;
                hasBreached = true;
                breachIdx = s;
              }
            } else {
              // Random walk before breach
              const delta = (rng() > 0.52 ? 1000 : -1000) + (rng() - 0.5) * 400;
              curVal = Math.max(96200, Math.min(102500, curVal + delta));
            }
          } else {
            // Post breach drift downward / choppy liquidation
            curVal += (rng() - 0.65) * 800;
          }
        } else {
          // Safe surviving path: maintains buffer above 96,500
          const delta = (rng() > 0.44 ? 1000 : -1000) + (rng() - 0.5) * 350;
          curVal = Math.max(96400, Math.min(103800, curVal + delta));
        }

        // Map val to Y: 100k -> 120, 95k -> 430
        const y = startY + ((100000 - curVal) / 5000) * (limitY - startY);

        points.push({
          x,
          y: Math.min(height - 15, Math.max(25, y)),
          val: curVal,
          breached: hasBreached,
        });
      }

      generated.push({
        id: i,
        willBreach,
        breachIdx,
        points,
      });
    }

    return {
      paths: generated,
      thresholdY: limitY,
      initialY: startY,
    };
  }, [numLines, failureRate, width, height]);

  // Compute how many paths have currently breached based on progress
  const currentBreachedCount = useMemo(() => {
    if (progress <= 0) return 0;
    const currentMaxStep = progress * 30;
    let count = 0;
    for (const p of paths) {
      if (p.willBreach && p.breachIdx !== -1 && p.breachIdx <= currentMaxStep) {
        count++;
      }
    }
    return count;
  }, [progress, paths]);

  // Grid lines
  const gridLines = [
    { label: "+2.0% ($102,000)", y: initialY - (2 / 5) * (thresholdY - initialY), color: "rgba(255,255,255,0.06)" },
    { label: "0.0% ($100,000) START", y: initialY, color: "rgba(255,255,255,0.12)", isBold: true },
    { label: "-2.5% ($97,500)", y: initialY + 0.5 * (thresholdY - initialY), color: "rgba(255,255,255,0.06)" },
    { label: "-5.0% ($95,000) DAILY LIMIT", y: thresholdY, color: "#EF4444", isCritical: true },
  ];

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        backgroundColor: "rgba(10, 13, 22, 0.95)",
        borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Top Telemetry Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
          background: "linear-gradient(180deg, rgba(20, 26, 42, 0.6) 0%, transparent 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: currentBreachedCount > 0 ? "#EF4444" : "#06B6D4",
              boxShadow: currentBreachedCount > 0 ? "0 0 10px #EF4444" : "0 0 10px #06B6D4",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#E2E8F0", letterSpacing: "0.06em" }}>
            MONTE CARLO SIMULATION: 100 PROP ACCOUNTS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12 }}>
          <span style={{ color: "#64748B" }}>
            RISK: <strong style={{ color: "#CBD5E1" }}>1.0% / TRADE</strong>
          </span>
          <span style={{ color: "#64748B" }}>
            WIN RATE: <strong style={{ color: "#CBD5E1" }}>50%</strong>
          </span>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#EF4444",
              fontWeight: 800,
            }}
          >
            LIQUIDATED: {currentBreachedCount} / {numLines}
          </div>
        </div>
      </div>

      {/* SVG Canvas for 100 Paths */}
      <svg
        width={width}
        height={height - 50}
        style={{ position: "absolute", top: 50, left: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="breachThresholdGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#EF4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.3" />
          </linearGradient>

          <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#EF4444" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* Horizontal Technical Grid Lines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line
              x1={20}
              y1={line.y}
              x2={width - 20}
              y2={line.y}
              stroke={line.isCritical ? "url(#breachThresholdGrad)" : line.color}
              strokeWidth={line.isCritical ? 2.5 : line.isBold ? 1.5 : 1}
              strokeDasharray={line.isCritical ? "8 6" : line.isBold ? "none" : "3 4"}
            />
            <text
              x={width - 28}
              y={line.y - 6}
              textAnchor="end"
              fill={line.isCritical ? "#EF4444" : "#64748B"}
              fontSize={line.isCritical ? 11 : 9.5}
              fontWeight={line.isCritical ? "bold" : "normal"}
              letterSpacing="0.05em"
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* Shaded Red Zone Below -5% Breach Threshold */}
        <rect
          x={20}
          y={thresholdY}
          width={width - 40}
          height={Math.max(0, height - 50 - thresholdY)}
          fill="rgba(239, 68, 68, 0.05)"
        />

        {/* 100 Traced Paths */}
        {paths.map((p) => {
          const visiblePointsCount = Math.max(
            1,
            Math.floor(progress * (p.points.length - 1)) + 1
          );
          const currentPoints = p.points.slice(0, visiblePointsCount);

          if (currentPoints.length < 2) return null;

          const pathData = currentPoints.reduce((acc, pt, idx) => {
            return `${acc} ${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
          }, "");

          const isBreachedNow =
            p.willBreach &&
            p.breachIdx !== -1 &&
            p.breachIdx < visiblePointsCount;

          const strokeColor = isBreachedNow
            ? "rgba(239, 68, 68, 0.55)"
            : p.willBreach
            ? "rgba(148, 163, 184, 0.22)"
            : "rgba(6, 182, 212, 0.7)";

          const strokeW = isBreachedNow ? 1.8 : p.willBreach ? 1.1 : 2.0;

          const lastPt = currentPoints[currentPoints.length - 1];

          return (
            <g key={p.id}>
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* If just reached breach point, render intense impact dot */}
              {isBreachedNow && (
                <circle
                  cx={lastPt.x}
                  cy={lastPt.y}
                  r={2.5}
                  fill="#EF4444"
                  filter="url(#crimsonGlow)"
                />
              )}
            </g>
          );
        })}

        {/* Animated Leading Scanner Cursor */}
        {progress > 0 && progress < 1 && (
          <line
            x1={30 + progress * (width - 60)}
            y1={10}
            x2={30 + progress * (width - 60)}
            y2={height - 60}
            stroke="rgba(6, 182, 212, 0.6)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
      </svg>

      {/* Bottom Status Ticker */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 20,
          right: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: "#94A3B8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#EF4444", fontWeight: 800 }}>● 85 BREACHED</span>
          <span style={{ color: "#475569" }}>|</span>
          <span style={{ color: "#06B6D4", fontWeight: 700 }}>● 15 SURVIVED</span>
        </div>
        <div style={{ color: "#64748B" }}>
          MATHEMATICAL CONCLUSION: <span style={{ color: "#EF4444", fontWeight: 900 }}>RUIN INEVITABLE</span>
        </div>
      </div>
    </div>
  );
};
