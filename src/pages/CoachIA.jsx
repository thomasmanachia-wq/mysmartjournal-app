import { useState, useEffect } from "react";
import { apiFetch } from "../lib/supabase.js";
import { analytics } from "../lib/analytics.js";
import {
  Brain, TrendingUp, TrendingDown, Target, Zap,
  AlertTriangle, CheckCircle, Activity, BarChart2, Shield
} from "lucide-react";

export default function CoachIA() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    analytics.dashboardViewed?.();
  }, []);

  async function loadProfile() {
    try {
      const result = await apiFetch("/api/profile");
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.centered}>
        <Brain size={24} color="#3B82F6" />
        <p style={{ color: "#6B7FA3" }}>Loading AI trading profile...</p>
      </div>
    );
  }

  const { profile, patterns } = data || {};

  if (!profile || profile.total_trades_analyzed === 0) {
    return (
      <div style={styles.empty}>
        <Brain size={40} color="#1E2D45" />
        <h2 style={styles.emptyTitle}>AI Profile in Progress</h2>
        <p style={styles.emptySub}>
          Log and audit at least 3 trades to unlock your personalized trading profile.
        </p>
      </div>
    );
  }

  // Calcul pattern fréquences
  const allPatterns = patterns?.flatMap(p => p.patterns || []) || [];
  const patternCounts = allPatterns.reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc; }, {});
  const topPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Évolution hebdo
  const weekly = profile.weekly_scores || [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Performance Coach</h1>
          <p style={styles.subtitle}>Your trading profile based on {profile.total_trades_analyzed} audits</p>
        </div>
        <div style={styles.avgScore}>
          <span style={{ fontSize: "2rem", fontWeight: "800", color: profile.avg_ai_score >= 7 ? "#10B981" : profile.avg_ai_score >= 4 ? "#F59E0B" : "#EF4444" }}>
            {profile.avg_ai_score?.toFixed(1)}
          </span>
          <span style={{ color: "#6B7FA3", fontSize: "0.8rem" }}>avg score</span>
        </div>
      </div>

      {/* Scores */}
      <div style={styles.scoresGrid}>
        <ScoreCard label="Discipline" value={profile.discipline_score} icon={<Shield size={15} color="#3B82F6" />} />
        <ScoreCard label="Psychology" value={profile.psychology_score} icon={<Brain size={15} color="#8B5CF6" />} />
        <ScoreCard label="Execution" value={profile.execution_score} icon={<Zap size={15} color="#F59E0B" />} />
        {/* Consistance : affichée uniquement si le backend a calculé une valeur (non null) */}
        {profile.consistency_score != null
          ? <ScoreCard label="Consistency" value={profile.consistency_score} icon={<Activity size={15} color="#10B981" />} />
          : <ScoreCardPending label="Consistency" icon={<Activity size={15} color="#3B4B6B" />} />
        }
      </div>


      {/* Insights personnalisés */}
      <div style={styles.insightsGrid}>
        {profile.main_strength && (
          <div style={{ ...styles.insightCard, borderColor: "#10B98133" }}>
            <div style={styles.insightHeader}>
              <CheckCircle size={14} color="#10B981" />
              <span style={{ color: "#10B981", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" }}>Primary Strength</span>
            </div>
            <p style={styles.insightText}>{profile.main_strength}</p>
          </div>
        )}
        {profile.main_weakness && (
          <div style={{ ...styles.insightCard, borderColor: "#EF444433" }}>
            <div style={styles.insightHeader}>
              <AlertTriangle size={14} color="#EF4444" />
              <span style={{ color: "#EF4444", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" }}>Primary Leak</span>
            </div>
            <p style={styles.insightText}>{profile.main_weakness}</p>
          </div>
        )}
        {profile.top_priority && (
          <div style={{ ...styles.insightCard, borderColor: "#3B82F633", gridColumn: "1 / -1" }}>
            <div style={styles.insightHeader}>
              <Target size={14} color="#3B82F6" />
              <span style={{ color: "#3B82F6", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" }}>Action Priority</span>
            </div>
            <p style={styles.insightText}>{profile.top_priority}</p>
          </div>
        )}
      </div>

      {/* Patterns comportementaux */}
      {topPatterns.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <AlertTriangle size={14} color="#F59E0B" /> Detected Behavioral Patterns
          </h2>
          <div style={styles.patternsGrid}>
            {topPatterns.map(([pattern, count]) => (
              <PatternCard key={pattern} pattern={pattern} count={count} total={profile.total_trades_analyzed} />
            ))}
          </div>
        </div>
      )}

      {/* Évolution hebdomadaire */}
      {weekly.length > 1 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <BarChart2 size={14} color="#6B7FA3" /> AI Score Trajectory
          </h2>
          <div style={styles.weeklyChart}>
            {weekly.slice(-8).map((w, i) => {
              const height = Math.max(8, (w.avg_score / 10) * 80);
              const color = w.avg_score >= 7 ? "#10B981" : w.avg_score >= 4 ? "#F59E0B" : "#EF4444";
              return (
                <div key={i} style={styles.barWrap}>
                  <span style={{ color: "#6B7FA3", fontSize: "0.65rem" }}>{w.avg_score?.toFixed(1)}</span>
                  <div style={{ ...styles.bar, height: `${height}px`, backgroundColor: color }} />
                  <span style={{ color: "#3B4B6B", fontSize: "0.6rem" }}>{w.week?.split("-W")[1] ? `W${w.week.split("-W")[1]}` : ""}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compteurs comportements */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Activity size={14} color="#6B7FA3" /> Behavioral Metrics
        </h2>
        <div style={styles.statsGrid}>
          <StatRow label="FOMO Detected" value={profile.fomo_count || 0} warn={profile.fomo_count > 3} />
          <StatRow label="Revenge Trading" value={profile.revenge_trading_count || 0} warn={profile.revenge_trading_count > 2} />
          <StatRow label="Late Entries" value={profile.late_entry_count || 0} warn={profile.late_entry_count > 3} />
          <StatRow label="Improper Stop Management" value={profile.bad_stop_count || 0} warn={profile.bad_stop_count > 2} />
          <StatRow label="Dominant Emotion" value={profile.dominant_emotion || "—"} />
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────

function ScoreCard({ label, value, icon }) {
  const v = value || 0;
  const color = v >= 7 ? "#10B981" : v >= 4 ? "#F59E0B" : "#EF4444";
  const pct = (v / 10) * 100;
  return (
    <div style={styles.scoreCard}>
      <div style={styles.scoreCardHeader}>{icon}<span style={styles.scoreCardLabel}>{label}</span></div>
      <span style={{ fontSize: "1.6rem", fontWeight: "700", color }}>{v.toFixed(1)}</span>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ScoreCardPending({ label, icon }) {
  return (
    <div style={styles.scoreCard}>
      <div style={styles.scoreCardHeader}>{icon}<span style={styles.scoreCardLabel}>{label}</span></div>
      <span style={{ fontSize: "1.6rem", fontWeight: "700", color: "#3B4B6B" }}>—</span>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: "0%", backgroundColor: "#1E2D45" }} />
      </div>
      <span style={{ fontSize: "0.65rem", color: "#3B4B6B", marginTop: "-4px" }}>Insufficient data</span>
    </div>
  );
}

const PATTERN_LABELS = {
  fomo: { label: "FOMO", desc: "Emotional entries driven by fear of missing out", color: "#EF4444" },
  revenge_trading: { label: "Revenge Trading", desc: "Impulsive entries after taking a loss", color: "#EF4444" },
  late_entry: { label: "Late Entry", desc: "Chasing price after ideal trigger", color: "#F59E0B" },
  anxiety: { label: "Anxiety", desc: "Negative or fearful pre-trade mindset", color: "#F59E0B" },
  impatience: { label: "Impatience", desc: "Rushing setup before full confirmation", color: "#F59E0B" },
  bad_stop: { label: "Poor Stop Placement", desc: "Stop loss placed too tight or invalidly", color: "#6366F1" },
};

function PatternCard({ pattern, count, total }) {
  const info = PATTERN_LABELS[pattern] || { label: pattern, desc: "", color: "#6B7FA3" };
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ ...styles.patternCard, borderColor: info.color + "33" }}>
      <div style={styles.patternHeader}>
        <span style={{ ...styles.patternBadge, backgroundColor: info.color + "18", color: info.color }}>{info.label}</span>
        <span style={{ color: info.color, fontWeight: "700", fontSize: "0.9rem" }}>{count}×</span>
      </div>
      <p style={styles.patternDesc}>{info.desc}</p>
      <div style={{ ...styles.progressTrack, marginTop: "8px" }}>
        <div style={{ ...styles.progressFill, width: `${Math.min(pct, 100)}%`, backgroundColor: info.color }} />
      </div>
      <span style={{ color: "#3B4B6B", fontSize: "0.68rem" }}>{pct}% of trades</span>
    </div>
  );
}

function StatRow({ label, value, warn }) {
  return (
    <div style={styles.statRow}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, color: warn ? "#EF4444" : "#E8EDF5" }}>
        {warn && <AlertTriangle size={11} style={{ marginRight: "4px" }} />}
        {value}
      </span>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  centered: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px", textAlign: "center" },
  emptyTitle: { color: "#E8EDF5", fontSize: "1.2rem", fontWeight: "600", margin: 0 },
  emptySub: { color: "#6B7FA3", fontSize: "0.875rem", maxWidth: "340px", margin: 0 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title: { fontSize: "1.4rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 4px 0" },
  subtitle: { color: "#6B7FA3", fontSize: "0.875rem", margin: 0 },
  avgScore: { display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#0D1421", border: "1px solid #1E2D45", borderRadius: "10px", padding: "14px 20px" },
  scoresGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" },
  scoreCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" },
  scoreCardHeader: { display: "flex", alignItems: "center", gap: "6px" },
  scoreCardLabel: { fontSize: "0.72rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.06em" },
  insightsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" },
  insightCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid", padding: "16px" },
  insightHeader: { display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" },
  insightText: { color: "#E8EDF5", fontSize: "0.875rem", lineHeight: "1.5", margin: 0 },
  section: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "18px", marginBottom: "14px" },
  sectionTitle: { display: "flex", alignItems: "center", gap: "7px", fontSize: "0.75rem", fontWeight: "700", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px 0" },
  patternsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
  patternCard: { backgroundColor: "#070B14", borderRadius: "8px", border: "1px solid", padding: "14px" },
  patternHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  patternBadge: { padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "600" },
  patternDesc: { color: "#6B7FA3", fontSize: "0.75rem", margin: "0 0 6px 0" },
  progressTrack: { height: "3px", backgroundColor: "#1E2D45", borderRadius: "999px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "999px", transition: "width 0.4s ease" },
  weeklyChart: { display: "flex", alignItems: "flex-end", gap: "10px", height: "110px" },
  barWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 },
  bar: { width: "100%", borderRadius: "4px 4px 0 0", minHeight: "8px" },
  statsGrid: { display: "flex", flexDirection: "column", gap: "0" },
  statRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1E2D4533" },
  statLabel: { color: "#6B7FA3", fontSize: "0.82rem" },
  statValue: { fontWeight: "600", fontSize: "0.82rem", display: "flex", alignItems: "center" },
};
