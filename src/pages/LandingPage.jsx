import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NoiseOverlay from "../components/NoiseOverlay.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import {
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Terminal,
  Crosshair,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [hoveredLogo, setHoveredLogo] = useState(null);

  // Heavy spring physics for snappy, high-end interactions
  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
  };

  const propFirmLogos = [
    { name: "FTMO", subtitle: "PROP FIRM", symbol: "FTMO" },
    { name: "FundedNext", subtitle: "FUTURES & FX", symbol: "FN" },
    { name: "Topstep", subtitle: "FUTURES LEADER", symbol: "TOPSTEP" },
    { name: "cTrader", subtitle: "ECN PLATFORM", symbol: "cTrader" },
    { name: "MetaTrader", subtitle: "MT4 / MT5", symbol: "MT4/5" },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#09090B] text-[#E8EDF5] overflow-x-hidden selection:bg-[#06B6D4] selection:text-[#000000] font-sans">
      {/* ─── 35MM TACTILE NOISE TEXTURE ─── */}
      <NoiseOverlay opacity={0.04} />

      {/* ─── AMBIENT BREATHING CYBER-CYAN MESH GRADIENT ─── */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[650px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.085) 0%, rgba(16, 185, 129, 0.04) 40%, rgba(9, 9, 11, 0) 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* ─── FLOATING LUXURY NAVBAR ─── */}
      <header className="relative z-40 w-full max-w-7xl mx-auto px-6 py-7 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <BrandLogo size={34} subtitle="AI RISK SHIELD" />
        </Link>

        {/* Live Cluster Status */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-[#94A3B8] uppercase">
            AI CORE V4.2 ACTIVE • MT4/MT5 CONNECTED
          </span>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#94A3B8] hover:text-[#FFFFFF] transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
            onClick={() => navigate("/signup")}
            className="text-xs font-black uppercase tracking-wider bg-white text-[#09090B] px-4 py-2.5 rounded-xl hover:bg-[#E2E8F0] shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all cursor-pointer"
          >
            Get Started
          </motion.button>
        </div>
      </header>

      {/* ─── SECTION 1: THE HERO (ABOVE THE FOLD) ─── */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
        {/* Eyebrow Chip */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.3)] mb-8 backdrop-blur-md"
        >
          <Shield size={14} className="text-[#06B6D4]" />
          <span className="text-[12px] font-mono font-bold tracking-widest text-[#06B6D4] uppercase">
            INSTITUTIONAL RISK SHIELD • PROP FIRM COMPLIANT
          </span>
        </motion.div>

        {/* Massive H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.04] mb-8"
        >
          STOP DONATING YOUR PAYOUTS TO THE MARKET.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.18 }}
          className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-10 font-medium"
        >
          Your ego is a statistical variable. Our AI terminal intercepts your
          tilt and enforces your risk rules before you blow your funded account.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springTransition, delay: 0.25 }}
          className="flex flex-col items-center gap-3.5"
        >
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow:
                "0 0 45px rgba(16, 185, 129, 0.7), 0 0 90px rgba(6, 182, 212, 0.35)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
            onClick={() => navigate("/signup")}
            className="group relative inline-flex items-center gap-3.5 bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-[#051410] font-black text-lg sm:text-xl px-10 py-5 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.45)] cursor-pointer"
          >
            <Zap size={22} className="text-[#051410] fill-[#051410]" />
            <span className="tracking-wide">CONNECT METATRADER FREE</span>
            <ArrowRight
              size={20}
              className="text-[#051410] transition-transform group-hover:translate-x-1"
            />
          </motion.button>

          {/* Micro-copy */}
          <span className="text-xs font-mono font-medium text-[#64748B] tracking-wide">
            Takes 4 seconds. No credit card required.
          </span>
        </motion.div>
      </section>

      {/* ─── SECTION 2: INSTITUTIONAL SOCIAL PROOF ─── */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 pb-24 text-center">
        <p className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#64748B] uppercase mb-8">
          TRUSTED BY FUNDED TRADERS ACROSS ELITE PROP FIRMS
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center justify-center">
          {propFirmLogos.map((firm, idx) => (
            <motion.div
              key={firm.name}
              onMouseEnter={() => setHoveredLogo(firm.name)}
              onMouseLeave={() => setHoveredLogo(null)}
              whileHover={{ scale: 1.05 }}
              transition={springTransition}
              className="px-5 py-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.015)] backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
              style={{
                opacity: hoveredLogo === firm.name ? 1 : 0.45,
                borderColor:
                  hoveredLogo === firm.name
                    ? "rgba(6, 182, 212, 0.4)"
                    : "rgba(255,255,255,0.05)",
                boxShadow:
                  hoveredLogo === firm.name
                    ? "0 0 25px rgba(6, 182, 212, 0.2)"
                    : "none",
              }}
            >
              <span className="font-mono font-black text-base text-white tracking-wider">
                {firm.symbol}
              </span>
              <span className="text-[9px] font-mono font-semibold tracking-widest text-[#94A3B8] mt-1">
                {firm.subtitle}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 3: THE PAIN MIRROR (GLASSMORPHISM CARDS) ─── */}
      <section className="relative z-20 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#EF4444] uppercase">
              THE COGNITIVE FLAW
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-5">
            You don't lack an edge. You lack a shield.
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg">
            92% of blown prop accounts occur during a 45-minute psychological
            blackout. We built mechanical protocols to stop you from pressing
            market execution.
          </p>
        </div>

        {/* 3 Frosted Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Revenge Trading */}
          <motion.div
            whileHover={{ y: -6, borderColor: "rgba(239, 68, 68, 0.4)" }}
            transition={springTransition}
            className="relative rounded-[22px] p-8 overflow-hidden transition-all duration-300"
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              background:
                "linear-gradient(180deg, rgba(20, 14, 18, 0.65) 0%, rgba(12, 10, 16, 0.85) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-mono font-black text-[#EF4444] tracking-widest uppercase">
                01 / TILT INTERCEPTION
              </span>
              <div className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] flex items-center justify-center text-[#EF4444]">
                <Lock size={15} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
              Revenge Trading Lockout
            </h3>

            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 font-medium">
              "The AI detects irrational trade frequency and mechanically locks
              your terminal."
            </p>

            {/* Live Telemetry Pill */}
            <div className="p-3.5 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[rgba(239,68,68,0.25)] font-mono text-[11px] leading-snug text-[#CBD5E1]">
              <div className="text-[#EF4444] font-bold mb-1">
                ⚠️ [CHASE DETECTED]: +18.4 pips beyond entry
              </div>
              <div className="text-[#64748B]">STATUS: TERMINAL FROZEN (30M)</div>
            </div>
          </motion.div>

          {/* Card 2: Daily Drawdown Breach */}
          <motion.div
            whileHover={{ y: -6, borderColor: "rgba(245, 158, 11, 0.4)" }}
            transition={springTransition}
            className="relative rounded-[22px] p-8 overflow-hidden transition-all duration-300"
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              background:
                "linear-gradient(180deg, rgba(20, 18, 14, 0.65) 0%, rgba(12, 11, 9, 0.85) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-mono font-black text-[#F59E0B] tracking-widest uppercase">
                02 / RISK MATRIX
              </span>
              <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center text-[#F59E0B]">
                <AlertTriangle size={15} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
              Drawdown Breach Shield
            </h3>

            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 font-medium">
              "Real-time biometric-style alerts when you are 1% away from your
              daily loss limit."
            </p>

            {/* Live Telemetry Pill */}
            <div className="p-3.5 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[rgba(245,158,11,0.25)] font-mono text-[11px] leading-snug text-[#CBD5E1]">
              <div className="text-[#F59E0B] font-bold mb-1">
                ⚡ DAILY LOSS: -$2,450 / -$2,500 CAP
              </div>
              <div className="text-[#64748B]">BUFFER: 1.2 PIPS BEFORE BREACH</div>
            </div>
          </motion.div>

          {/* Card 3: Lot Size Illusions */}
          <motion.div
            whileHover={{ y: -6, borderColor: "rgba(6, 182, 212, 0.4)" }}
            transition={springTransition}
            className="relative rounded-[22px] p-8 overflow-hidden transition-all duration-300"
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              background:
                "linear-gradient(180deg, rgba(14, 20, 24, 0.65) 0%, rgba(9, 12, 15, 0.85) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-mono font-black text-[#06B6D4] tracking-widest uppercase">
                03 / MONTE CARLO ENGINE
              </span>
              <div className="w-8 h-8 rounded-lg bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center text-[#06B6D4]">
                <Cpu size={15} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
              Lot Size Risk Simulation
            </h3>

            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 font-medium">
              "Automatic Monte Carlo risk simulation blocks sizing errors before
              entry."
            </p>

            {/* Live Telemetry Pill */}
            <div className="p-3.5 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[rgba(6,182,212,0.25)] font-mono text-[11px] leading-snug text-[#CBD5E1]">
              <div className="text-[#06B6D4] font-bold mb-1">
                🎯 PROBABILITY OF RUIN: 0.02%
              </div>
              <div className="text-[#64748B]">MAX ALLOWED: 3.2 LOTS (REJECT 10)</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 4: THE WEAPON (PRODUCT FLEX & LIVE MOCKUP) ─── */}
      <section className="relative z-20 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.3)] mb-4">
            <Crosshair size={14} className="text-[#10B981]" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#10B981] uppercase">
              THE WEAPON // REAL-TIME TERMINAL INTERFACE
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            A high-speed cockpit built for 6-figure accounts.
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg">
            Real-time trade telemetry, live liquidity sweeps, and instant neural
            autopsy on every single tick.
          </p>
        </div>

        {/* Dashboard Coded Mockup with Deep Box Shadow */}
        <div className="relative">
          {/* Floating Live Badge 1 (Tilt Probability Alert) */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-7 left-4 sm:left-10 z-30 px-4 py-2.5 rounded-xl bg-[#140808] border border-[#EF4444] shadow-[0_0_30px_rgba(239,68,68,0.5)] backdrop-blur-xl flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="text-xs font-mono font-black text-white tracking-wide">
              Tilt Probability: 85% 🔴
            </span>
          </motion.div>

          {/* Floating Live Badge 2 (Drawdown Safe) */}
          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 right-4 sm:right-10 z-30 px-4 py-2.5 rounded-xl bg-[#061410] border border-[#10B981] shadow-[0_0_30px_rgba(16,185,129,0.5)] backdrop-blur-xl flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
            <span className="text-xs font-mono font-black text-white tracking-wide">
              Drawdown Safe 🟢 Buffer: +$2,580
            </span>
          </motion.div>

          {/* The Main Terminal Container */}
          <div
            className="relative w-full rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.09)] bg-[#0C101A]"
            style={{
              boxShadow:
                "0 40px 80px -20px rgba(0,0,0,1), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            {/* Terminal Top Window Chrome */}
            <div className="px-6 py-4 bg-[#080C14] border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]/80" />
                <span className="ml-4 text-xs font-mono text-[#64748B] font-bold">
                  terminal://mysmartjournal.app/eval-risk-desk
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs font-mono text-[#94A3B8]">
                <span>
                  EQUITY:{" "}
                  <strong className="text-white font-bold">
                    $104,820.00
                  </strong>
                </span>
                <span>
                  PAYOUT BUFFER:{" "}
                  <strong className="text-[#10B981] font-bold">
                    +$4,820.00 (80%)
                  </strong>
                </span>
                <span>
                  TARGET:{" "}
                  <strong className="text-[#38BDF8] font-bold">
                    FTMO 100K
                  </strong>
                </span>
              </div>
            </div>

            {/* Terminal Body Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-b from-[#0C101A] to-[#070A12]">
              {/* Left Column: Live Chart Preview (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl bg-[#070B14] border border-[rgba(255,255,255,0.07)] p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 border-b border-[rgba(255,255,255,0.05)] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-lg text-white">
                      EUR/USD
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#1E293B] text-[#38BDF8] rounded">
                      15M
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">
                      SMC LIQUIDITY ENGINE
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-[#10B981]">
                      1.08865
                    </span>
                  </div>
                </div>

                {/* SVG Candlestick Preview */}
                <div className="h-56 w-full relative">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 600 220"
                    className="overflow-visible"
                  >
                    {/* Grid lines */}
                    <line
                      x1="0"
                      y1="50"
                      x2="600"
                      y2="50"
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <line
                      x1="0"
                      y1="110"
                      x2="600"
                      y2="110"
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <line
                      x1="0"
                      y1="170"
                      x2="600"
                      y2="170"
                      stroke="rgba(255,255,255,0.04)"
                    />

                    {/* Dotted Stop-Loss line */}
                    <line
                      x1="220"
                      y1="140"
                      x2="580"
                      y2="140"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="400"
                      y="132"
                      fill="#EF4444"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      STOP-LOSS: 1.08320 (-$2,450.00)
                    </text>

                    {/* Candles */}
                    {/* Candle 1 */}
                    <line
                      x1="80"
                      y1="130"
                      x2="80"
                      y2="180"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <rect
                      x="70"
                      y="140"
                      width="20"
                      height="35"
                      fill="#10B981"
                      rx="2"
                    />

                    {/* Candle 2 */}
                    <line
                      x1="150"
                      y1="110"
                      x2="150"
                      y2="160"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <rect
                      x="140"
                      y="120"
                      width="20"
                      height="30"
                      fill="#10B981"
                      rx="2"
                    />

                    {/* Candle 3 (Pullback) */}
                    <line
                      x1="220"
                      y1="115"
                      x2="220"
                      y2="150"
                      stroke="#EF4444"
                      strokeWidth="2"
                    />
                    <rect
                      x="210"
                      y="120"
                      width="20"
                      height="20"
                      fill="#EF4444"
                      rx="2"
                    />

                    {/* Candle 4 (Impulse) */}
                    <line
                      x1="290"
                      y1="80"
                      x2="290"
                      y2="135"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <rect
                      x="280"
                      y="90"
                      width="20"
                      height="40"
                      fill="#10B981"
                      rx="2"
                    />

                    {/* Candle 5 (FOMO Breakout) */}
                    <line
                      x1="360"
                      y1="40"
                      x2="360"
                      y2="105"
                      stroke="#10B981"
                      strokeWidth="2.5"
                    />
                    <rect
                      x="350"
                      y="50"
                      width="20"
                      height="50"
                      fill="#10B981"
                      rx="2"
                      className="filter drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    />

                    {/* Candle 6 (Liquidity Sweep Wick) */}
                    <line
                      x1="430"
                      y1="45"
                      x2="430"
                      y2="190"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      className="filter drop-shadow-[0_0_8px_#EF4444]"
                    />
                    <rect
                      x="420"
                      y="55"
                      width="20"
                      height="85"
                      fill="#EF4444"
                      rx="2"
                    />

                    {/* Candle 7 (Rejection) */}
                    <line
                      x1="500"
                      y1="140"
                      x2="500"
                      y2="205"
                      stroke="#EF4444"
                      strokeWidth="2"
                    />
                    <rect
                      x="490"
                      y="145"
                      width="20"
                      height="50"
                      fill="#EF4444"
                      rx="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Right Column: Real-Time AI Autopsy Diagnostics (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Score Widget */}
                <div className="p-5 rounded-2xl bg-[#070B14] border border-[rgba(255,255,255,0.07)] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-[#64748B] font-bold uppercase">
                      DISCIPLINE RUBRIC
                    </div>
                    <div className="text-3xl font-black text-white mt-1">
                      94<span className="text-sm text-[#64748B]"> / 100</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-[#10B981] mt-1">
                      ● PROP FIRM CONSISTENCY HIGH
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full border-4 border-[#10B981] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 size={24} className="text-[#10B981]" />
                  </div>
                </div>

                {/* AI Surgical Quote Card */}
                <div className="p-5 rounded-2xl bg-[#070B14] border-l-4 border-l-[#EF4444] border border-[rgba(255,255,255,0.07)] flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#EF4444] mb-2">
                      <Terminal size={14} />
                      <span>AI AUTOPSY TELEMETRY</span>
                    </div>
                    <p className="text-xs sm:text-sm font-mono text-[#CBD5E1] leading-relaxed">
                      "Order #849201 rejected. Chasing market +18 pips into
                      4-hour resistance. Mandatory protocol: Wait for M5 Fair
                      Value Gap (FVG) discount."
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                    <span>LATENCY: 12MS</span>
                    <span className="text-[#10B981] font-bold">SHIELD ARMED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: THE FINAL CLOSE ─── */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 py-28 text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.08)] backdrop-blur-2xl relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
          {/* Subtle Ambient Orb */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.06) 45%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-5 relative z-10">
            Don't fail another $100k challenge.
          </h2>

          <p className="text-[#94A3B8] text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 relative z-10 font-medium">
            Institutional risk algorithms shouldn't be reserved for hedge funds.
            Plug MySmartJournal into your workflow today.
          </p>

          <div className="relative z-10 flex flex-col items-center gap-3.5">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow:
                  "0 0 45px rgba(16, 185, 129, 0.7), 0 0 90px rgba(6, 182, 212, 0.35)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
              onClick={() => navigate("/signup")}
              className="inline-flex items-center gap-3.5 bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-[#051410] font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.45)] cursor-pointer"
            >
              <Zap size={22} className="text-[#051410] fill-[#051410]" />
              <span className="tracking-wide">SECURE YOUR EDGE</span>
              <ArrowRight size={20} className="text-[#051410]" />
            </motion.button>
            <span className="text-xs font-mono text-[#64748B] font-medium">
              Zero setup. Instant webhook or MetaTrader connection.
            </span>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-20 w-full border-t border-[rgba(255,255,255,0.06)] bg-[#07090F] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo size={28} subtitle="THE INSTITUTIONAL RISK SHIELD" />

          <div className="flex items-center gap-6 text-xs font-medium text-[#64748B]">
            <Link
              to="/terms"
              className="hover:text-white transition-colors no-underline text-inherit"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="hover:text-white transition-colors no-underline text-inherit"
            >
              Privacy Policy
            </Link>
            <Link
              to="/disclaimer"
              className="hover:text-white transition-colors no-underline text-inherit"
            >
              Risk Disclaimer
            </Link>
            <Link
              to="/login"
              className="hover:text-white transition-colors no-underline text-inherit"
            >
              Terminal Login
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[rgba(255,255,255,0.04)] text-center text-[11px] text-[#475569] font-mono leading-relaxed">
          © {new Date().getFullYear()} MySmartJournal. All rights reserved.
          Trading forex, CFDs, and leveraged prop accounts carries significant risk
          of capital loss.
        </div>
      </footer>
    </div>
  );
}
