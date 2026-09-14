import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext.jsx";
import { updateSettings } from "../lib/settingsService.js";
import { apiFetch } from "../lib/supabase.js";
import { analytics } from "../lib/analytics.js";
import {
  ArrowRight, BarChart2, BookOpen, Brain, Check, CheckCircle2,
  ChevronLeft, ChevronRight, Compass, Gauge, LineChart, Loader,
  ShieldCheck, SkipForward, SlidersHorizontal, Target, TrendingUp,
  User, Zap
} from "lucide-react";

const SAMPLE_TRADE = {
  pair: "EUR/USD",
  entryPrice: "1.08500",
  exitPrice: "",
  takeProfit: "1.09100",
  stopLoss: "1.08200",
  size: "0.01",
  timeframe: "H4",
  direction: "long",
  setup: "Order Block + BOS",
  analysisType: "SMC",
  notes: "H4 entry on an Order Block following a bullish BOS. Favorable macro context.",
  risk: "1",
  emotion: "Confident",
  date: new Date().toISOString().split("T")[0],
};

const STEPS = ["Welcome", "Profile", "Style", "Objective", "First Trade"];

const STEP_META = [
  { number: "01", title: "Profile", detail: "Calibration" },
  { number: "02", title: "Trading", detail: "Experience" },
  { number: "03", title: "Context", detail: "Style & Market" },
  { number: "04", title: "AI Setup", detail: "Priority" },
  { number: "05", title: "First Audit", detail: "Execution" },
];

const LEVEL_OPTIONS = [
  {
    value: "débutant",
    label: "Beginner",
    desc: "You are still building your analysis and execution foundations.",
    bullets: ["Detailed pedagogical insights", "Discipline reminders", "Guided debriefs"],
  },
  {
    value: "intermédiaire",
    label: "Intermediate",
    desc: "You have a method, but consistency needs work.",
    bullets: ["Balanced feedback", "Identifies recurring leaks", "Actionable priorities"],
  },
  {
    value: "avancé",
    label: "Advanced",
    desc: "Your strategy is proven, you are optimizing for elite precision.",
    bullets: ["Direct institutional critique", "Execution focus", "Process optimization"],
  },
];

const STYLE_OPTIONS = [
  {
    value: "scalping",
    label: "Scalping",
    desc: "Fast decisions on shorter timeframes.",
    bullets: ["Entry precision", "Immediate risk management", "Emotional agility"],
  },
  {
    value: "intraday",
    label: "Intraday",
    desc: "Positions planned and closed within the session.",
    bullets: ["Session context", "Key liquidity levels", "Narrative quality"],
  },
  {
    value: "swing",
    label: "Swing",
    desc: "Positions held over multiple days.",
    bullets: ["Patience", "Higher timeframe planning", "Multi-session management"],
  },
];

const MARKET_OPTIONS = [
  {
    value: "forex",
    label: "Forex",
    desc: "Major pairs, metals, London & NY sessions.",
    bullets: ["EUR/USD", "GBP/USD", "XAU/USD"],
  },
  {
    value: "crypto",
    label: "Crypto",
    desc: "24/7 market, high volatility, strict invalidation.",
    bullets: ["BTC", "ETH", "Altcoins"],
  },
  {
    value: "indices",
    label: "Indices",
    desc: "Market opens and directional momentum.",
    bullets: ["US30", "NAS100", "SPX"],
  },
];

const OBJECTIVE_OPTIONS = [
  {
    value: "discipline",
    label: "Discipline",
    desc: "Stick to your plan even when market volatility spikes.",
    bullets: ["Strict entry criteria", "Patience & waiting", "Execution checklist"],
  },
  {
    value: "psychologie",
    label: "Psychology",
    desc: "Isolate emotional biases degrading your decision-making.",
    bullets: ["FOMO", "Revenge trading", "Impatience"],
  },
  {
    value: "performance",
    label: "Performance",
    desc: "Maximize the average quality and R:R of your setups.",
    bullets: ["Win rate", "Risk/Reward ratio", "A+ setups only"],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    trading_level: "",
    style_de_trading: "",
    main_market: "",
    main_objective: "",
  });
  const [aiData, setAiData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    analytics.onboardingStarted();
  }, []);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  async function handleSkip() {
    analytics.onboardingSkipped(step);
    setSaveError(null);
    try {
      await completeOnboarding();
      navigate("/");
    } catch (err) {
      setSaveError(err.message || "Unable to complete onboarding right now.");
    }
  }

  async function saveProfile() {
    setSaveError(null);
    try {
      await updateSettings({
        trading_level: answers.trading_level,
        style_de_trading: answers.style_de_trading,
        main_market: answers.main_market,
        main_objective: answers.main_objective,
        onboarding_step: 4,
      });
      analytics.onboardingStepCompleted(3, "objectif");
      return true;
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Unable to save your profile right now.");
      return false;
    }
  }

  async function handleSampleAnalysis() {
    setLoadingAI(true);
    setAiError(null);
    analytics.sampleTradeAnalyzed();
    try {
      const data = await apiFetch("/api/analyzeTrade", {
        method: "POST",
        body: JSON.stringify({
          pair: SAMPLE_TRADE.pair,
          date: SAMPLE_TRADE.date,
          direction: SAMPLE_TRADE.direction,
          entry: SAMPLE_TRADE.entryPrice,
          stopLoss: SAMPLE_TRADE.stopLoss,
          takeProfit: SAMPLE_TRADE.takeProfit,
          riskPercent: SAMPLE_TRADE.risk,
          notes: SAMPLE_TRADE.notes,
        }),
      });
      setAiData(data);
      analytics.analysisGenerated(SAMPLE_TRADE.pair, data?.score?.overall, "free", data?.is_limited);
    } catch (err) {
      analytics.aiError(SAMPLE_TRADE.pair, err.message);
      setAiError("Error during analysis. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  }

  async function handleFinish() {
    analytics.onboardingCompleted(answers);
    setSaveError(null);
    try {
      await completeOnboarding();
      navigate("/");
    } catch (err) {
      setSaveError(err.message || "Unable to complete onboarding right now.");
    }
  }

  async function handleGoAnalyse() {
    analytics.onboardingCompleted(answers);
    setSaveError(null);
    try {
      await completeOnboarding();
      navigate("/analyse");
    } catch (err) {
      setSaveError(err.message || "Unable to complete onboarding right now.");
    }
  }

  async function handleGoDashboard() {
    analytics.onboardingCompleted(answers);
    setSaveError(null);
    try {
      await completeOnboarding();
      navigate("/dashboard");
    } catch (err) {
      setSaveError(err.message || "Unable to complete onboarding right now.");
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={styles.page}>
      <header style={styles.topBar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}><BookOpen size={18} /></div>
          <div>
            <p style={styles.brandName}>MySmartJournal</p>
            <p style={styles.brandSub}>AI Coach Calibration</p>
          </div>
        </div>
        <button onClick={handleSkip} style={styles.skipBtn}>
          <SkipForward size={14} /> Skip
        </button>
      </header>

      <div style={styles.shell}>
        <Stepper step={step} progress={progress} />

        <main className="onboarding-stage" style={styles.stage}>
          <section className="onboarding-card" style={styles.card}>
            {step === 0 && (
              <WelcomeStep onNext={next} />
            )}

            {step === 1 && (
              <QuestionStep
                icon={<User size={18} />}
                eyebrow="Trader Profile"
                title="What level should your coach adapt to?"
                desc="This sets the detail level of your audits: pedagogical depth, vocabulary, rigor, and feedback precision."
                note="This does not evaluate your trading worth—it simply customizes how the AI speaks to you."
              >
                <div className="onboarding-option-grid" style={styles.optionGrid}>
                  {LEVEL_OPTIONS.map(({ value, label, desc, bullets }) => (
                    <OptionCard key={value} label={label} desc={desc} bullets={bullets}
                      selected={answers.trading_level === value}
                      onClick={() => setAnswers((p) => ({ ...p, trading_level: value }))}
                    />
                  ))}
                </div>
                <NavButtons onPrev={prev} onNext={next} nextDisabled={!answers.trading_level} />
              </QuestionStep>
            )}

            {step === 2 && (
              <QuestionStep
                icon={<SlidersHorizontal size={18} />}
                eyebrow="Trading Framework"
                title="In what context should the AI audit your execution?"
                desc="An EUR/USD scalp and an index swing trade are evaluated differently. This calibration ensures accurate feedback."
                note="These choices only provide context for your audits; you can log any instrument or style."
              >
                <div style={styles.sectionHeader}>
                  <span>Primary Style</span>
                  <small>Decision timeframe</small>
                </div>
                <div className="onboarding-option-grid" style={styles.optionGrid}>
                  {STYLE_OPTIONS.map(({ value, label, desc, bullets }) => (
                    <OptionCard key={value} label={label} desc={desc} bullets={bullets}
                      selected={answers.style_de_trading === value}
                      onClick={() => setAnswers((p) => ({ ...p, style_de_trading: value }))}
                    />
                  ))}
                </div>
                <div style={styles.sectionHeader}>
                  <span>Primary Market</span>
                  <small>Usual trading asset</small>
                </div>
                <div className="onboarding-option-grid" style={styles.optionGrid}>
                  {MARKET_OPTIONS.map(({ value, label, desc, bullets }) => (
                    <OptionCard key={value} label={label} desc={desc} bullets={bullets}
                      selected={answers.main_market === value}
                      onClick={() => setAnswers((p) => ({ ...p, main_market: value }))}
                    />
                  ))}
                </div>
                <NavButtons onPrev={prev} onNext={next} nextDisabled={!answers.style_de_trading || !answers.main_market} />
              </QuestionStep>
            )}

            {step === 3 && (
              <QuestionStep
                icon={<Target size={18} />}
                eyebrow="AI Configuration"
                title="What priority should guide your AI debriefs?"
                desc="The coach will prioritize this topic, turning every audit into a concrete rule for your next trade."
                note="You can modify this preference anytime in Settings."
              >
                <div className="onboarding-option-grid" style={styles.optionGrid}>
                  {OBJECTIVE_OPTIONS.map(({ value, label, desc, bullets }) => (
                    <OptionCard key={value} label={label} desc={desc} bullets={bullets}
                      selected={answers.main_objective === value}
                      onClick={() => setAnswers((p) => ({ ...p, main_objective: value }))}
                    />
                  ))}
                </div>
                <NavButtons
                  onPrev={prev}
                  onNext={async () => {
                    const saved = await saveProfile();
                    if (saved) next();
                  }}
                  nextDisabled={!answers.main_objective}
                  nextLabel="Save & Continue"
                />
              </QuestionStep>
            )}

            {step === 4 && (
              !aiData ? (
                <QuestionStep
                  icon={<Zap size={18} />}
                  eyebrow="First Audit"
                  title="Run a sample AI trade diagnosis"
                  desc="This sample trade shows you the exact audit MySmartJournal delivers: discipline score, identified leaks, strengths, and institutional action items."
                  note="You can audit your own real trades right after on the Audit page."
                >
                  <div style={styles.sampleCard}>
                    <div style={styles.sampleHeader}>
                      <div>
                        <p style={styles.sampleTitle}>Sample Trade</p>
                        <p style={styles.sampleSub}>Order Block + BOS, H4 bullish context</p>
                      </div>
                      <span style={styles.sampleBadge}>EUR/USD</span>
                    </div>
                    <div className="onboarding-sample-grid" style={styles.sampleGrid}>
                      <SampleRow label="Pair" value="EUR/USD" />
                      <SampleRow label="Direction" value="LONG" valueColor="#10B981" />
                      <SampleRow label="Entry" value="1.08500" />
                      <SampleRow label="Stop Loss" value="1.08200" valueColor="#EF4444" />
                      <SampleRow label="Take Profit" value="1.09100" valueColor="#10B981" />
                      <SampleRow label="Setup" value="Order Block + BOS" />
                      <SampleRow label="R:R" value="2:1" valueColor="#818CF8" />
                      <SampleRow label="Emotion" value="Confident" valueColor="#10B981" />
                    </div>
                  </div>
                  {aiError && <p style={styles.errorText}>{aiError}</p>}
                  <div style={styles.finalActions}>
                    <button onClick={handleSampleAnalysis} disabled={loadingAI} className="onboarding-primary" style={{ ...styles.primaryBtn, opacity: loadingAI ? 0.7 : 1 }}>
                      {loadingAI
                        ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Running audit...</>
                        : <><Zap size={15} /> Run AI Risk Audit</>
                      }
                    </button>
                    <button onClick={handleGoAnalyse} style={styles.secondaryBtn} className="onboarding-secondary">
                      Audit my own trade <ArrowRight size={13} />
                    </button>
                  </div>
                </QuestionStep>
              ) : (
                <AIResult aiData={aiData} answers={answers} onFinish={handleFinish} onGoAnalyse={handleGoAnalyse} onGoDashboard={handleGoDashboard} />
              )
            )}
            {saveError && <p style={styles.errorText}>{saveError}</p>}
          </section>

          <ProfileSummary answers={answers} progress={progress} step={step} />
        </main>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .onboarding-option:hover {
          transform: translateY(-2px);
          border-color: #3B82F6 !important;
          background-color: #0C1524 !important;
        }
        .onboarding-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }
        .onboarding-secondary:hover {
          border-color: #3B82F666 !important;
          color: #E8EDF5 !important;
        }
        @media (max-width: 1100px) {
          .onboarding-stage {
            grid-template-columns: 1fr !important;
          }
          .onboarding-summary {
            order: -1;
            position: static !important;
          }
        }
        @media (max-width: 820px) {
          .onboarding-stepper {
            grid-template-columns: repeat(5, 1fr) !important;
          }
          .onboarding-step-detail {
            display: none !important;
          }
          .onboarding-option-grid,
          .onboarding-sample-grid {
            grid-template-columns: 1fr !important;
          }
          .onboarding-card {
            padding: 24px !important;
          }
          .onboarding-nav {
            flex-direction: column-reverse !important;
            align-items: stretch !important;
          }
        }
      `}</style>
    </div>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <div style={styles.welcome}>
      <div style={styles.heroIcon}><Brain size={26} /></div>
      <p style={styles.eyebrow}>Intelligent Onboarding</p>
      <h1 style={styles.heroTitle}>Let's build your trading profile.</h1>
      <p style={styles.heroDesc}>
        MySmartJournal doesn't offer generic feedback. Your AI Coach calibrates its standards, vocabulary, and priority focus directly to your trading profile.
      </p>

      <div style={styles.signalGrid}>
        <SignalCard icon={<Gauge size={16} />} title="Level" text="To calibrate the right level of depth and terminology." />
        <SignalCard icon={<TrendingUp size={16} />} title="Style" text="To assess your trades within your operational timeframe." />
        <SignalCard icon={<Target size={16} />} title="Objective" text="To prioritize actionable improvements." />
      </div>

      <button onClick={onNext} className="onboarding-primary" style={{ ...styles.primaryBtn, alignSelf: "center", minWidth: "260px" }}>
        Start Calibration <ChevronRight size={16} />
      </button>
    </div>
  );
}

function SignalCard({ icon, title, text }) {
  return (
    <div style={styles.signalCard}>
      <div style={styles.signalIcon}>{icon}</div>
      <div>
        <p style={styles.signalTitle}>{title}</p>
        <p style={styles.signalText}>{text}</p>
      </div>
    </div>
  );
}

function QuestionStep({ icon, eyebrow, title, desc, note, children }) {
  return (
    <div style={styles.question}>
      <div style={styles.questionHead}>
        <div style={styles.questionIcon}>{icon}</div>
        <div>
          <p style={styles.eyebrow}>{eyebrow}</p>
          <h2 style={styles.questionTitle}>{title}</h2>
          <p style={styles.questionDesc}>{desc}</p>
        </div>
      </div>
      <div style={styles.contextNote}>
        <ShieldCheck size={15} />
        <span>{note}</span>
      </div>
      {children}
    </div>
  );
}

function Stepper({ step, progress }) {
  return (
    <div style={styles.stepperWrap}>
      <div style={styles.stepperTop}>
        <span style={styles.progressText}>Step {step + 1} of {STEPS.length}</span>
        <div style={styles.progressInline}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.progressPct}>{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="onboarding-stepper" style={styles.stepperGrid}>
        {STEP_META.map((item, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={item.number} style={styles.stepItem}>
              <div style={{
                ...styles.stepMarker,
                backgroundColor: done ? "#10B981" : active ? "#3B82F6" : "#101827",
                color: done || active ? "#FFFFFF" : "#6B7FA3",
                borderColor: done ? "#10B981" : active ? "#3B82F6" : "#1E2D45",
              }}>
                {done ? <Check size={13} /> : item.number}
              </div>
              <div style={styles.stepCopy}>
                <p style={{ ...styles.stepTitle, color: active || done ? "#E8EDF5" : "#6B7FA3" }}>{item.title}</p>
                <p className="onboarding-step-detail" style={styles.stepDetail}>{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileSummary({ answers, progress, step }) {
  const completed = [
    answers.trading_level,
    answers.style_de_trading,
    answers.main_market,
    answers.main_objective,
  ].filter(Boolean).length;

  return (
    <aside className="onboarding-summary" style={styles.summaryCard}>
      <div style={styles.summaryTop}>
        <div style={styles.summaryIcon}><Brain size={18} /></div>
        <div>
          <p style={styles.summaryTitle}>AI Profile</p>
          <p style={styles.summarySub}>{completed}/4 signals calibrated</p>
        </div>
      </div>

      <div style={styles.summaryProgress}>
        <span>Calibration</span>
        <strong>{Math.round(progress)}%</strong>
      </div>
      <div style={styles.summaryTrack}>
        <div style={{ ...styles.summaryFill, width: `${progress}%` }} />
      </div>

      <div style={styles.summaryRows}>
        <SummaryRow icon={<User size={14} />} label="Level" value={formatAnswer(answers.trading_level)} />
        <SummaryRow icon={<TrendingUp size={14} />} label="Style" value={formatAnswer(answers.style_de_trading)} />
        <SummaryRow icon={<Compass size={14} />} label="Market" value={formatAnswer(answers.main_market)} />
        <SummaryRow icon={<Target size={14} />} label="Objective" value={formatAnswer(answers.main_objective)} />
      </div>

      <div style={styles.summaryFooter}>
        <CheckCircle2 size={15} />
        <span style={styles.summaryFooterText}>{step < 4 ? "Your profile updates dynamically with your responses." : "AI Coach ready for your first audit."}</span>
      </div>
    </aside>
  );
}

function SummaryRow({ icon, label, value }) {
  const isEmpty = value === "Pending" || value === "À définir";
  return (
    <div style={styles.summaryRow}>
      <div style={styles.summaryRowLeft}>
        <span style={styles.summaryRowIcon}>{icon}</span>
        <span style={styles.summaryRowLabel}>{label}</span>
      </div>
      <span style={{ ...styles.summaryRowValue, color: isEmpty ? "#536782" : "#E8EDF5" }}>{value}</span>
    </div>
  );
}

function OptionCard({ label, desc, bullets = [], selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="onboarding-option"
      style={{
        ...styles.optionCard,
        borderColor: selected ? "#3B82F6" : "#1E2D45",
        backgroundColor: selected ? "#111F36" : "#070B14",
      }}
    >
      <div style={styles.optionHead}>
        <span style={{ ...styles.optionLabel, color: selected ? "#F8FAFC" : "#CBD5E1" }}>{label}</span>
        <span style={{
          ...styles.optionCheck,
          backgroundColor: selected ? "#3B82F6" : "transparent",
          borderColor: selected ? "#3B82F6" : "#263954",
        }}>
          {selected && <Check size={12} color="#FFFFFF" />}
        </span>
      </div>
      <p style={styles.optionDesc}>{desc}</p>
      <div style={styles.optionBullets}>
        {bullets.map((bullet) => (
          <span key={bullet} style={styles.optionBullet}>
            <CheckCircle2 size={12} /> {bullet}
          </span>
        ))}
      </div>
    </button>
  );
}

function NavButtons({ onPrev, onNext, nextDisabled, nextLabel = "Continue" }) {
  return (
    <div className="onboarding-nav" style={styles.navBtns}>
      <button onClick={onPrev} style={styles.backBtn} className="onboarding-secondary"><ChevronLeft size={14} /> Back</button>
      <button onClick={onNext} disabled={nextDisabled} className="onboarding-primary" style={{ ...styles.primaryBtn, opacity: nextDisabled ? 0.45 : 1, cursor: nextDisabled ? "not-allowed" : "pointer", margin: 0 }}>
        {nextLabel} <ChevronRight size={14} />
      </button>
    </div>
  );
}

function SampleRow({ label, value, valueColor }) {
  return (
    <div style={styles.sampleRow}>
      <span style={styles.sampleLabel}>{label}</span>
      <span style={{ ...styles.sampleValue, color: valueColor || "#E8EDF5" }}>{value}</span>
    </div>
  );
}

function AIResult({ aiData, answers, onFinish, onGoAnalyse, onGoDashboard }) {
  const score = aiData?.score?.overall ?? 0;
  const scoreColor = score >= 7 ? "#10B981" : score >= 4 ? "#F59E0B" : "#EF4444";
  const scoreLabel = score >= 7 ? "SOLID TRADE" : score >= 4 ? "ACCEPTABLE" : "LEAK DETECTED";

  return (
    <div style={styles.aiResult}>
      <div style={styles.readyBox}>
        <div style={styles.readyIcon}><Check size={20} /></div>
        <div>
          <p style={styles.readyLabel}>Profile Configured</p>
          <h3 style={styles.readyTitle}>AI Coach Ready</h3>
          <p style={styles.readyText}>Your profile is calibrated for sharp, contextual trade audits.</p>
        </div>
      </div>

      <div style={styles.finalProfileGrid}>
        <SummaryMini label="Level" value={formatAnswer(answers.trading_level)} />
        <SummaryMini label="Style" value={formatAnswer(answers.style_de_trading)} />
        <SummaryMini label="Objective" value={formatAnswer(answers.main_objective)} />
      </div>

      <div style={styles.aiScoreRow}>
        <div style={{ ...styles.aiScoreCircle, borderColor: scoreColor + "55" }}>
          <span style={{ color: scoreColor, fontSize: "2rem", fontWeight: "800" }}>{score}</span>
          <span style={{ color: "#6B7FA3", fontSize: "0.8rem" }}>/10</span>
        </div>
        <div>
          <div style={{ ...styles.scoreChip, backgroundColor: scoreColor + "18", border: `1px solid ${scoreColor}44`, color: scoreColor }}>{scoreLabel}</div>
          <p style={styles.verdictText}>{aiData.verdict}</p>
        </div>
      </div>
      {aiData.main_mistake && (
        <div style={styles.mistakeBox}>
          <span style={{ color: "#F59E0B", fontSize: "0.85rem" }}>⚠ {aiData.main_mistake}</span>
        </div>
      )}
      {aiData.mistakes?.length > 0 && (
        <div style={styles.aiSection}>
          <p style={styles.aiSectionTitle}>Identified Leaks</p>
          {aiData.mistakes.map((m, i) => (
            <div key={i} style={styles.aiListItem}>
              <div style={styles.aiDot} />
              <span style={styles.aiListText}>{m}</span>
            </div>
          ))}
        </div>
      )}
      {aiData.action_plan?.length > 0 && (
        <div style={styles.aiSection}>
          <p style={styles.aiSectionTitle}>Action Plan</p>
          {aiData.action_plan.map((a, i) => (
            <div key={i} style={styles.aiActionItem}>
              <div style={styles.aiActionNum}>{i + 1}</div>
              <span style={styles.aiListText}>{a}</span>
            </div>
          ))}
        </div>
      )}
      <div style={styles.ctaGroup}>
        <p style={styles.ctaTitle}>Next Step</p>
        <div style={styles.ctaButtons}>
          <button onClick={onGoAnalyse} className="onboarding-primary" style={styles.primaryBtn}><Zap size={14} /> Log My First Trade</button>
          <button onClick={onGoDashboard} style={styles.secondaryBtn} className="onboarding-secondary"><BarChart2 size={14} /> View Dashboard</button>
          <button onClick={onFinish} style={styles.ghostBtn}><BookOpen size={14} /> Go to Journal</button>
        </div>
      </div>
    </div>
  );
}

function SummaryMini({ label, value }) {
  return (
    <div style={styles.summaryMini}>
      <span style={styles.summaryMiniLabel}>{label}</span>
      <strong style={styles.summaryMiniValue}>{value}</strong>
    </div>
  );
}

function formatAnswer(value) {
  if (!value) return "Pending";
  const labels = {
    "débutant": "Beginner",
    "intermédiaire": "Intermediate",
    "avancé": "Advanced",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    scalping: "Scalping",
    intraday: "Intraday",
    swing: "Swing Trading",
    forex: "Forex",
    crypto: "Crypto",
    indices: "Indices",
    discipline: "Discipline",
    psychologie: "Psychology",
    psychology: "Psychology",
    performance: "Performance",
  };
  return labels[value] || value;
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#070B14",
    color: "#E8EDF5",
    fontFamily: "'Inter', sans-serif",
  },
  topBar: {
    height: "72px",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  brandMark: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1px solid #243653",
    backgroundColor: "#0D1421",
    color: "#93C5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: "#F8FAFC",
    fontSize: "0.95rem",
    fontWeight: "800",
    margin: 0,
  },
  brandSub: {
    color: "#637796",
    fontSize: "0.74rem",
    fontWeight: "600",
    margin: "3px 0 0",
  },
  skipBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    backgroundColor: "transparent",
    border: "1px solid #243653",
    borderRadius: "8px",
    color: "#7D8FAD",
    fontSize: "0.82rem",
    padding: "9px 14px",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  shell: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "6px 28px 42px",
  },
  stepperWrap: {
    backgroundColor: "#0A101C",
    border: "1px solid #17243A",
    borderRadius: "8px",
    padding: "18px",
  },
  stepperTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "16px",
  },
  progressText: {
    color: "#E8EDF5",
    fontSize: "0.8rem",
    fontWeight: "800",
  },
  progressInline: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "260px",
  },
  progressTrack: {
    height: "5px",
    flex: 1,
    backgroundColor: "#1E2D45",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: "999px",
    transition: "width 0.35s ease",
  },
  progressPct: {
    color: "#93C5FD",
    fontSize: "0.78rem",
    fontWeight: "800",
    minWidth: "34px",
    textAlign: "right",
  },
  stepperGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "10px",
  },
  stepItem: {
    minHeight: "54px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  stepMarker: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    fontWeight: "900",
    flexShrink: 0,
    transition: "all 0.18s ease",
  },
  stepCopy: {
    minWidth: 0,
  },
  stepTitle: {
    color: "#E8EDF5",
    fontSize: "0.78rem",
    fontWeight: "800",
    margin: 0,
    whiteSpace: "nowrap",
  },
  stepDetail: {
    color: "#637796",
    fontSize: "0.68rem",
    margin: "4px 0 0",
    whiteSpace: "nowrap",
  },
  stage: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 760px) 340px",
    gap: "22px",
    alignItems: "stretch",
    marginTop: "22px",
  },
  card: {
    minHeight: "560px",
    backgroundColor: "#0D1421",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    padding: "34px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  welcome: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "18px",
    maxWidth: "640px",
    margin: "0 auto",
  },
  heroIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "8px",
    backgroundColor: "#111F36",
    border: "1px solid #3B82F633",
    color: "#93C5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: "#7AA7FF",
    fontSize: "0.72rem",
    fontWeight: "900",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 0,
  },
  heroTitle: {
    color: "#F8FAFC",
    fontSize: "2.15rem",
    lineHeight: 1.08,
    fontWeight: "900",
    margin: 0,
    letterSpacing: 0,
  },
  heroDesc: {
    color: "#94A3B8",
    fontSize: "1rem",
    lineHeight: 1.65,
    margin: 0,
    maxWidth: "580px",
  },
  signalGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    margin: "6px 0 4px",
  },
  signalCard: {
    minHeight: "132px",
    backgroundColor: "#070B14",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "10px",
  },
  signalIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    color: "#60A5FA",
    backgroundColor: "#111F36",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  signalTitle: {
    color: "#E8EDF5",
    fontSize: "0.88rem",
    fontWeight: "900",
    margin: 0,
  },
  signalText: {
    color: "#7D8FAD",
    fontSize: "0.78rem",
    lineHeight: 1.45,
    margin: "5px 0 0",
  },
  question: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  questionHead: {
    display: "grid",
    gridTemplateColumns: "44px minmax(0, 1fr)",
    gap: "14px",
    alignItems: "start",
  },
  questionIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    backgroundColor: "#111F36",
    border: "1px solid #3B82F633",
    color: "#93C5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  questionTitle: {
    color: "#F8FAFC",
    fontSize: "1.65rem",
    lineHeight: 1.16,
    fontWeight: "900",
    margin: "7px 0 0",
    letterSpacing: 0,
  },
  questionDesc: {
    color: "#94A3B8",
    fontSize: "0.94rem",
    lineHeight: 1.65,
    margin: "10px 0 0",
    maxWidth: "660px",
  },
  contextNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    color: "#8CA0BE",
    fontSize: "0.82rem",
    lineHeight: 1.55,
    backgroundColor: "#08111E",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    padding: "12px 14px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "12px",
    color: "#E8EDF5",
    fontSize: "0.78rem",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: "2px",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  optionCard: {
    minHeight: "168px",
    borderRadius: "8px",
    border: "1px solid",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.18s ease",
    textAlign: "left",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  optionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  optionLabel: {
    fontSize: "0.98rem",
    fontWeight: "900",
  },
  optionCheck: {
    width: "22px",
    height: "22px",
    borderRadius: "999px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionDesc: {
    color: "#8CA0BE",
    fontSize: "0.8rem",
    lineHeight: 1.45,
    margin: 0,
  },
  optionBullets: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "auto",
  },
  optionBullet: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#667A98",
    fontSize: "0.72rem",
    lineHeight: 1.25,
  },
  navBtns: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    marginTop: "2px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    backgroundColor: "transparent",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    color: "#7D8FAD",
    fontSize: "0.86rem",
    padding: "12px 18px",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    padding: "13px 28px",
    backgroundColor: "#3B82F6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "900",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    margin: 0,
    transition: "all 0.18s ease",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "12px 22px",
    backgroundColor: "transparent",
    border: "1px solid #1E2D45",
    color: "#94A3B8",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "0.86rem",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.18s ease",
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "12px 22px",
    backgroundColor: "#111827",
    border: "1px solid #1E2D45",
    color: "#7D8FAD",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "0.86rem",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  summaryCard: {
    position: "sticky",
    top: "22px",
    minHeight: "560px",
    backgroundColor: "#0D1421",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  summaryTop: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: "10px",
    marginBottom: "24px",
  },
  summaryIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#111F36",
    border: "1px solid #3B82F633",
    color: "#93C5FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    color: "#F8FAFC",
    fontSize: "1rem",
    fontWeight: "900",
    margin: 0,
  },
  summarySub: {
    color: "#637796",
    fontSize: "0.76rem",
    fontWeight: "650",
    margin: "5px 0 0",
  },
  summaryProgress: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#7D8FAD",
    fontSize: "0.78rem",
    fontWeight: "800",
    marginBottom: "8px",
  },
  summaryTrack: {
    height: "6px",
    backgroundColor: "#1E2D45",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "18px",
  },
  summaryFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: "999px",
    transition: "width 0.35s ease",
  },
  summaryRows: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  summaryRow: {
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    backgroundColor: "#070B14",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    padding: "0 14px",
  },
  summaryRowLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },
  summaryRowIcon: {
    color: "#60A5FA",
    display: "inline-flex",
    alignItems: "center",
  },
  summaryRowLabel: {
    color: "#7D8FAD",
    fontSize: "0.76rem",
    fontWeight: "800",
  },
  summaryRowValue: {
    fontSize: "0.78rem",
    fontWeight: "900",
    textAlign: "right",
  },
  summaryFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "left",
    gap: "8px",
    color: "#7D8FAD",
    fontSize: "0.78rem",
    lineHeight: 1.45,
    borderTop: "1px solid #1E2D45",
    marginTop: "18px",
    paddingTop: "16px",
  },
  summaryFooterText: {
    display: "block",
    fontWeight: "700",
  },
  sampleCard: {
    backgroundColor: "#070B14",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    padding: "18px",
  },
  sampleHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
  },
  sampleTitle: {
    color: "#E8EDF5",
    fontSize: "0.9rem",
    fontWeight: "900",
    margin: 0,
  },
  sampleSub: {
    color: "#637796",
    fontSize: "0.76rem",
    margin: "4px 0 0",
  },
  sampleBadge: {
    border: "1px solid #3B82F633",
    backgroundColor: "#111F36",
    color: "#93C5FD",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "0.7rem",
    fontWeight: "900",
  },
  sampleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px 18px",
  },
  sampleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "8px 0",
    borderBottom: "1px solid #1E2D4522",
  },
  sampleLabel: {
    color: "#6B7FA3",
    fontSize: "0.8rem",
  },
  sampleValue: {
    fontWeight: "900",
    fontSize: "0.82rem",
    textAlign: "right",
  },
  finalActions: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
  },
  errorText: {
    color: "#EF4444",
    fontSize: "0.84rem",
    margin: 0,
  },
  aiResult: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  readyBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "#07140F",
    border: "1px solid #10B98144",
    borderRadius: "8px",
    padding: "16px",
  },
  readyIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  readyLabel: {
    color: "#10B981",
    fontSize: "0.72rem",
    fontWeight: "900",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 0,
  },
  readyTitle: {
    color: "#F8FAFC",
    fontSize: "1.25rem",
    fontWeight: "900",
    margin: "3px 0",
  },
  readyText: {
    color: "#8CA0BE",
    fontSize: "0.84rem",
    margin: 0,
    lineHeight: 1.45,
  },
  finalProfileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },
  summaryMini: {
    backgroundColor: "#070B14",
    border: "1px solid #1E2D45",
    borderRadius: "8px",
    padding: "12px",
  },
  summaryMiniLabel: {
    display: "block",
    color: "#6B7FA3",
    fontSize: "0.68rem",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "5px",
  },
  summaryMiniValue: {
    color: "#E8EDF5",
    fontSize: "0.9rem",
  },
  aiScoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  aiScoreCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "3px solid",
    backgroundColor: "#070B14",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scoreChip: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "0.68rem",
    fontWeight: "900",
    marginBottom: "7px",
  },
  verdictText: {
    color: "#E8EDF5",
    fontSize: "0.9rem",
    fontWeight: "650",
    lineHeight: "1.5",
    margin: 0,
  },
  mistakeBox: {
    backgroundColor: "#451A0315",
    border: "1px solid #F59E0B33",
    borderRadius: "8px",
    padding: "11px 14px",
  },
  aiSection: {
    backgroundColor: "#070B14",
    borderRadius: "8px",
    padding: "15px",
    border: "1px solid #1E2D45",
  },
  aiSectionTitle: {
    fontSize: "0.7rem",
    fontWeight: "900",
    color: "#6B7FA3",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 10px 0",
  },
  aiListItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "6px 0",
    borderBottom: "1px solid #1E2D4522",
  },
  aiDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#EF4444",
    marginTop: "6px",
    flexShrink: 0,
  },
  aiActionItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "7px 0",
    borderBottom: "1px solid #1E2D4522",
  },
  aiActionNum: {
    width: "22px",
    height: "22px",
    borderRadius: "7px",
    backgroundColor: "#111F36",
    color: "#60A5FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    fontWeight: "900",
    flexShrink: 0,
  },
  aiListText: {
    color: "#94A3B8",
    fontSize: "0.84rem",
    lineHeight: "1.5",
  },
  ctaGroup: {
    textAlign: "center",
    paddingTop: "8px",
  },
  ctaTitle: {
    color: "#E8EDF5",
    fontWeight: "900",
    fontSize: "0.92rem",
    margin: "0 0 14px 0",
  },
  ctaButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
};
