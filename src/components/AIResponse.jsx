export default function AIResponse({ data, loading, error }) {
    if (loading) {
      return (
        <div style={styles.wrapper}>
          <div style={styles.loading}>
            <span>⏳</span>
            <p style={{ color: "#94a3b8", margin: 0 }}>Analyse IA en cours...</p>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div style={{ ...styles.wrapper, borderColor: "#f87171" }}>
          <p style={{ color: "#f87171", margin: 0 }}>❌ {error}</p>
        </div>
      );
    }
  
    if (!data) return null;
  
    const scoreColor =
      data.trade_score >= 7 ? "#4ade80" :
      data.trade_score >= 4 ? "#facc15" : "#f87171";
  
    return (
      <div style={styles.wrapper}>
        <h2 style={styles.title}>🤖 Analyse IA</h2>
  
        <div style={styles.scoreRow}>
          <span style={styles.scoreLabel}>Score du trade</span>
          <span style={{ ...styles.score, color: scoreColor }}>
            {data.trade_score} / 10
          </span>
        </div>
  
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Risk Management</h3>
          <p style={styles.text}>{data.risk_management}</p>
        </div>
  
        {data.mistakes?.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>⚠️ Erreurs identifiées</h3>
            <ul style={styles.list}>
              {data.mistakes.map((m, i) => (
                <li key={i} style={styles.listItem}>• {m}</li>
              ))}
            </ul>
          </div>
        )}
  
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🧠 Psychologie</h3>
          <p style={styles.text}>{data.psychology}</p>
        </div>
  
        <div style={{ ...styles.section, borderBottom: "none" }}>
          <h3 style={styles.sectionTitle}>💡 Suggestion</h3>
          <p style={styles.text}>{data.suggestions}</p>
        </div>
      </div>
    );
  }
  
  const styles = {
    wrapper: { backgroundColor: "#1e293b", borderRadius: "12px", padding: "24px", border: "1px solid #334155", marginTop: "24px" },
    loading: { display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", padding: "20px" },
    title: { fontSize: "1.1rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "20px" },
    scoreRow: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0f172a", borderRadius: "8px", padding: "16px 20px", marginBottom: "20px" },
    scoreLabel: { color: "#94a3b8", fontSize: "0.9rem", fontWeight: "500" },
    score: { fontSize: "1.8rem", fontWeight: "700" },
    section: { paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #1e293b" },
    sectionTitle: { color: "#6366f1", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" },
    text: { color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 },
    list: { listStyle: "none", padding: 0, margin: 0 },
    listItem: { color: "#f87171", fontSize: "0.9rem", lineHeight: "1.8" },
  };