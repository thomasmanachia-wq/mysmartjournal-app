import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import InstrumentIcon from "../components/InstrumentIcon.jsx";
import {
  ArrowLeft, TrendingUp, TrendingDown, Target,
  ShieldCheck, Brain, Zap, Calendar, BarChart2,
  Activity, AlertCircle
} from "lucide-react";

function normalizeResult(result) {
  return typeof result === "string" ? result.toUpperCase() : "PENDING";
}

function resolveTradeResult(trade) {
  const base = normalizeResult(trade.result);
  const entry = parseFloat(trade.entry);
  const stopLoss = parseFloat(trade.stop_loss);
  const tradeContext = trade.ai_analysis?.trade_context || {};
  const exit = parseFloat(trade.exit ?? trade.exit_price ?? tradeContext.exit_price);
  const rr = parseFloat(trade.rr);
  const isLong = trade.direction === "buy" || trade.direction === "long";

  if (base === "BREAKEVEN") return "BREAKEVEN";

  if (Number.isFinite(entry) && Number.isFinite(stopLoss) && Number.isFinite(exit)) {
    const stopLossTouched = isLong ? exit <= stopLoss : exit >= stopLoss;
    if (stopLossTouched) return "LOSS";

    const risk = Math.abs(entry - stopLoss);
    if (risk > 0) {
      const priceMove = isLong ? exit - entry : entry - exit;
      const realizedRR = priceMove / risk;
      if (realizedRR < 0) return "LOSS";
      if (realizedRR > 0) return "WIN";
    }
  }

  if (Number.isFinite(rr) && rr < 0) return "LOSS";
  if (base === "WIN" || base === "LOSS") return base;
  return "PENDING";
}

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrade() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non authentifié.");

        const { data, error } = await supabase
          .from("trades")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (error) throw error;
        setTrade(data);
      } catch {
        setError("Trade introuvable.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrade();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <Activity size={24} color="#3B82F6" />
        <p style={{ color: "#6B7FA3", margin: 0 }}>Chargement...</p>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div style={styles.centered}>
        <AlertCircle size={24} color="#EF4444" />
        <p style={{ color: "#EF4444", margin: 0 }}>{error || "Trade introuvable."}</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          <ArrowLeft size={14} /> Retour au Journal
        </button>
      </div>
    );
  }

  const normalizedResult = resolveTradeResult(trade);
  const isWin = normalizedResult === "WIN";
  const isLoss = normalizedResult === "LOSS";
  const isBreakeven = normalizedResult === "BREAKEVEN";
  const resultColor = isWin ? "#10B981" : isLoss ? "#EF4444" : "#6B7FA3";
  const resultBg = isWin ? "#064E3B" : isLoss ? "#450A0A" : "#1E2D45";
  const resultLabel = isWin ? "WIN" : isLoss ? "LOSS" : isBreakeven ? "BREAKEVEN" : "PENDING";
  const tradeContext = trade.ai_analysis?.trade_context || {};
  const analysisType = trade.analysis_type || tradeContext.analysis_type;

  const rr = Number.isFinite(parseFloat(trade.rr))
    ? Math.abs(parseFloat(trade.rr)).toFixed(2)
    : trade.entry && trade.stop_loss && trade.take_profit
      ? (Math.abs(parseFloat(trade.take_profit) - parseFloat(trade.entry)) /
         Math.abs(parseFloat(trade.entry) - parseFloat(trade.stop_loss))).toFixed(2)
      : "—";

  const rrColor = parseFloat(rr) >= 2 ? "#10B981" : parseFloat(rr) >= 1 ? "#F59E0B" : "#EF4444";

  const scoreColor = !trade.ai_score ? "#6B7FA3"
    : trade.ai_score >= 7 ? "#10B981"
    : trade.ai_score >= 4 ? "#F59E0B" : "#EF4444";

  const scoreLabel = !trade.ai_score ? "—"
    : trade.ai_score >= 9 ? "A+" : trade.ai_score >= 8 ? "A"
    : trade.ai_score >= 7 ? "B+" : trade.ai_score >= 6 ? "B"
    : trade.ai_score >= 5 ? "C" : "D";

  const emotionColor = {
    Confiant: "#10B981", Neutre: "#3B82F6",
    Anxieux: "#F59E0B", FOMO: "#EF4444", Revenge: "#8B5CF6",
  }[trade.emotion] || "#6B7FA3";

  return (
    <div style={styles.page}>

      {/* Bouton retour */}
      <button onClick={() => navigate("/")} style={styles.backBtn}>
        <ArrowLeft size={14} />
        Retour au Journal
      </button>

      {/* SECTION 1 — Header */}
      <div style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <InstrumentIcon symbol={trade.pair} size={42} />
          <div>
            <h1 style={styles.pairName}>{trade.pair?.toUpperCase()}</h1>
            <div style={styles.heroMeta}>
              <Calendar size={12} color="#6B7FA3" />
              <span style={styles.metaText}>{trade.date}</span>
              <span style={styles.metaDot}>·</span>
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "2px 10px", borderRadius: "6px",
                backgroundColor: trade.direction === "buy" || trade.direction === "long" ? "#064E3B" : "#450A0A",
              }}>
                {trade.direction === "buy" || trade.direction === "long"
                  ? <TrendingUp size={11} color="#10B981" />
                  : <TrendingDown size={11} color="#EF4444" />
                }
                <span style={{
                  fontSize: "0.72rem", fontWeight: "700",
                  color: trade.direction === "buy" || trade.direction === "long" ? "#10B981" : "#EF4444",
                }}>
                  {trade.direction === "buy" || trade.direction === "long" ? "LONG" : "SHORT"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.heroRight}>
          {/* Badge résultat */}
          <div style={{ ...styles.resultBadge, backgroundColor: resultBg, border: `1px solid ${resultColor}44` }}>
            <span style={{ color: resultColor, fontSize: "1.1rem", fontWeight: "800", letterSpacing: "0.05em" }}>
              {resultLabel}
            </span>
          </div>

          {/* Score IA */}
          {trade.ai_score && (
            <div style={styles.scoreBox}>
              <span style={styles.scoreLabel}>Score IA</span>
              <span style={{ color: scoreColor, fontSize: "1.4rem", fontWeight: "700" }}>
                {trade.ai_score}<span style={{ fontSize: "0.75rem", color: "#6B7FA3" }}>/10</span>
              </span>
              <span style={{ ...styles.scoreBadge, color: scoreColor, backgroundColor: scoreColor + "18", border: `1px solid ${scoreColor}33` }}>
                {scoreLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2 — Métriques */}
      <div style={styles.metricsGrid}>
        <MetricBox
          icon={<Zap size={14} color="#3B82F6" />}
          label="Prix d'Entrée"
          value={trade.entry}
          color="#E8EDF5"
        />
        <MetricBox
          icon={<ShieldCheck size={14} color="#EF4444" />}
          label="Stop Loss"
          value={trade.stop_loss}
          color="#EF4444"
          sub={trade.entry && trade.stop_loss
            ? `${Math.abs(parseFloat(trade.entry) - parseFloat(trade.stop_loss)).toFixed(5)} pips`
            : null}
          subColor="#EF4444"
        />
        <MetricBox
          icon={<Target size={14} color="#10B981" />}
          label="Take Profit"
          value={trade.take_profit}
          color="#10B981"
          sub={trade.entry && trade.take_profit
            ? `${Math.abs(parseFloat(trade.take_profit) - parseFloat(trade.entry)).toFixed(5)} pips`
            : null}
          subColor="#10B981"
        />
        <MetricBox
          icon={<BarChart2 size={14} color={rrColor} />}
          label="Risk / Reward"
          value={rr !== "—" ? `1 : ${rr}` : "—"}
          color={rrColor}
        />
        {trade.risk_percent && (
          <MetricBox
            icon={<AlertCircle size={14} color="#F59E0B" />}
            label="Risque (%)"
            value={`${trade.risk_percent}%`}
            color="#F59E0B"
          />
        )}
      </div>

      {/* SECTION 3 — Analyse IA & Psychologie */}
      <div style={styles.bottomGrid}>

        {/* Stratégie */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrap}>
              <Zap size={13} color="#3B82F6" />
            </div>
            <h2 style={styles.cardTitle}>Stratégie & Setup</h2>
          </div>

          {trade.setup && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Setup</span>
              <span style={{ ...styles.infoBadge, backgroundColor: "#1E3A5F", color: "#3B82F6" }}>
                {trade.setup}
              </span>
            </div>
          )}

          {trade.timeframe && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Timeframe</span>
              <span style={styles.infoValue}>{trade.timeframe}</span>
            </div>
          )}

          {trade.size && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Taille (Lots)</span>
              <span style={styles.infoValue}>{trade.size}</span>
            </div>
          )}

          {(analysisType || trade.notes) && (
            <div style={styles.notesBox}>
              {analysisType && (
                <>
                  <p style={styles.notesLabel}>Type d'Analyse</p>
                  <p style={styles.notesText}>{analysisType}</p>
                </>
              )}
              {trade.notes && (
                <>
                  <p style={{ ...styles.notesLabel, marginTop: analysisType ? "12px" : 0 }}>Notes</p>
                  <p style={styles.notesText}>{trade.notes}</p>
                </>
              )}
            </div>
          )}

          {!trade.setup && !trade.timeframe && !analysisType && !trade.notes && (
            <p style={styles.emptySection}>Aucune donnée de stratégie renseignée.</p>
          )}
        </div>

        {/* Psychologie */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrap}>
              <Brain size={13} color="#3B82F6" />
            </div>
            <h2 style={styles.cardTitle}>Psychologie & Mental</h2>
          </div>

          {trade.emotion ? (
            <>
              <p style={styles.infoLabel}>Émotion Pré-Trade</p>
              <div style={{
                ...styles.emotionBadge,
                backgroundColor: emotionColor + "15",
                border: `1px solid ${emotionColor}44`,
                color: emotionColor,
              }}>
                {trade.emotion}
              </div>

              <div style={styles.emotionDesc}>
                <p style={styles.notesText}>
                  {trade.emotion === "Confiant" && "État mental optimal — confiance rationnelle basée sur l'analyse."}
                  {trade.emotion === "Neutre" && "État neutre — absence de biais émotionnel fort."}
                  {trade.emotion === "Anxieux" && "Présence d'anxiété — vigilance accrue recommandée."}
                  {trade.emotion === "FOMO" && "Fear Of Missing Out détecté — risque de sur-trading."}
                  {trade.emotion === "Revenge" && "Trading de revanche — risque élevé de décision impulsive."}
                </p>
              </div>
            </>
          ) : (
            <p style={styles.emptySection}>Aucune émotion renseignée pour ce trade.</p>
          )}

          {/* Score IA détail */}
          {trade.ai_score && (
            <div style={styles.scoreDetail}>
              <div style={styles.scoreBar}>
                <span style={styles.infoLabel}>Score IA global</span>
                <span style={{ color: scoreColor, fontWeight: "700" }}>{trade.ai_score}/10</span>
              </div>
              <div style={styles.scoreTrack}>
                <div style={{
                  height: "100%", borderRadius: "999px",
                  width: `${(trade.ai_score / 10) * 100}%`,
                  backgroundColor: scoreColor,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton analyser à nouveau */}
      <div style={styles.ctaRow}>
        <button onClick={() => navigate("/analyse")} style={styles.reanalyzeBtn}>
          <Activity size={14} />
          Analyser un nouveau trade
        </button>
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, color, sub, subColor }) {
  return (
    <div style={styles.metricBox}>
      <div style={styles.metricHeader}>
        <div style={styles.metricIconWrap}>{icon}</div>
        <span style={styles.metricLabel}>{label}</span>
      </div>
      <p style={{ ...styles.metricValue, color }}>{value}</p>
      {sub && <p style={{ ...styles.metricSub, color: subColor }}>{sub}</p>}
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", maxWidth: "960px", margin: "0 auto" },
  centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" },

  backBtn: { display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "1px solid #1E2D45", borderRadius: "8px", color: "#6B7FA3", fontSize: "0.82rem", padding: "7px 14px", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginBottom: "24px", transition: "all 0.15s" },

  heroCard: { backgroundColor: "#0D1421", borderRadius: "12px", border: "1px solid #1E2D45", padding: "24px 28px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" },
  heroLeft: { display: "flex", alignItems: "center", gap: "16px" },
  pairName: { fontSize: "1.6rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 6px 0", letterSpacing: "-0.02em" },
  heroMeta: { display: "flex", alignItems: "center", gap: "8px" },
  metaText: { color: "#6B7FA3", fontSize: "0.82rem" },
  metaDot: { color: "#1E2D45" },
  heroRight: { display: "flex", alignItems: "center", gap: "16px" },
  resultBadge: { padding: "10px 20px", borderRadius: "10px", display: "flex", alignItems: "center" },
  scoreBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 16px", backgroundColor: "#070B14", borderRadius: "10px", border: "1px solid #1E2D45" },
  scoreLabel: { fontSize: "0.65rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.08em" },
  scoreBadge: { padding: "2px 8px", borderRadius: "5px", fontSize: "0.72rem", fontWeight: "700" },

  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "16px" },
  metricBox: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "16px" },
  metricHeader: { display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" },
  metricIconWrap: { width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#121B2E", border: "1px solid #1E2D45", display: "flex", alignItems: "center", justifyContent: "center" },
  metricLabel: { fontSize: "0.67rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.07em" },
  metricValue: { fontSize: "1.1rem", fontWeight: "700", margin: 0 },
  metricSub: { fontSize: "0.72rem", margin: "4px 0 0 0", fontWeight: "500" },

  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" },
  card: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "20px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  cardIconWrap: { width: "26px", height: "26px", borderRadius: "7px", backgroundColor: "#1E3A5F44", border: "1px solid #3B82F633", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: "0.875rem", fontWeight: "600", color: "#E8EDF5", margin: 0 },

  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #1E2D4533" },
  infoLabel: { fontSize: "0.72rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.06em" },
  infoValue: { color: "#E8EDF5", fontWeight: "500", fontSize: "0.875rem" },
  infoBadge: { padding: "3px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "600" },

  notesBox: { marginTop: "14px" },
  notesLabel: { fontSize: "0.67rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px 0" },
  notesText: { color: "#94A3B8", fontSize: "0.875rem", lineHeight: "1.6", margin: 0 },

  emptySection: { color: "#3B4B6B", fontSize: "0.82rem", fontStyle: "italic", margin: "8px 0" },

  emotionBadge: { display: "inline-block", padding: "6px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem", marginTop: "8px", marginBottom: "12px" },
  emotionDesc: { backgroundColor: "#070B14", borderRadius: "8px", padding: "12px", border: "1px solid #1E2D45" },

  scoreDetail: { marginTop: "16px" },
  scoreBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  scoreTrack: { height: "4px", backgroundColor: "#1E2D45", borderRadius: "999px", overflow: "hidden" },

  ctaRow: { textAlign: "center" },
  reanalyzeBtn: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "8px", color: "#6B7FA3", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif" },

};
