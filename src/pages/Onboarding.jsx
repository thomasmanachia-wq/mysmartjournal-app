import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useOnboarding } from "../context/OnboardingContext";

// ─── Brand Logo (inline SVG — no external dependency) ────────────────────────
function BrandLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MySmartJournal logo"
    >
      {/* Book cover */}
      <rect x="6" y="4" width="20" height="26" rx="3" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
      {/* Spine */}
      <rect x="6" y="4" width="4" height="26" rx="2" fill="#10B981" opacity="0.25" />
      {/* Lines */}
      <line x1="13" y1="11" x2="23" y2="11" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="15" x2="23" y2="15" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="13" y1="19" x2="20" y2="19" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* AI spark */}
      <circle cx="26" cy="27" r="5" fill="#064E3B" />
      <path d="M26 24.5v1.5M26 27.5V29M24.5 26H26M27 26h1.5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Thin progress bar ────────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  const pct = (step / total) * 100;
  return (
    <div className="w-full h-[2px] bg-slate-800 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Selectable Card ─────────────────────────────────────────────────────────
function SelectCard({ label, icon, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
        selected
          ? "bg-slate-900 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50"
          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-tight ${selected ? "text-emerald-400" : "text-white"}`}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
        {selected && (
          <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3.2 5.8L6.5 2.2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Toggle chip for multi-select ────────────────────────────────────────────
function ToggleChip({ label, icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
        selected
          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/30"
          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700",
      ].join(" ")}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

// ─── Slide animation variants ────────────────────────────────────────────────
const variants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const TOTAL_STEPS = 4;

// ─── Step data ───────────────────────────────────────────────────────────────
const CAPITAL_OPTIONS = [
  { id: "prop", label: "Prop Firm", icon: "🏦", description: "FTMO, E8, The Funded Trader…" },
  { id: "personal", label: "Personal Capital", icon: "💰", description: "Your own live account" },
  { id: "demo", label: "Demo Account", icon: "🧪", description: "Practising / paper trading" },
];

const MARKET_OPTIONS = [
  { id: "forex", label: "Forex", icon: "💱" },
  { id: "crypto", label: "Crypto", icon: "₿" },
  { id: "indices", label: "Indices", icon: "📊" },
  { id: "commodities", label: "Commodities", icon: "🛢️" },
];

const LEAK_OPTIONS = [
  { id: "overtrading", label: "Overtrading", icon: "🔁", description: "Too many trades, chasing the market" },
  { id: "fomo", label: "FOMO", icon: "😨", description: "Entering late, fear of missing out" },
  { id: "revenge", label: "Revenge Trading", icon: "🔥", description: "Trading angry to recover losses" },
  { id: "risk", label: "Poor Risk Management", icon: "⚠️", description: "Oversizing, moving stop-loss" },
];

// ─── Main Onboarding Component ───────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [capital, setCapital] = useState(null);
  // Step 2
  const [markets, setMarkets] = useState([]);
  // Step 3
  const [leak, setLeak] = useState(null);
  // Step 4
  const [mtLogin, setMtLogin] = useState("");
  const [mtPassword, setMtPassword] = useState("");
  const [mtServer, setMtServer] = useState("");

  function goNext() {
    setDirection(1);
    setStep((s) => s + 1);
  }

  function goPrev() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function toggleMarket(id) {
    setMarkets((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      await completeOnboarding();
      navigate("/");
    } catch {
      setSubmitting(false);
    }
  }

  function canProceed() {
    if (step === 1) return !!capital;
    if (step === 2) return markets.length > 0;
    if (step === 3) return !!leak;
    return true; // step 4: terminal is optional
  }

  // ─── Step panels ─────────────────────────────────────────────────────────
  function renderStep() {
    switch (step) {
      case 1:
        return (
          <StepShell
            key="step-1"
            title="What capital are you trading?"
            subtitle="This helps us calibrate your risk rules and prop firm compliance checks."
            direction={direction}
          >
            <div className="flex flex-col gap-3">
              {CAPITAL_OPTIONS.map((opt) => (
                <SelectCard
                  key={opt.id}
                  label={opt.label}
                  icon={opt.icon}
                  description={opt.description}
                  selected={capital === opt.id}
                  onClick={() => setCapital(opt.id)}
                />
              ))}
            </div>
          </StepShell>
        );

      case 2:
        return (
          <StepShell
            key="step-2"
            title="What markets do you trade?"
            subtitle="Select all that apply. We'll tailor your analytics dashboard accordingly."
            direction={direction}
          >
            <div className="flex flex-wrap gap-3">
              {MARKET_OPTIONS.map((opt) => (
                <ToggleChip
                  key={opt.id}
                  label={opt.label}
                  icon={opt.icon}
                  selected={markets.includes(opt.id)}
                  onClick={() => toggleMarket(opt.id)}
                />
              ))}
            </div>
          </StepShell>
        );

      case 3:
        return (
          <StepShell
            key="step-3"
            title="What is your main execution leak?"
            subtitle="Honesty here is the first step to fixing it. Our AI will monitor this pattern."
            direction={direction}
          >
            <div className="flex flex-col gap-3">
              {LEAK_OPTIONS.map((opt) => (
                <SelectCard
                  key={opt.id}
                  label={opt.label}
                  icon={opt.icon}
                  description={opt.description}
                  selected={leak === opt.id}
                  onClick={() => setLeak(opt.id)}
                />
              ))}
            </div>
          </StepShell>
        );

      case 4:
        return (
          <StepShell
            key="step-4"
            title="Connect your terminal"
            subtitle="Optional — use your MT4 / MT5 Investor Password for read-only sync. You can skip this now."
            direction={direction}
          >
            {/* Security badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <path d="M7 1.5L2 3.5v4c0 2.8 2.1 5 5 5.5 2.9-.5 5-2.7 5-5.5v-4L7 1.5z" stroke="#10B981" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
                <path d="M5 7l1.5 1.5L9 5.5" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-emerald-400">Read-Only Secure · Investor password only, never Master</span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Login</label>
                <input
                  type="text"
                  value={mtLogin}
                  onChange={(e) => setMtLogin(e.target.value)}
                  placeholder="e.g. 12345678"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Investor Password</label>
                <input
                  type="password"
                  value={mtPassword}
                  onChange={(e) => setMtPassword(e.target.value)}
                  placeholder="Investor password (read-only)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Server</label>
                <input
                  type="text"
                  value={mtServer}
                  onChange={(e) => setMtServer(e.target.value)}
                  placeholder="e.g. ICMarkets-Live01"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                />
              </div>
            </div>
          </StepShell>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Progress bar — pinned to very top */}
      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <BrandLogo />
          <span className="text-sm font-semibold text-white tracking-tight">MySmartJournal</span>
        </div>
        <span className="text-xs font-mono text-slate-500">
          {step} / {TOTAL_STEPS}
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center px-6 pb-8 overflow-hidden max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {renderStep()}
        </AnimatePresence>
      </main>

      {/* Footer navigation */}
      <footer className="px-6 pb-8 pt-2 max-w-lg mx-auto w-full flex flex-col gap-3">
        <motion.button
          type="button"
          onClick={step < TOTAL_STEPS ? goNext : handleFinish}
          disabled={(!canProceed() && step !== 4) || submitting}
          whileTap={{ scale: 0.975 }}
          className={[
            "w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200",
            canProceed() || step === 4
              ? "bg-white text-black hover:bg-slate-100 active:bg-slate-200"
              : "bg-slate-800 text-slate-600 cursor-not-allowed",
          ].join(" ")}
        >
          {submitting
            ? "Setting up your account…"
            : step < TOTAL_STEPS
            ? "Continue →"
            : "Launch my journal"}
        </motion.button>

        {step > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="text-xs text-slate-600 hover:text-slate-400 transition text-center py-1"
          >
            ← Back
          </button>
        )}

        {step === 4 && (
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs text-slate-600 hover:text-slate-400 transition text-center py-1"
          >
            Skip for now
          </button>
        )}
      </footer>
    </div>
  );
}

// ─── Step wrapper with slide animation ──────────────────────────────────────
function StepShell({ title, subtitle, children, direction }) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className="w-full"
    >
      <h1 className="text-2xl font-bold tracking-tight text-white leading-tight mb-2">
        {title}
      </h1>
      <p className="text-sm text-slate-500 mb-7 leading-relaxed">{subtitle}</p>
      {children}
    </motion.div>
  );
}
