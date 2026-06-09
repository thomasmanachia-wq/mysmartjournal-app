import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { insertTrade } from "../lib/tradesService.js";
import { analytics } from "../lib/analytics.js";
import { usePlan } from "../context/PlanContext.jsx";
import {
  CheckCircle, AlertTriangle, XCircle, ChevronRight,
  Target, ShieldCheck, Brain, Zap, ArrowLeft,
  BookOpen, Activity, AlertCircle
} from "lucide-react";
import FeedbackWidget from "../components/FeedbackWidget.jsx";

export default function ReponseIA() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { plan } = usePlan();
  const [acknowledged, setAcknowledged] = useState(false);
  const [reflections, setReflections] = useState({});
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [importError, setImportError] = useState(null);
  const [savedTradeId, setSavedTradeId] = useState(null);

  if (!state?.aiData || !state?.form) {
    return <Navigate to="/analyse" replace />;
  }

  const { form, aiData } = state;

  if (aiData.error) {
    return (
      <div style={styles.errorPage}>
        <AlertCircle size={32} color="#EF4444" />
        <h2 style={{ color: "#E8EDF5", margin: 0 }}>Erreur d'analyse</h2>
        <p style={{ color: "#6B7FA3" }}>{aiData.error}</p>
        <button onClick={() => navigate("/analyse")} style={styles.backBtn}>
          <ArrowLeft size={13} /> Réessayer
        </button>
      </div>
    );
  }

  const safe = {
    score: aiData.score || { overall: 0, setup_quality: 0, risk_management: 0, psychology: 0 },
    verdict: aiData.verdict || "Analyse non disponible.",
    main_mistake: aiData.main_mistake || null,
    breakdown: aiData.breakdown || {},
    mistakes: aiData.mistakes || [],
    strengths: aiData.strengths || [],
    action_plan: aiData.action_plan || [],
    reflection_questions: aiData.reflection_questions || [],
    recurring_pattern: cleanNullableText(aiData.recurring_pattern),
    progress_note: cleanNullableText(aiData.progress_note),
  };

  const overall = safe.score.overall;
  const scoreColor = overall >= 7 ? "#10B981" : overall >= 4 ? "#F59E0B" : "#EF4444";
  const scoreLabel = overall >= 7 ? "BON TRADE" : overall >= 4 ? "ACCEPTABLE" : "À ÉVITER";
  const hasLongTermProgress = Boolean(safe.recurring_pattern || safe.progress_note);

  const rr = (() => {
    const entry = parseFloat(form.entryPrice);
    const stopLoss = parseFloat(form.stopLoss);
    const takeProfit = parseFloat(form.takeProfit);
    const risk = Math.abs(entry - stopLoss);

    return Number.isFinite(entry) && Number.isFinite(stopLoss) && Number.isFinite(takeProfit) && risk > 0
      ? (Math.abs(takeProfit - entry) / risk).toFixed(2)
      : "—";
  })();

  const allReflectionsAnswered = safe.reflection_questions.length === 0 ||
    safe.reflection_questions.every((_, i) => (reflections[i] || "").trim().length > 10);

  async function handleImport() {
    if (!acknowledged) return;
    setImporting(true);
    setImportError(null);
    try {
      const isLong = form.direction === "long";
      const entry = parseFloat(form.entryPrice);
      const sl = parseFloat(form.stopLoss);
      const tp = parseFloat(form.takeProfit);
      const exit = parseFloat(form.exitPrice);
      const epsilon = 1e-10;

      let result = "pending";
      let realizedRR = null;
      if (Number.isFinite(entry) && Number.isFinite(exit) && exit > 0) {
        const stopHit = Number.isFinite(sl) && (isLong ? exit <= sl : exit >= sl);
        const targetHit = Number.isFinite(tp) && (isLong ? exit >= tp : exit <= tp);
        const priceMove = isLong ? exit - entry : entry - exit;
        const risk = Number.isFinite(sl) ? Math.abs(entry - sl) : 0;

        if (risk > 0) {
          realizedRR = priceMove / risk;
        }

        if (Math.abs(priceMove) <= epsilon) result = "breakeven";
        else if (stopHit || priceMove < 0) result = "loss";
        else if (targetHit || priceMove > 0) result = "win";
      }

      const storedRR = realizedRR !== null && Number.isFinite(realizedRR)
        ? Math.abs(realizedRR).toFixed(2)
        : rr;
      const reflectionAnswers = safe.reflection_questions.map((question, index) => ({
        question,
        answer: (reflections[index] || "").trim(),
      }));

      const saved = await insertTrade({
        pair: form.pair,
        date: form.date,
        direction: isLong ? "buy" : "sell",
        entry: form.entryPrice,
        exitPrice: form.exitPrice,
        stopLoss: form.stopLoss,
        takeProfit: form.takeProfit,
        risk: form.risk,
        result,
        notes: form.notes,
        rr: storedRR,
        setup: form.setup,
        emotion: form.emotion,
        timeframe: form.timeframe,
        size: form.size,
        analysisType: form.analysisType,
        reflectionAnswers,
        aiScore: safe.score.overall,
        aiAnalysis: aiData,
      });

      setSavedTradeId(saved?.id || null);

      analytics.analysisSaved(form.pair, safe.score.overall);
      analytics.tradeCreated({
        pair: form.pair,
        direction: form.direction,
        result,
        rr: storedRR,
        setup: form.setup,
        emotion: form.emotion,
      });

      setImportDone(true);
    } catch (err) {
      analytics.errorOccurred("import_trade", err.message);
      setImportError("Erreur lors de l'import. Réessayez.");
    } finally {
      setImporting(false);
    }
  }

  function handleAcknowledge() {
    if (!allReflectionsAnswered) return;
    analytics.reflectionCompleted(safe.reflection_questions.length);
    setAcknowledged(true);
  }

  return (
    <div style={styles.page}>
      <button onClick={() => navigate("/analyse")} style={styles.backBtn}>
        <ArrowLeft size={13} /> Modifier le trade
      </button>

      {/* HERO SCORE */}
      <div style={styles.heroCard}>
        <div style={styles.scoreBlock}>
          <div style={{ ...styles.scoreCircle, borderColor: scoreColor + "55", boxShadow: `0 0 32px ${scoreColor}18` }}>
            <div style={styles.scoreValue}>
              <span style={{ ...styles.scoreNum, color: scoreColor }}>{overall}</span>
              <span style={styles.scoreDenom}>/10</span>
            </div>
          </div>
          <div style={{ ...styles.scoreChip, backgroundColor: scoreColor + "18", border: `1px solid ${scoreColor}44`, color: scoreColor }}>
            {scoreLabel}
          </div>
        </div>

        <div style={styles.heroContent}>
          <p style={styles.verdictText}>{safe.verdict}</p>
          {safe.main_mistake && (
            <div style={styles.mainMistake}>
              <AlertTriangle size={14} color="#F59E0B" />
              <span style={styles.mainMistakeText}>{safe.main_mistake}</span>
            </div>
          )}
          <div style={styles.subscores}>
            <ScoreBar label="Setup" value={safe.score.setup_quality} icon={<Zap size={11} color="#6B7FA3" />} />
            <ScoreBar label="Risk Mgmt" value={safe.score.risk_management} icon={<ShieldCheck size={11} color="#6B7FA3" />} />
            <ScoreBar label="Psychologie" value={safe.score.psychology} icon={<Brain size={11} color="#6B7FA3" />} />
          </div>
        </div>

        <div style={styles.tradeSummary}>
          <p style={styles.summaryTitle}>Trade</p>
          <SummaryRow label="Paire" value={form.pair?.toUpperCase()} />
          <SummaryRow label="Direction" value={form.direction === "long" ? "LONG" : "SHORT"} valueColor={form.direction === "long" ? "#10B981" : "#EF4444"} />
          <SummaryRow label="R:R" value={`1:${rr}`} valueColor="#6366F1" />
          {form.emotion && <SummaryRow label="Émotion" value={form.emotion} />}
        </div>
      </div>

      {/* BREAKDOWN */}
      <SectionTitle icon={<Activity size={13} color="#6B7FA3" />} label="Analyse détaillée" />
      <div style={styles.breakdownGrid}>
        <BreakdownCard icon={<Zap size={14} color="#3B82F6" />} label="Setup" text={safe.breakdown.setup} score={safe.score.setup_quality} />
        <BreakdownCard icon={<ShieldCheck size={14} color="#3B82F6" />} label="Risk Management" text={safe.breakdown.risk_management} score={safe.score.risk_management} />
        <BreakdownCard icon={<Brain size={14} color="#3B82F6" />} label="Psychologie" text={safe.breakdown.psychology} score={safe.score.psychology} />
      </div>

      {/* MISTAKES + STRENGTHS */}
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <XCircle size={14} color="#EF4444" />
            <h3 style={styles.cardTitle}>Erreurs identifiées</h3>
          </div>
          {safe.mistakes.length === 0
            ? <p style={styles.emptyText}>Aucune erreur majeure détectée.</p>
            : safe.mistakes.map((m, i) => (
              <div key={i} style={styles.listItem}>
                <div style={{ ...styles.listDot, backgroundColor: "#EF444422", border: "1px solid #EF444433" }}>
                  <XCircle size={9} color="#EF4444" />
                </div>
                <span style={styles.listText}>{m}</span>
              </div>
            ))}
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <CheckCircle size={14} color="#10B981" />
            <h3 style={styles.cardTitle}>Points forts</h3>
          </div>
          {safe.strengths.length === 0
            ? <p style={styles.emptyText}>Aucun point fort identifié.</p>
            : safe.strengths.map((s, i) => (
              <div key={i} style={styles.listItem}>
                <div style={{ ...styles.listDot, backgroundColor: "#10B98122", border: "1px solid #10B98133" }}>
                  <CheckCircle size={9} color="#10B981" />
                </div>
                <span style={styles.listText}>{s}</span>
              </div>
            ))}
        </div>
      </div>

      {/* ACTION PLAN */}
      {safe.action_plan.length > 0 && (
        <>
          <SectionTitle icon={<Target size={13} color="#6B7FA3" />} label="Plan d'action" />
          <div style={styles.card}>
            {safe.action_plan.map((action, i) => (
              <div key={i} style={styles.actionItem}>
                <div style={styles.actionNum}>{i + 1}</div>
                <span style={styles.listText}>{action}</span>
                <ChevronRight size={13} color="#1E2D45" style={{ flexShrink: 0, marginLeft: "auto" }} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* LONG-TERM PROGRESS */}
      {hasLongTermProgress && (
        <>
          <SectionTitle icon={<Activity size={13} color="#6B7FA3" />} label="Progression long terme" />
          <div style={styles.progressCard}>
            {safe.recurring_pattern && (
              <ProgressInsight
                label="Pattern récurrent"
                text={safe.recurring_pattern}
                color="#F59E0B"
              />
            )}
            {safe.progress_note && (
              <ProgressInsight
                label="Note de progression"
                text={safe.progress_note}
                color="#8B5CF6"
              />
            )}
          </div>
        </>
      )}

      {/* REFLECTION QUESTIONS */}
      {safe.reflection_questions.length > 0 && (
        <>
          <SectionTitle icon={<BookOpen size={13} color="#6B7FA3" />} label="Questions de réflexion" note="Répondez pour débloquer l'import" />
          <div style={styles.card}>
            <p style={styles.reflectionIntro}>Ces questions sont conçues pour approfondir votre compréhension. Répondez honnêtement — minimum 10 caractères par réponse.</p>
            {safe.reflection_questions.map((q, i) => (
              <div key={i} style={styles.questionBlock}>
                <p style={styles.questionText}>{i + 1}. {q}</p>
                <textarea
                  style={{ ...styles.textarea, borderColor: (reflections[i] || "").trim().length > 10 ? "#10B98155" : "#1E2D45" }}
                  placeholder="Votre réflexion..."
                  value={reflections[i] || ""}
                  onChange={(e) => setReflections((prev) => ({ ...prev, [i]: e.target.value }))}
                  rows={3}
                />
                {(reflections[i] || "").trim().length > 10 && (
                  <div style={styles.answered}>
                    <CheckCircle size={11} color="#10B981" />
                    <span style={{ color: "#10B981", fontSize: "0.72rem" }}>Répondu</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ACKNOWLEDGE + IMPORT */}
      <div style={styles.ackSection}>
        {!allReflectionsAnswered && safe.reflection_questions.length > 0 && (
          <p style={styles.ackWarning}>Répondez à toutes les questions de réflexion pour continuer.</p>
        )}
        {!acknowledged ? (
          <button onClick={handleAcknowledge} disabled={!allReflectionsAnswered} style={{ ...styles.ackBtn, opacity: allReflectionsAnswered ? 1 : 0.4, cursor: allReflectionsAnswered ? "pointer" : "not-allowed" }}>
            <CheckCircle size={15} /> J'ai pris connaissance de cette analyse
          </button>
        ) : (
          <div style={styles.ackDone}>
            <CheckCircle size={13} color="#10B981" />
            <span style={{ color: "#10B981", fontSize: "0.82rem", fontWeight: "500" }}>Analyse reconnue — vous pouvez importer ce trade</span>
          </div>
        )}
        {importError && <p style={{ color: "#EF4444", fontSize: "0.82rem" }}>{importError}</p>}
        <button
          onClick={handleImport}
          disabled={!acknowledged || importing || importDone}
          style={{
            ...styles.importBtn,
            opacity: acknowledged && !importing && !importDone ? 1 : 0.4,
            cursor: acknowledged && !importing && !importDone ? "pointer" : "not-allowed",
            backgroundColor: importDone ? "#064E3B" : "#10B981",
          }}
        >
          {importDone
            ? <><CheckCircle size={14} /> Importé dans le Journal</>
            : importing
            ? <><Activity size={14} /> Import en cours...</>
            : <><BookOpen size={14} /> Ajouter au Journal</>
          }
        </button>

        {importDone && (
          <>
            <FeedbackWidget
              tradeId={savedTradeId}
              aiScore={safe.score.overall}
              pair={form.pair}
              plan={plan}
            />
            <button
              onClick={() => navigate("/")}
              style={styles.goToJournalBtn}
            >
              Voir mon journal →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, label, note }) {
  return (
    <div style={styles.sectionTitle}>
      {icon}
      <span>{label}</span>
      {note && <span style={styles.sectionNote}>{note}</span>}
    </div>
  );
}

function ScoreBar({ label, value, icon }) {
  const color = value >= 7 ? "#10B981" : value >= 4 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {icon}
      <span style={{ color: "#6B7FA3", fontSize: "0.72rem", width: "70px" }}>{label}</span>
      <div style={{ flex: 1, height: "3px", backgroundColor: "#1E2D45", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(value / 10) * 100}%`, backgroundColor: color, borderRadius: "999px" }} />
      </div>
      <span style={{ color, fontSize: "0.75rem", fontWeight: "600", width: "18px" }}>{value}</span>
    </div>
  );
}

function BreakdownCard({ icon, label, text, score }) {
  const color = score >= 7 ? "#10B981" : score >= 4 ? "#F59E0B" : "#EF4444";
  return (
    <div style={styles.breakdownCard}>
      <div style={styles.cardHeader}>
        <div style={styles.cardIconWrap}>{icon}</div>
        <h3 style={styles.cardTitle}>{label}</h3>
        <span style={{ marginLeft: "auto", color, fontWeight: "700", fontSize: "0.82rem" }}>{score}/10</span>
      </div>
      <p style={styles.breakdownText}>{text || "—"}</p>
    </div>
  );
}

function SummaryRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1E2D4533" }}>
      <span style={{ color: "#6B7FA3", fontSize: "0.72rem" }}>{label}</span>
      <span style={{ color: valueColor || "#E8EDF5", fontWeight: "600", fontSize: "0.75rem" }}>{value}</span>
    </div>
  );
}

function ProgressInsight({ label, text, color }) {
  return (
    <div style={styles.progressInsight}>
      <div style={{ ...styles.progressAccent, backgroundColor: color }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ ...styles.progressLabel, color }}>{label}</p>
        <p style={styles.progressText}>{text}</p>
      </div>
    </div>
  );
}

function cleanNullableText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || text.toLowerCase() === "null" || text === "—") return null;
  return text;
}

const styles = {
  page: { padding: "28px 32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  errorPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" },
  backBtn: { display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "1px solid #1E2D45", borderRadius: "7px", color: "#6B7FA3", fontSize: "0.78rem", padding: "6px 12px", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginBottom: "20px" },
  heroCard: { backgroundColor: "#0D1421", borderRadius: "12px", border: "1px solid #1E2D45", padding: "28px", marginBottom: "20px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "28px", alignItems: "start" },
  scoreBlock: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  scoreCircle: { width: "88px", height: "88px", borderRadius: "50%", border: "3px solid", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#070B14" },
  scoreValue: { display: "inline-flex", alignItems: "baseline", justifyContent: "center", gap: "3px", transform: "translateY(-1px)" },
  scoreNum: { fontSize: "2.1rem", fontWeight: "800", lineHeight: 1 },
  scoreDenom: { color: "#6B7FA3", fontSize: "0.85rem", fontWeight: "600" },
  scoreChip: { padding: "3px 10px", borderRadius: "999px", fontSize: "0.67rem", fontWeight: "700", letterSpacing: "0.05em" },
  heroContent: { display: "flex", flexDirection: "column", gap: "12px" },
  verdictText: { color: "#E8EDF5", fontSize: "0.95rem", fontWeight: "600", lineHeight: "1.5", margin: 0 },
  mainMistake: { display: "flex", alignItems: "flex-start", gap: "8px", backgroundColor: "#451A0315", border: "1px solid #F59E0B33", borderRadius: "7px", padding: "10px 12px" },
  mainMistakeText: { color: "#F59E0B", fontSize: "0.82rem", lineHeight: "1.5" },
  subscores: { display: "flex", flexDirection: "column", gap: "8px" },
  tradeSummary: { backgroundColor: "#070B14", borderRadius: "9px", padding: "14px", border: "1px solid #1E2D45", minWidth: "150px" },
  summaryTitle: { fontSize: "0.62rem", fontWeight: "700", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px 0" },
  sectionTitle: { display: "flex", alignItems: "center", gap: "7px", margin: "20px 0 10px", color: "#6B7FA3", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" },
  sectionNote: { marginLeft: "auto", color: "#3B4B6B", fontSize: "0.68rem", fontWeight: "400", textTransform: "none", letterSpacing: 0 },
  breakdownGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" },
  breakdownCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "16px" },
  breakdownText: { color: "#94A3B8", fontSize: "0.8rem", lineHeight: "1.6", margin: 0 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
  card: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "18px", marginBottom: "12px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  cardTitle: { fontSize: "0.82rem", fontWeight: "600", color: "#E8EDF5", margin: 0 },
  cardIconWrap: { width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#1E3A5F44", border: "1px solid #3B82F633", display: "flex", alignItems: "center", justifyContent: "center" },
  listItem: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "7px 0", borderBottom: "1px solid #1E2D4533" },
  listDot: { width: "20px", height: "20px", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" },
  listText: { color: "#94A3B8", fontSize: "0.82rem", lineHeight: "1.5" },
  actionItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #1E2D4533" },
  actionNum: { width: "20px", height: "20px", borderRadius: "5px", backgroundColor: "#1E3A5F", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: "700", flexShrink: 0 },
  progressCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "14px", marginBottom: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" },
  progressInsight: { display: "flex", alignItems: "stretch", gap: "12px", backgroundColor: "#070B14", border: "1px solid #1E2D45", borderRadius: "8px", padding: "13px 14px" },
  progressAccent: { width: "3px", minHeight: "44px", borderRadius: "999px", flexShrink: 0, opacity: 0.85 },
  progressLabel: { fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" },
  progressText: { color: "#94A3B8", fontSize: "0.82rem", lineHeight: "1.55", margin: 0 },
  reflectionIntro: { color: "#6B7FA3", fontSize: "0.78rem", lineHeight: "1.5", margin: "0 0 16px 0", padding: "10px 12px", backgroundColor: "#070B14", borderRadius: "6px", border: "1px solid #1E2D45" },
  questionBlock: { marginBottom: "16px" },
  questionText: { color: "#E8EDF5", fontSize: "0.85rem", fontWeight: "500", margin: "0 0 7px 0", lineHeight: "1.5" },
  textarea: { width: "100%", backgroundColor: "#121B2E", border: "1px solid", borderRadius: "7px", padding: "10px 12px", color: "#E8EDF5", fontSize: "0.85rem", outline: "none", fontFamily: "'Inter', sans-serif", resize: "vertical", boxSizing: "border-box", transition: "border-color 0.15s" },
  answered: { display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" },
  emptyText: { color: "#3B4B6B", fontSize: "0.8rem", fontStyle: "italic", margin: 0 },
  ackSection: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "28px 0 40px" },
  ackWarning: { color: "#F59E0B", fontSize: "0.78rem", margin: 0 },
  ackBtn: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 26px", backgroundColor: "#1E3A5F", border: "1px solid #3B82F655", borderRadius: "8px", color: "#3B82F6", fontWeight: "600", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif" },
  ackDone: { display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", backgroundColor: "#064E3B22", border: "1px solid #10B98133", borderRadius: "7px" },
  importBtn: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 30px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" },
  goToJournalBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", backgroundColor: "transparent", border: "1px solid #1E2D45", borderRadius: "8px", color: "#6B7FA3", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginTop: "4px" },
};
