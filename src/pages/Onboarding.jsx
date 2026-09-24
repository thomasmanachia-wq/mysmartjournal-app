import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Landmark,
  Wallet,
  FlaskConical,
  CandlestickChart,
  Bitcoin,
  BarChart2,
  Layers,
  RefreshCw,
  Zap,
  Flame,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useOnboarding } from "../context/OnboardingContext";

// ─── Slide animation variants ────────────────────────────────────────────────
const variants = {
  enter: (dir) => ({ x: dir > 0 ? 72 : -72, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -72 : 72, opacity: 0 }),
};

const TOTAL_STEPS = 4;

// ─── Step data ───────────────────────────────────────────────────────────────
const CAPITAL_OPTIONS = [
  {
    id: "prop",
    label: "Prop Firm",
    description: "FTMO, E8, The Funded Trader…",
    Icon: Landmark,
  },
  {
    id: "personal",
    label: "Personal Capital",
    description: "Your own live account",
    Icon: Wallet,
  },
  {
    id: "demo",
    label: "Demo Account",
    description: "Practising / paper trading",
    Icon: FlaskConical,
  },
];

const MARKET_OPTIONS = [
  { id: "forex", label: "Forex", Icon: CandlestickChart },
  { id: "crypto", label: "Crypto", Icon: Bitcoin },
  { id: "indices", label: "Indices", Icon: BarChart2 },
  { id: "commodities", label: "Commodities", Icon: Layers },
];

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
    description: "Entering late, fear of missing out",
    Icon: Zap,
  },
  {
    id: "revenge",
    label: "Revenge Trading",
    description: "Trading angry to recover losses",
    Icon: Flame,
  },
  {
    id: "risk",
    label: "Poor Risk Management",
    description: "Oversizing, moving stop-loss",
    Icon: ShieldAlert,
  },
];

// ─── Thin gradient progress bar ──────────────────────────────────────────────
function ProgressBar({ step, total }) {
  return (
    <div className="w-full h-[2px] bg-slate-800 shrink-0">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 origin-left"
        initial={false}
        animate={{ scaleX: step / total }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}

// ─── Generic grid card ───────────────────────────────────────────────────────
function OptionCard({ label, description, Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center p-6 rounded-xl border cursor-pointer transition-all duration-200 text-center gap-3",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
        selected
          ? "border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-500/10"
          : "border-slate-800 bg-slate-900/40 hover:bg-slate-800/80",
      ].join(" ")}
    >
      <Icon
        className={`w-8 h-8 transition-colors duration-200 ${
          selected ? "text-emerald-400" : "text-slate-400"
        }`}
        strokeWidth={1.5}
      />
      <div>
        <p
          className={`text-sm font-semibold leading-tight ${
            selected ? "text-emerald-400" : "text-slate-100"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-500 mt-1 leading-snug">{description}</p>
        )}
      </div>
    </button>
  );
}

// ─── Step wrapper with directional slide ─────────────────────────────────────
function StepShell({ title, subtitle, children, direction, stepKey }) {
  return (
    <motion.div
      key={stepKey}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className="w-full flex flex-col items-center"
    >
      <h1 className="text-3xl font-bold tracking-tight text-slate-50 text-center leading-tight">
        {title}
      </h1>
      <p className="text-sm text-slate-500 text-center mt-3 leading-relaxed max-w-sm">
        {subtitle}
      </p>
      <div className="w-full mt-8">{children}</div>
    </motion.div>
  );
}

// ─── Main Onboarding ─────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step answers
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
    if (step === 1) return !!capital;
    if (step === 2) return markets.length > 0;
    if (step === 3) return !!leak;
    return true; // step 4 is optional
  }

  // ─── Step panels ───────────────────────────────────────────────────────────
  function renderStep() {
    switch (step) {
      case 1:
        return (
          <StepShell
            stepKey="step-1"
            title="What capital are you trading?"
            subtitle="This helps us calibrate your risk rules and prop firm compliance checks."
            direction={direction}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {CAPITAL_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  Icon={opt.Icon}
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
            stepKey="step-2"
            title="What markets do you trade?"
            subtitle="Select all that apply. We'll tailor your analytics dashboard accordingly."
            direction={direction}
          >
            <div className="grid grid-cols-2 gap-4 w-full">
              {MARKET_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  Icon={opt.Icon}
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
            stepKey="step-3"
            title="What is your main execution leak?"
            subtitle="Honesty here is the first step to fixing it. Our AI will monitor this pattern."
            direction={direction}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
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
          </StepShell>
        );

      case 4:
        return (
          <StepShell
            stepKey="step-4"
            title="Connect your terminal"
            subtitle="Optional — use your MT4/MT5 Investor Password for read-only sync. You can skip this step."
            direction={direction}
          >
            {/* Security badge */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-medium text-emerald-400">
                Read-Only Secure — Investor password only, never your Master password
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: "Account Login", value: mtLogin, setter: setMtLogin, placeholder: "e.g. 12345678", type: "text" },
                { label: "Investor Password", value: mtPassword, setter: setMtPassword, placeholder: "Read-only investor password", type: "password" },
                { label: "Server", value: mtServer, setter: setMtServer, placeholder: "e.g. ICMarkets-Live01", type: "text" },
              ].map(({ label, value, setter, placeholder, type }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                  />
                </div>
              ))}
            </div>
          </StepShell>
        );

      default:
        return null;
    }
  }

  const isLastStep = step === TOTAL_STEPS;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Pinned progress bar */}
      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 shrink-0">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MySmartJournal" className="h-9 w-auto" />
          <span className="text-sm font-semibold text-white tracking-tight hidden sm:block">
            MySmartJournal
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500">
          {step} / {TOTAL_STEPS}
        </span>
      </header>

      {/* Centered main content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 min-h-[80vh]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {renderStep()}
        </AnimatePresence>
      </main>

      {/* Footer CTAs */}
      <footer className="px-4 pb-10 pt-2 w-full max-w-2xl mx-auto flex flex-col items-center gap-3">
        <motion.button
          type="button"
          onClick={isLastStep ? handleFinish : goNext}
          disabled={(!canProceed() && !isLastStep) || submitting}
          whileTap={{ scale: 0.975 }}
          className={[
            "w-full sm:w-2/3 mx-auto h-12 rounded-lg text-sm font-semibold transition-colors duration-200",
            canProceed() || isLastStep
              ? "bg-white text-black hover:bg-slate-200 active:bg-slate-300"
              : "bg-slate-800 text-slate-600 cursor-not-allowed",
          ].join(" ")}
        >
          {submitting
            ? "Setting up your account…"
            : isLastStep
            ? "Launch my journal"
            : "Continue"}
        </motion.button>

        {step > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors py-1"
          >
            ← Back
          </button>
        )}

        {isLastStep && (
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors py-1"
          >
            Skip for now
          </button>
        )}
      </footer>
    </div>
  );
}
