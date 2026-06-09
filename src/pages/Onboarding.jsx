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
  notes: "Entrée sur un OB en H4 après un BOS haussier. Contexte macro favorable.",
  risk: "1",
  emotion: "Confiant",
  date: new Date().toISOString().split("T")[0],
};

const STEPS = ["Bienvenue", "Profil", "Style", "Objectif", "Premier Trade"];

const STEP_META = [
  { number: "01", title: "Profil", detail: "Orientation" },
  { number: "02", title: "Trading", detail: "Expérience" },
  { number: "03", title: "Objectifs", detail: "Style & marché" },
  { number: "04", title: "Configuration IA", detail: "Priorité" },
  { number: "05", title: "Premier Trade", detail: "Mise en action" },
];

const LEVEL_OPTIONS = [
  {
    value: "débutant",
    label: "Débutant",
    desc: "Vous construisez encore vos bases de lecture et d'exécution.",
    bullets: ["Explications plus pédagogiques", "Rappels de discipline", "Débriefs très guidés"],
  },
  {
    value: "intermédiaire",
    label: "Intermédiaire",
    desc: "Vous avez une méthode, mais la régularité reste à stabiliser.",
    bullets: ["Feedback équilibré", "Erreurs récurrentes visibles", "Priorités de progression"],
  },
  {
    value: "avancé",
    label: "Avancé",
    desc: "Votre stratégie est posée, vous cherchez surtout de la précision.",
    bullets: ["Analyse plus directe", "Focus exécution", "Optimisation du process"],
  },
];

const STYLE_OPTIONS = [
  {
    value: "scalping",
    label: "Scalping",
    desc: "Décisions rapides sur des fenêtres courtes.",
    bullets: ["Timing d'entrée", "Gestion immédiate du risque", "Réactivité émotionnelle"],
  },
  {
    value: "intraday",
    label: "Intraday",
    desc: "Trades construits et clôturés dans la journée.",
    bullets: ["Contexte de session", "Zones clés", "Qualité du scénario"],
  },
  {
    value: "swing",
    label: "Swing",
    desc: "Positions portées sur plusieurs jours.",
    bullets: ["Patience", "Planification", "Gestion multi-sessions"],
  },
];

const MARKET_OPTIONS = [
  {
    value: "forex",
    label: "Forex",
    desc: "Paires majeures, gold, sessions Londres/New York.",
    bullets: ["EUR/USD", "GBP/USD", "XAU/USD"],
  },
  {
    value: "crypto",
    label: "Crypto",
    desc: "Marché continu, volatilité élevée, exécution stricte.",
    bullets: ["BTC", "ETH", "Altcoins"],
  },
  {
    value: "indices",
    label: "Indices",
    desc: "Ouvertures de marché et mouvements directionnels.",
    bullets: ["US30", "NAS100", "SPX"],
  },
];

const OBJECTIVE_OPTIONS = [
  {
    value: "discipline",
    label: "Discipline",
    desc: "Respecter votre plan même quand le marché accélère.",
    bullets: ["Règles d'entrée", "Patience", "Checklist"],
  },
  {
    value: "psychologie",
    label: "Psychologie",
    desc: "Identifier les émotions qui dégradent vos décisions.",
    bullets: ["FOMO", "Revenge trading", "Impulsivité"],
  },
  {
    value: "performance",
    label: "Performance",
    desc: "Améliorer la qualité moyenne de vos trades.",
    bullets: ["Win rate", "R:R", "Meilleurs setups"],
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
      setSaveError(err.message || "Impossible de terminer l'onboarding pour le moment.");
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
      setSaveError(err.message || "Impossible de sauvegarder votre profil pour le moment.");
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
      setAiError("Erreur lors de l'analyse. Réessayez.");
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
      setSaveError(err.message || "Impossible de terminer l'onboarding pour le moment.");
    }
  }

  async function handleGoAnalyse() {
    analytics.onboardingCompleted(answers);
    setSaveError(null);
    try {
      await completeOnboarding();
      navigate("/analyse");
    } catch (err) {
      setSaveError(err.message || "Impossible de terminer l'onboarding pour le moment.");
    }
  }

  async function handleGoDashboard() {
    analytics.onboardingCompleted(answers);
    setSaveError(null);
    try {
      await completeOnboarding();
      navigate("/dashboard");
    } catch (err) {
      setSaveError(err.message || "Impossible de terminer l'onboarding pour le moment.");
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
            <p style={styles.brandSub}>Calibrage du coach IA</p>
          </div>
        </div>
        <button onClick={handleSkip} style={styles.skipBtn}>
          <SkipForward size={14} /> Passer
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
                eyebrow="Profil trader"
                title="Quel niveau doit adopter votre coach ?"
                desc="Cette réponse règle le niveau de détail des analyses : pédagogie, vocabulaire, exigence et profondeur du feedback."
                note="Le but n'est pas d'évaluer votre valeur de trader, mais d'adapter la façon dont l'IA vous parle."
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
                eyebrow="Cadre de trading"
                title="Dans quel contexte l'IA doit-elle vous analyser ?"
                desc="Un scalp EUR/USD et un swing sur indice ne se jugent pas avec les mêmes critères. Ce cadrage rend le feedback plus juste."
                note="Ces choix servent uniquement à contextualiser les analyses, pas à limiter les trades que vous pourrez enregistrer."
              >
                <div style={styles.sectionHeader}>
                  <span>Style principal</span>
                  <small>Votre rythme de décision</small>
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
                  <span>Marché principal</span>
                  <small>Votre terrain habituel</small>
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
                eyebrow="Configuration IA"
                title="Quelle priorité guidera vos débriefs IA ?"
                desc="Le coach mettra ce sujet au premier plan pour transformer chaque analyse en une action claire à appliquer sur le trade suivant."
                note="Vous pourrez faire évoluer cette préférence plus tard depuis les paramètres."
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
                  nextLabel="Sauvegarder & Continuer"
                />
              </QuestionStep>
            )}

            {step === 4 && (
              !aiData ? (
                <QuestionStep
                  icon={<Zap size={18} />}
                  eyebrow="Premier feedback"
                  title="Lancez un premier diagnostic IA"
                  desc="Ce trade exemple vous montre immédiatement le type de lecture que MySmartJournal apporte : score, erreurs, points forts et actions concrètes."
                  note="Vous pourrez ensuite analyser votre propre trade depuis la page Analyse."
                >
                  <div style={styles.sampleCard}>
                    <div style={styles.sampleHeader}>
                      <div>
                        <p style={styles.sampleTitle}>Trade exemple</p>
                        <p style={styles.sampleSub}>Order Block + BOS, contexte haussier H4</p>
                      </div>
                      <span style={styles.sampleBadge}>EUR/USD</span>
                    </div>
                    <div className="onboarding-sample-grid" style={styles.sampleGrid}>
                      <SampleRow label="Paire" value="EUR/USD" />
                      <SampleRow label="Direction" value="LONG" valueColor="#10B981" />
                      <SampleRow label="Entrée" value="1.08500" />
                      <SampleRow label="Stop Loss" value="1.08200" valueColor="#EF4444" />
                      <SampleRow label="Take Profit" value="1.09100" valueColor="#10B981" />
                      <SampleRow label="Setup" value="Order Block + BOS" />
                      <SampleRow label="R:R" value="2:1" valueColor="#818CF8" />
                      <SampleRow label="Émotion" value="Confiant" valueColor="#10B981" />
                    </div>
                  </div>
                  {aiError && <p style={styles.errorText}>{aiError}</p>}
                  <div style={styles.finalActions}>
                    <button onClick={handleSampleAnalysis} disabled={loadingAI} className="onboarding-primary" style={{ ...styles.primaryBtn, opacity: loadingAI ? 0.7 : 1 }}>
                      {loadingAI
                        ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyse en cours...</>
                        : <><Zap size={15} /> Lancer l'analyse IA</>
                      }
                    </button>
                    <button onClick={handleGoAnalyse} style={styles.secondaryBtn} className="onboarding-secondary">
                      Analyser mon propre trade <ArrowRight size={13} />
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
      <p style={styles.eyebrow}>Onboarding intelligent</p>
      <h1 style={styles.heroTitle}>Construisons votre profil de trading.</h1>
      <p style={styles.heroDesc}>
        MySmartJournal ne vous donne pas une réponse générique. Le coach IA calibre son niveau d'exigence, son vocabulaire et ses priorités à partir de votre profil.
      </p>

      <div style={styles.signalGrid}>
        <SignalCard icon={<Gauge size={16} />} title="Niveau" text="Pour choisir le bon degré de pédagogie." />
        <SignalCard icon={<TrendingUp size={16} />} title="Style" text="Pour juger vos trades dans le bon rythme." />
        <SignalCard icon={<Target size={16} />} title="Objectif" text="Pour prioriser les corrections utiles." />
      </div>

      <button onClick={onNext} className="onboarding-primary" style={{ ...styles.primaryBtn, alignSelf: "center", minWidth: "260px" }}>
        Commencer le calibrage <ChevronRight size={16} />
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
        <span style={styles.progressText}>Étape {step + 1} sur {STEPS.length}</span>
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
          <p style={styles.summaryTitle}>Profil IA</p>
          <p style={styles.summarySub}>{completed}/4 signaux renseignés</p>
        </div>
      </div>

      <div style={styles.summaryProgress}>
        <span>Calibrage</span>
        <strong>{Math.round(progress)}%</strong>
      </div>
      <div style={styles.summaryTrack}>
        <div style={{ ...styles.summaryFill, width: `${progress}%` }} />
      </div>

      <div style={styles.summaryRows}>
        <SummaryRow icon={<User size={14} />} label="Niveau" value={formatAnswer(answers.trading_level)} />
        <SummaryRow icon={<TrendingUp size={14} />} label="Style" value={formatAnswer(answers.style_de_trading)} />
        <SummaryRow icon={<Compass size={14} />} label="Marché" value={formatAnswer(answers.main_market)} />
        <SummaryRow icon={<Target size={14} />} label="Objectif" value={formatAnswer(answers.main_objective)} />
      </div>

      <div style={styles.summaryFooter}>
        <CheckCircle2 size={15} />
        <span style={styles.summaryFooterText}>{step < 4 ? "Le profil se construit au fil de vos réponses." : "Coach prêt pour le premier diagnostic."}</span>
      </div>
    </aside>
  );
}

function SummaryRow({ icon, label, value }) {
  const isEmpty = value === "À définir";
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

function NavButtons({ onPrev, onNext, nextDisabled, nextLabel = "Continuer" }) {
  return (
    <div className="onboarding-nav" style={styles.navBtns}>
      <button onClick={onPrev} style={styles.backBtn} className="onboarding-secondary"><ChevronLeft size={14} /> Retour</button>
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
  const scoreLabel = score >= 7 ? "BON TRADE" : score >= 4 ? "ACCEPTABLE" : "À ÉVITER";

  return (
    <div style={styles.aiResult}>
      <div style={styles.readyBox}>
        <div style={styles.readyIcon}><Check size={20} /></div>
        <div>
          <p style={styles.readyLabel}>Profil configuré</p>
          <h3 style={styles.readyTitle}>Coach IA prêt</h3>
          <p style={styles.readyText}>Votre profil est calibré pour des analyses plus contextualisées.</p>
        </div>
      </div>

      <div style={styles.finalProfileGrid}>
        <SummaryMini label="Niveau" value={formatAnswer(answers.trading_level)} />
        <SummaryMini label="Style" value={formatAnswer(answers.style_de_trading)} />
        <SummaryMini label="Objectif" value={formatAnswer(answers.main_objective)} />
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
          <p style={styles.aiSectionTitle}>Erreurs identifiées</p>
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
          <p style={styles.aiSectionTitle}>Plan d'action</p>
          {aiData.action_plan.map((a, i) => (
            <div key={i} style={styles.aiActionItem}>
              <div style={styles.aiActionNum}>{i + 1}</div>
              <span style={styles.aiListText}>{a}</span>
            </div>
          ))}
        </div>
      )}
      <div style={styles.ctaGroup}>
        <p style={styles.ctaTitle}>Prochaine étape</p>
        <div style={styles.ctaButtons}>
          <button onClick={onGoAnalyse} className="onboarding-primary" style={styles.primaryBtn}><Zap size={14} /> Créer mon premier trade</button>
          <button onClick={onGoDashboard} style={styles.secondaryBtn} className="onboarding-secondary"><BarChart2 size={14} /> Voir le Dashboard</button>
          <button onClick={onFinish} style={styles.ghostBtn}><BookOpen size={14} /> Aller au Journal</button>
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
  if (!value) return "À définir";
  const labels = {
    "débutant": "Débutant",
    "intermédiaire": "Intermédiaire",
    "avancé": "Avancé",
    scalping: "Scalping",
    intraday: "Intraday",
    swing: "Swing",
    forex: "Forex",
    crypto: "Crypto",
    indices: "Indices",
    discipline: "Discipline",
    psychologie: "Psychologie",
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
