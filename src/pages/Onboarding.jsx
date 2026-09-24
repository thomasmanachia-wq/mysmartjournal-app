import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  Landmark,
  Wallet,
  FlaskConical,
  CandlestickChart,
  Bitcoin,
  LineChart,
  Layers,
  TrendingUp,
  RefreshCw,
  Zap,
  Flame,
  Crosshair,
  Terminal,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useOnboarding } from "../context/OnboardingContext";

// Slide animation variants between steps
const variants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const TOTAL_STEPS = 5; // Step 0 (Welcome) -> Step 4 (Terminal)

// Step 1: Capital Options
const CAPITAL_OPTIONS = [
  {
    id: "personal",
    label: "Personal Capital",
    description: "Your own live account and capital",
    Icon: Wallet,
  },
  {
    id: "prop",
    label: "Prop Firm Account",
    description: "FTMO, FundedNext, E8, etc.",
    Icon: Landmark,
  },
  {
    id: "demo",
    label: "Demo",
    description: "Paper trading and forward-testing",
    Icon: FlaskConical,
  },
];

// Step 2: Markets Options
const MARKET_OPTIONS = [
  { id: "forex", label: "Forex", Icon: CandlestickChart },
  { id: "crypto", label: "Crypto", Icon: Bitcoin },
  { id: "indices", label: "Indices", Icon: LineChart },
  { id: "commodities", label: "Commodities", Icon: Layers },
  { id: "stocks", label: "Stocks", Icon: TrendingUp },
];

// Step 3: Execution Leaks
const LEAK_OPTIONS = [
  {
    id: "overtrading",
    label: "Overtrading",
    description: "Too many trades, chasing the market",
    Icon: RefreshCw,
  },
  {
    id: "fomo",
    label: "FOMO",
    description: "Entering late, fear of missing the move",
    Icon: Zap,
  },
  {
    id: "revenge",
    label: "Revenge Trading",
    description: "Trading angry to quickly recover losses",
    Icon: Flame,
  },
  {
    id: "stoploss",
    label: "Stop-Loss Manipulation",
    description: "Moving or removing stop-loss during drawdown",
    Icon: Crosshair,
  },
];

// Top progress indicator
function ProgressBar({ step, total }) {
  return (
    <div className="w-full h-[2px] bg-slate-800 shrink-0">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 origin-left"
        initial={false}
        animate={{ scaleX: (step + 1) / total }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}

// Reusable card for selection grids
function OptionCard({ label, description, Icon, selected, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer text-center gap-3 transition-all duration-200 outline-none ${
        selected
          ? "border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-500/10 text-emerald-400"
          : "border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 hover:border-slate-700"
      } ${className}`}
    >
      <Icon
        className={`w-8 h-8 transition-colors duration-200 ${
          selected ? "text-emerald-400" : "text-slate-400"
        }`}
        strokeWidth={1.5}
      />
      <div>
        <p className={`text-base font-semibold leading-tight ${selected ? "text-emerald-400" : "text-white"}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-500 mt-1 leading-snug">{description}</p>
        )}
      </div>
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [capital, setCapital] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [leak, setLeak] = useState(null);
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
    if (step === 0) return true;
    if (step === 1) return Boolean(capital);
    if (step === 2) return markets.length > 0;
    if (step === 3) return Boolean(leak);
    return true; // Step 4 is optional
  }

  function renderStepContent() {
    switch (step) {
      // Step 0: Welcome
      case 0:
        return (
          <motion.div
            key="step-0"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="w-full flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 text-center">
              Welcome to MySmartJournal
            </h1>
            <p className="text-sm sm:text-base text-slate-400 text-center max-w-lg mx-auto">
              The institutional discipline engine for Prop Firm traders.
            </p>

            <button
              type="button"
              onClick={goNext}
              className="w-full sm:w-2/3 mx-auto mt-10 h-12 rounded-lg bg-white text-black font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Continue
            </button>
          </motion.div>
        );

      // Step 1: Capital
      case 1:
        return (
          <motion.div
            key="step-1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 text-center">
              What do you use to Trade?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 text-center max-w-lg mx-auto">
              Select your primary trading account type so we can calibrate rules.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
              {CAPITAL_OPTIONS.map((opt, idx) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  Icon={opt.Icon}
                  selected={capital === opt.id}
                  onClick={() => setCapital(opt.id)}
                  className={idx === 2 ? "sm:col-span-2 sm:max-w-xs sm:mx-auto w-full" : ""}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className={`w-full sm:w-2/3 mx-auto mt-10 h-12 rounded-lg font-semibold transition-colors ${
                canProceed()
                  ? "bg-white text-black hover:bg-slate-200 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={goPrev}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
            >
              Back
            </button>
          </motion.div>
        );

      // Step 2: Markets (Multiple choice)
      case 2:
        return (
          <motion.div
            key="step-2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 text-center">
              What are you currently trading?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 text-center max-w-lg mx-auto">
              Select all markets that apply to customize your analytics suite.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
              {MARKET_OPTIONS.map((opt, idx) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  Icon={opt.Icon}
                  selected={markets.includes(opt.id)}
                  onClick={() => toggleMarket(opt.id)}
                  className={idx === 4 ? "sm:col-span-2 sm:max-w-xs sm:mx-auto w-full" : ""}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className={`w-full sm:w-2/3 mx-auto mt-10 h-12 rounded-lg font-semibold transition-colors ${
                canProceed()
                  ? "bg-white text-black hover:bg-slate-200 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={goPrev}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
            >
              Back
            </button>
          </motion.div>
        );

      // Step 3: Main Execution Leak
      case 3:
        return (
          <motion.div
            key="step-3"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 text-center">
              What is your main execution leak?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 text-center max-w-lg mx-auto">
              Identify your primary vulnerability so our AI engine can guard against it.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
              {LEAK_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  Icon={opt.Icon}
                  selected={leak === opt.id}
                  onClick={() => setLeak(opt.id)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className={`w-full sm:w-2/3 mx-auto mt-10 h-12 rounded-lg font-semibold transition-colors ${
                canProceed()
                  ? "bg-white text-black hover:bg-slate-200 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={goPrev}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
            >
              Back
            </button>
          </motion.div>
        );

      // Step 4: Terminal Connection
      case 4:
        return (
          <motion.div
            key="step-4"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="w-full flex flex-col items-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 text-center">
              Connect your terminal
            </h1>
            <p className="text-sm sm:text-base text-slate-400 text-center max-w-lg mx-auto">
              Sync trades automatically with read-only investor credentials. You can also skip this step.
            </p>

            <div className="w-full mt-8">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
                <Terminal className="w-5 h-5 text-emerald-400 shrink-0" strokeWidth={1.5} />
                <span className="text-xs text-emerald-400 font-medium">
                  Read-Only Secure — Investor password only, never your master password.
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Account Login
                  </label>
                  <input
                    type="text"
                    value={mtLogin}
                    onChange={(e) => setMtLogin(e.target.value)}
                    placeholder="e.g. 10293847"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Investor Password
                  </label>
                  <input
                    type="password"
                    value={mtPassword}
                    onChange={(e) => setMtPassword(e.target.value)}
                    placeholder="Read-only investor password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Broker Server
                  </label>
                  <input
                    type="text"
                    value={mtServer}
                    onChange={(e) => setMtServer(e.target.value)}
                    placeholder="e.g. ICMarkets-Live01"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="w-full sm:w-2/3 mx-auto mt-10 h-12 rounded-lg bg-white text-black font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {submitting ? "Setting up your account..." : "Launch my journal"}
            </button>

            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={goPrev}
              className="mt-1 text-xs text-slate-600 hover:text-slate-400 transition-colors py-1 cursor-pointer"
            >
              Back
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Progress Bar at the top */}
      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Header with official logo */}
      <header className="flex items-center justify-between px-6 py-5 shrink-0 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MySmartJournal" className="h-9 w-auto" />
          <span className="text-sm font-semibold text-white tracking-tight hidden sm:block">
            MySmartJournal
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400 font-medium">
          {step + 1} / {TOTAL_STEPS}
        </span>
      </header>

      {/* Centered Main Layout */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 min-h-[80vh]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {renderStepContent()}
        </AnimatePresence>
      </main>
    </div>
  );
}
