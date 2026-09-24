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
  Check,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";

// Slide animation variants
const variants = {
  enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
};

const TOTAL_QUESTION_STEPS = 4; // Steps 1 to 4 are questions

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
  { id: "forex", label: "Forex", description: "EUR/USD, GBP/JPY, and major pairs", Icon: CandlestickChart },
  { id: "crypto", label: "Crypto", description: "BTC, ETH, and digital assets", Icon: Bitcoin },
  { id: "indices", label: "Indices", description: "US30, NAS100, SPX500, DAX40", Icon: LineChart },
  { id: "commodities", label: "Commodities", description: "Gold, Silver, and Crude Oil", Icon: Layers },
  { id: "stocks", label: "Stocks", description: "Equities and shares", Icon: TrendingUp },
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

// TradeZella-style horizontal row card
function RowCard({ label, description, Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center text-left p-5 sm:p-6 rounded-2xl border transition-all gap-5 cursor-pointer outline-none ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-slate-800/90 bg-slate-900/50 hover:bg-slate-900/80 text-slate-300 hover:border-slate-700"
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
          selected
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            : "bg-slate-800/80 border-slate-700/60 text-slate-400"
        }`}
      >
        <Icon className="w-7 h-7" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-base sm:text-lg font-bold leading-tight ${selected ? "text-emerald-400" : "text-white"}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-normal">{description}</p>
        )}
      </div>

      {selected && (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <Check className="w-4 h-4 text-black stroke-[3]" />
        </div>
      )}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { signOut } = useAuth();

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

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
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
      // Step 0: Welcome (Series-A standard modeled after TradeZella)
      case 0:
        return (
          <motion.div
            key="step-0"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full max-w-2xl flex flex-col items-center text-center px-4"
            style={{ margin: "0 auto" }}
          >
            {/* L'Écrin du Logo agrandi et parfaitement centré */}
            <div
              className="w-32 h-32 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-[2.2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/10"
              style={{ margin: "0 auto 40px auto" }}
            >
              <img src={logo} alt="MySmartJournal" className="w-20 h-20 sm:w-22 sm:h-22 object-contain" />
            </div>

            {/* Titre sur une seule ligne */}
            <h1
              className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-white text-center leading-tight sm:whitespace-nowrap"
              style={{ marginBottom: "20px" }}
            >
              Welcome to MySmartJournal
            </h1>

            {/* Sous-titre avec large respiration */}
            <p
              className="text-base sm:text-lg text-slate-400 text-center leading-relaxed max-w-xl sm:whitespace-nowrap"
              style={{ margin: "0 auto 64px auto" }}
            >
              The institutional discipline engine for Prop Firm traders.
            </p>

            {/* Bouton d'action centré w-72 */}
            <button
              type="button"
              onClick={goNext}
              className="w-72 h-14 rounded-xl bg-white text-black text-base sm:text-lg font-semibold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5 cursor-pointer flex items-center justify-center"
              style={{ margin: "0 auto" }}
            >
              Continue
            </button>
          </motion.div>
        );

      // Step 1: Capital (Questionnaire mode)
      case 1:
        return (
          <motion.div
            key="step-1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full max-w-xl flex flex-col items-center px-4"
            style={{ margin: "0 auto" }}
          >
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-center"
              style={{ marginBottom: "10px" }}
            >
              What do you use to Trade?
            </h1>
            <p
              className="text-sm sm:text-base text-slate-400 text-center max-w-md"
              style={{ margin: "0 auto 36px auto" }}
            >
              Select your primary trading account type.
            </p>

            <div className="flex flex-col w-full gap-4" style={{ width: "100%" }}>
              {CAPITAL_OPTIONS.map((opt) => (
                <RowCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  Icon={opt.Icon}
                  selected={capital === opt.id}
                  onClick={() => setCapital(opt.id)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              style={{ margin: "40px auto 0 auto" }}
              className={`w-72 h-14 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center text-base sm:text-lg ${
                canProceed()
                  ? "bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/5"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={goPrev}
              style={{ margin: "16px auto 0 auto" }}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
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
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full max-w-xl flex flex-col items-center px-4"
            style={{ margin: "0 auto" }}
          >
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-center"
              style={{ marginBottom: "10px" }}
            >
              What are you currently trading?
            </h1>
            <p
              className="text-sm sm:text-base text-slate-400 text-center max-w-md"
              style={{ margin: "0 auto 36px auto" }}
            >
              Select all markets that apply.
            </p>

            <div className="flex flex-col w-full gap-4" style={{ width: "100%" }}>
              {MARKET_OPTIONS.map((opt) => (
                <RowCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  Icon={opt.Icon}
                  selected={markets.includes(opt.id)}
                  onClick={() => toggleMarket(opt.id)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              style={{ margin: "40px auto 0 auto" }}
              className={`w-72 h-14 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center text-base sm:text-lg ${
                canProceed()
                  ? "bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/5"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={goPrev}
              style={{ margin: "16px auto 0 auto" }}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
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
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full max-w-xl flex flex-col items-center px-4"
            style={{ margin: "0 auto" }}
          >
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-center"
              style={{ marginBottom: "10px" }}
            >
              What is your main execution leak?
            </h1>
            <p
              className="text-sm sm:text-base text-slate-400 text-center max-w-md"
              style={{ margin: "0 auto 36px auto" }}
            >
              Identify your primary vulnerability so our AI engine can guard against it.
            </p>

            <div className="flex flex-col w-full gap-4" style={{ width: "100%" }}>
              {LEAK_OPTIONS.map((opt) => (
                <RowCard
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
              style={{ margin: "40px auto 0 auto" }}
              className={`w-72 h-14 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-center text-base sm:text-lg ${
                canProceed()
                  ? "bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/5"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={goPrev}
              style={{ margin: "16px auto 0 auto" }}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer"
            >
              Back
            </button>
          </motion.div>
        );

      // Step 4: Terminal Connection (Humanized copy & centered form inputs)
      case 4:
        return (
          <motion.div
            key="step-4"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="w-full max-w-xl flex flex-col items-center px-4"
            style={{ margin: "0 auto" }}
          >
            {/* Titre et sous-titre minimaliste */}
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-center"
              style={{ marginBottom: "10px" }}
            >
              Automate your trade logs
            </h1>
            <p className="text-base text-slate-400 text-center mb-6 max-w-md mx-auto">
              Sync your MT4/MT5 accounts for real-time AI audits.
            </p>

            {/* Le Badge Sécurité (La Pilule discrète) */}
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8">
              <ShieldCheck className="w-4 h-4" />
              <span>Read-Only Secure (Investor Password)</span>
            </div>

            {/* Champs de saisie clonés sur le style des cartes */}
            <div className="flex flex-col w-full gap-4" style={{ width: "100%" }}>
              <input
                type="text"
                value={mtLogin}
                onChange={(e) => setMtLogin(e.target.value)}
                placeholder="Account Login (e.g. 10293847)"
                className="w-full h-16 px-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />

              <input
                type="password"
                value={mtPassword}
                onChange={(e) => setMtPassword(e.target.value)}
                placeholder="Investor Password (Read-Only)"
                className="w-full h-16 px-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />

              <input
                type="text"
                value={mtServer}
                onChange={(e) => setMtServer(e.target.value)}
                placeholder="Broker Server (e.g. ICMarkets-Live01)"
                className="w-full h-16 px-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              style={{ margin: "40px auto 0 auto" }}
              className="w-72 h-14 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5 cursor-pointer flex items-center justify-center text-base sm:text-lg"
            >
              {submitting ? "Setting up your account..." : "Launch my journal"}
            </button>

            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              style={{ margin: "16px auto 0 auto" }}
              className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors py-1 cursor-pointer text-center"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={goPrev}
              style={{ margin: "8px auto 0 auto" }}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors py-1 cursor-pointer text-center"
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
    <div
      className="min-h-screen w-full flex flex-col justify-between"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage:
          "radial-gradient(ellipse at top, rgba(30, 41, 59, 0.55) 0%, #030712 60%, #000000 100%)",
      }}
    >
      {/* Top Header with mathematically balanced 3-column layout */}
      <header
        className="w-full px-6 h-20 flex items-center justify-between shrink-0"
        style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}
      >
        {/* Left column: Logo agrandi + MySmartJournal toujours visible */}
        <div className="w-56 sm:w-64 flex items-center gap-3">
          <img src={logo} alt="MySmartJournal" className="h-10 sm:h-11 w-auto object-contain" />
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            MySmartJournal
          </span>
        </div>

        {/* Center column: Capsule progress bar, locked dead center */}
        <div className="flex-1 flex items-center justify-center">
          {step > 0 && (
            <div className="w-48 sm:w-72 md:w-80 h-2 sm:h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/40">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                initial={false}
                animate={{ width: `${(step / TOTAL_QUESTION_STEPS) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          )}
        </div>

        {/* Right column: Log out button */}
        <div className="w-56 sm:w-64 flex items-center justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Centered Questionnaire / Welcome Content */}
      <main
        className="flex-1 flex flex-col items-center justify-center p-4 py-8 w-full"
        style={{ width: "100%", margin: "0 auto" }}
      >
        <div
          className="w-full flex flex-col items-center justify-center"
          style={{ width: "100%", margin: "0 auto" }}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {renderStepContent()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer modeled after TradeZella */}
      <footer
        className="w-full py-6 text-center text-xs text-slate-500 shrink-0 border-t border-slate-900/60"
        style={{ width: "100%", textAlign: "center" }}
      >
        © 2025 MySmartJournal. All rights reserved.
      </footer>
    </div>
  );
}
