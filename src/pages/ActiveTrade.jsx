import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Target,
  Zap,
  Flame,
  Activity,
  Crown,
  Coffee,
  Lock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const EMOTIONS = [
  { id: "calm", label: "Calm", icon: Target },
  { id: "fomo", label: "FOMO", icon: Zap },
  { id: "revenge", label: "Revenge", icon: Flame },
  { id: "anxious", label: "Anxious", icon: Activity },
  { id: "greed", label: "Greed", icon: Crown },
  { id: "bored", label: "Bored", icon: Coffee },
];

export default function ActiveTrade() {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [thesis, setThesis] = useState("");
  const [seconds, setSeconds] = useState(105); // Start at 01:45 as live reference
  const [isLocked, setIsLocked] = useState(false);

  // Live chronometer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Trade data (accepts props/location state if available, falls back to default institutional reference)
  const tradeData = location.state?.trade || {
    symbol: "EUR/USD",
    side: "BUY",
    lots: "5.0 Lots",
    entry: "1.08450",
  };

  const handleLockContext = () => {
    setIsLocked(true);
    // Smooth transition / redirect to Journal after recording the context
    setTimeout(() => {
      navigate("/", {
        state: {
          lockedTrade: {
            ...tradeData,
            emotion: selectedEmotion,
            thesis,
            duration: formatTime(seconds),
            timestamp: new Date().toISOString(),
          },
        },
      });
    }, 800);
  };

  return (
    <main
      className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-black flex flex-col items-center justify-center p-4 py-12"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top, rgba(30, 41, 59, 0.55) 0%, #030712 60%, #000000 100%)",
      }}
    >
      <div className="w-full max-w-xl mx-auto flex flex-col">
        {/* Subtle navigation escape hatch */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Journal</span>
          </button>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800/60">
            Focus Mode
          </span>
        </div>

        {/* 2. Le Header "Live" */}
        <div className="text-slate-400 font-medium text-sm flex items-center justify-center mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mr-3"></div>
          <span>Live Trade Context</span>
        </div>

        {/* Chronomètre H1 */}
        <h1 className="text-5xl font-mono font-bold text-white mb-8 text-center tracking-tight">
          {formatTime(seconds)}
        </h1>

        {/* 3. La Barre "Hard Data" (Verrouillée) */}
        <div className="w-full flex items-center justify-between p-4 mb-10 rounded-xl border border-slate-800/60 bg-slate-900/30 shadow-inner">
          <div className="w-full flex items-center justify-between font-mono text-sm text-slate-300">
            <span className="font-semibold text-white tracking-wide">
              {tradeData.symbol}
            </span>
            <span className="text-slate-700">|</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                tradeData.side === "BUY"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {tradeData.side}
            </span>
            <span className="text-slate-700">|</span>
            <span>{tradeData.lots}</span>
            <span className="text-slate-700">|</span>
            <span>
              Entry: <span className="text-slate-200">{tradeData.entry}</span>
            </span>
          </div>
        </div>

        {/* 4. La Grille d'Émotions (Soft Data - Choix Unique) */}
        <h2 className="text-lg font-semibold text-white mb-4">
          Current Mental State
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {EMOTIONS.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedEmotion === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedEmotion(id)}
                className={`flex flex-col items-center justify-center p-4 h-28 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70"
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. La Thèse du Trade (Journal Express) */}
        <h2 className="text-lg font-semibold text-white mb-4">
          Trade Thesis
        </h2>
        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none resize-none min-h-[120px] mb-10 transition-colors"
          placeholder="Why did you take this trade? Be brutally honest..."
        />

        {/* 6. Le Bouton d'Action */}
        <button
          type="button"
          onClick={handleLockContext}
          disabled={isLocked}
          className={`w-full h-14 rounded-xl text-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
            isLocked
              ? "bg-emerald-500 text-black shadow-emerald-500/20"
              : "bg-white text-black hover:bg-slate-200 shadow-white/5 active:scale-[0.99]"
          }`}
        >
          {isLocked ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>Context Locked</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Lock Trade Context</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
