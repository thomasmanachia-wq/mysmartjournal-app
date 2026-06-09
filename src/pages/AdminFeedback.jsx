import { useState, useEffect } from "react";
import { apiFetch } from "../lib/supabase.js";
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Filter, Mail, Send } from "lucide-react";

const EMAIL_TEST_OPTIONS = [
  { value: "welcome", label: "Welcome" },
  { value: "premium_activated", label: "Premium Activated" },
  { value: "first_analysis_completed", label: "First Analysis Completed" },
  { value: "onboarding_day1", label: "J+1 Onboarding" },
  { value: "payment_failed", label: "Payment Failed" },
  { value: "onboarding_day7", label: "J+7 Onboarding" },
  { value: "onboarding_day3", label: "J+3 Onboarding" },
  { value: "onboarding_day5", label: "J+5 Onboarding" },
  { value: "retention_inactive", label: "Réactivation inactive" },
  { value: "retention_no_analysis", label: "Réactivation sans analyse" },
];

export default function AdminFeedback() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ plan: "", from: "", to: "" });
  const [emailTest, setEmailTest] = useState({ emailType: "welcome", to: "" });
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => { loadFeedback(); }, []);

  async function loadFeedback() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.plan) params.set("plan", filters.plan);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);

      const result = await apiFetch(`/admin/feedback?${params}`);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function sendEmailTest() {
    setEmailSending(true);
    setEmailStatus(null);

    try {
      const payload = { emailType: emailTest.emailType };
      if (emailTest.to.trim()) payload.to = emailTest.to.trim();

      const result = await apiFetch("/admin/test-email", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setEmailStatus({
        type: "success",
        message: `Email test envoyé à ${result.to}.`,
      });
    } catch (err) {
      setEmailStatus({
        type: "error",
        message: err.message || "Impossible d'envoyer l'email test.",
      });
    } finally {
      setEmailSending(false);
    }
  }

  if (loading) return <div style={styles.centered}><p style={{ color: "#6B7FA3" }}>Chargement...</p></div>;

  const { stats, feedbacks } = data || {};

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI Feedback Dashboard</h1>
        <p style={styles.subtitle}>Retours utilisateurs sur les analyses IA</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatCard icon={<MessageSquare size={16} color="#3B82F6" />} label="Total Feedbacks" value={stats?.total || 0} color="#3B82F6" />
        <StatCard icon={<TrendingUp size={16} color="#10B981" />} label="Satisfaction Rate" value={`${stats?.satisfaction_rate || 0}%`} color={parseFloat(stats?.satisfaction_rate) >= 70 ? "#10B981" : "#F59E0B"} />
        <StatCard icon={<ThumbsUp size={16} color="#10B981" />} label="Positifs" value={stats?.positive || 0} color="#10B981" />
        <StatCard icon={<ThumbsDown size={16} color="#EF4444" />} label="Négatifs" value={stats?.negative || 0} color="#EF4444" />
      </div>

      {/* Filtres */}
      <div style={styles.filtersBar}>
        <Filter size={14} color="#6B7FA3" />
        <select style={styles.select} value={filters.plan} onChange={(e) => setFilters((p) => ({ ...p, plan: e.target.value }))}>
          <option value="">Tous les plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        <input style={styles.dateInput} type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} placeholder="Depuis" />
        <input style={styles.dateInput} type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} placeholder="Jusqu'à" />
        <button onClick={loadFeedback} style={styles.filterBtn}>Filtrer</button>
      </div>

      <div style={styles.emailTestCard}>
        <div style={styles.emailTestHeader}>
          <div style={styles.emailTestTitleWrap}>
            <Mail size={16} color="#3B82F6" />
            <div>
              <h2 style={styles.sectionTitle}>Test email</h2>
              <p style={styles.emailTestSubtitle}>Envoyer un template réel vers votre boîte admin ou une adresse de test.</p>
            </div>
          </div>
          {emailStatus && (
            <span style={{
              ...styles.emailStatus,
              color: emailStatus.type === "success" ? "#10B981" : "#EF4444",
              borderColor: emailStatus.type === "success" ? "#064E3B" : "#450A0A",
              backgroundColor: emailStatus.type === "success" ? "#052E24" : "#2A0D0D",
            }}>
              {emailStatus.message}
            </span>
          )}
        </div>
        <div style={styles.emailTestGrid}>
          <select
            style={styles.emailSelect}
            value={emailTest.emailType}
            onChange={(e) => setEmailTest((current) => ({ ...current, emailType: e.target.value }))}
          >
            {EMAIL_TEST_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            style={styles.emailInput}
            type="email"
            value={emailTest.to}
            onChange={(e) => setEmailTest((current) => ({ ...current, to: e.target.value }))}
            placeholder="Adresse optionnelle, sinon email admin"
          />
          <button onClick={sendEmailTest} disabled={emailSending} style={{
            ...styles.emailSendBtn,
            opacity: emailSending ? 0.65 : 1,
            cursor: emailSending ? "not-allowed" : "pointer",
          }}>
            <Send size={14} />
            {emailSending ? "Envoi..." : "Envoyer un test"}
          </button>
        </div>
      </div>

      {/* Liste feedbacks */}
      <div style={styles.feedbackList}>
        <h2 style={styles.sectionTitle}>Commentaires récents</h2>
        {feedbacks?.length === 0 && (
          <p style={{ color: "#3B4B6B", fontSize: "0.85rem" }}>Aucun feedback pour l'instant.</p>
        )}
        {feedbacks?.map((fb) => (
          <div key={fb.id} style={styles.feedbackCard}>
            <div style={styles.feedbackHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  ...styles.ratingBadge,
                  backgroundColor: fb.rating === "positive" ? "#064E3B" : "#450A0A",
                  color: fb.rating === "positive" ? "#10B981" : "#EF4444",
                }}>
                  {fb.rating === "positive" ? "👍 Positif" : "👎 Négatif"}
                </span>
                {fb.pair && <span style={styles.pairTag}>{fb.pair}</span>}
                {fb.ai_score && <span style={styles.scoreTag}>Score: {fb.ai_score}/10</span>}
                {fb.plan && <span style={styles.planTag}>{fb.plan.toUpperCase()}</span>}
              </div>
              <span style={styles.date}>{new Date(fb.created_at).toLocaleDateString("fr-FR")}</span>
            </div>

            {fb.what_was_useful && (
              <div style={styles.commentBlock}>
                <span style={styles.commentLabel}>Ce qui était utile</span>
                <p style={styles.commentText}>{fb.what_was_useful}</p>
              </div>
            )}
            {fb.what_was_missing && (
              <div style={styles.commentBlock}>
                <span style={styles.commentLabel}>Ce qui manquait</span>
                <p style={styles.commentText}>{fb.what_was_missing}</p>
              </div>
            )}
            {fb.suggestions && (
              <div style={styles.commentBlock}>
                <span style={styles.commentLabel}>Suggestions</span>
                <p style={styles.commentText}>{fb.suggestions}</p>
              </div>
            )}
            {!fb.what_was_useful && !fb.what_was_missing && !fb.suggestions && (
              <p style={{ color: "#3B4B6B", fontSize: "0.78rem", margin: "8px 0 0 0", fontStyle: "italic" }}>Aucun commentaire</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statHeader}>{icon}<span style={styles.statLabel}>{label}</span></div>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  centered: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" },
  header: { marginBottom: "24px" },
  title: { fontSize: "1.4rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 6px 0" },
  subtitle: { color: "#6B7FA3", fontSize: "0.875rem", margin: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" },
  statCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "18px" },
  statHeader: { display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" },
  statLabel: { fontSize: "0.68rem", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.07em" },
  statValue: { fontSize: "1.6rem", fontWeight: "700", margin: 0 },
  filtersBar: { display: "flex", alignItems: "center", gap: "10px", padding: "14px", backgroundColor: "#0D1421", borderRadius: "9px", border: "1px solid #1E2D45", marginBottom: "20px", flexWrap: "wrap" },
  select: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "7px", padding: "7px 10px", color: "#E8EDF5", fontSize: "0.82rem", outline: "none", fontFamily: "'Inter', sans-serif" },
  dateInput: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "7px", padding: "7px 10px", color: "#E8EDF5", fontSize: "0.82rem", outline: "none", fontFamily: "'Inter', sans-serif" },
  filterBtn: { padding: "7px 16px", backgroundColor: "#3B82F6", border: "none", borderRadius: "7px", color: "#fff", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  emailTestCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "18px", marginBottom: "20px" },
  emailTestHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px", flexWrap: "wrap" },
  emailTestTitleWrap: { display: "flex", alignItems: "flex-start", gap: "10px" },
  emailTestSubtitle: { color: "#6B7FA3", fontSize: "0.78rem", lineHeight: "1.45", margin: "4px 0 0 0" },
  emailStatus: { border: "1px solid", borderRadius: "999px", padding: "6px 10px", fontSize: "0.74rem", fontWeight: "600" },
  emailTestGrid: { display: "grid", gridTemplateColumns: "minmax(180px, 0.9fr) minmax(220px, 1.3fr) auto", gap: "10px", alignItems: "center" },
  emailSelect: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "8px", padding: "10px 12px", color: "#E8EDF5", fontSize: "0.82rem", outline: "none", fontFamily: "'Inter', sans-serif", minWidth: 0 },
  emailInput: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "8px", padding: "10px 12px", color: "#E8EDF5", fontSize: "0.82rem", outline: "none", fontFamily: "'Inter', sans-serif", minWidth: 0 },
  emailSendBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px 14px", backgroundColor: "#3B82F6", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.82rem", fontWeight: "700", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" },
  sectionTitle: { fontSize: "0.875rem", fontWeight: "600", color: "#E8EDF5", margin: "0 0 14px 0" },
  feedbackList: { display: "flex", flexDirection: "column", gap: "12px" },
  feedbackCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "18px" },
  feedbackHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" },
  ratingBadge: { padding: "3px 10px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: "600" },
  pairTag: { padding: "2px 8px", backgroundColor: "#1E3A5F", color: "#3B82F6", borderRadius: "5px", fontSize: "0.72rem", fontWeight: "600" },
  scoreTag: { padding: "2px 8px", backgroundColor: "#121B2E", color: "#6B7FA3", borderRadius: "5px", fontSize: "0.72rem" },
  planTag: { padding: "2px 8px", backgroundColor: "#121B2E", color: "#F59E0B", borderRadius: "5px", fontSize: "0.68rem", fontWeight: "600" },
  date: { color: "#3B4B6B", fontSize: "0.72rem" },
  commentBlock: { marginTop: "10px" },
  commentLabel: { fontSize: "0.67rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.06em" },
  commentText: { color: "#94A3B8", fontSize: "0.82rem", lineHeight: "1.5", margin: "4px 0 0 0" },
};
