import { useState } from "react";

export default function RRCalculator({ onAnalyze }) {
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [pair, setPair] = useState("");
  const [direction, setDirection] = useState("buy");
  const [notes, setNotes] = useState("");

  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const t = parseFloat(tp);

  const isValid = e && s && t;
  const risk = isValid ? Math.abs(e - s) : null;
  const reward = isValid ? Math.abs(t - e) : null;
  const rr = risk > 0 ? (reward / risk).toFixed(2) : null;

  const rrColor =
    !rr ? "#64748b" :
    rr >= 2 ? "#4ade80" :
    rr >= 1 ? "#facc15" : "#f87171";

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Analyse de Trade</h2>
      <p style={styles.subtitle}>Calcul R:R instantané + feedback IA</p>

      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Paire</label>
          <input style={styles.input} placeholder="EURUSD" value={pair} onChange={(e) => setPair(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Direction</label>
          <select style={styles.input} value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Entry Price</label>
          <input style={styles.input} type="number" step="any" placeholder="1.08500" value={entry} onChange={(e) => setEntry(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Stop Loss</label>
          <input style={styles.input} type="number" step="any" placeholder="1.08200" value={sl} onChange={(e) => setSl(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Take Profit</label>
          <input style={styles.input} type="number" step="any" placeholder="1.09100" value={tp} onChange={(e) => setTp(e.target.value)} />
        </div>
      </div>

      <div style={styles.results}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Risque (pips)</span>
          <span style={styles.cardValue}>{risk ? risk.toFixed(5) : "—"}</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Reward (pips)</span>
          <span style={styles.cardValue}>{reward ? reward.toFixed(5) : "—"}</span>
        </div>
        <div style={{ ...styles.card, border: `1px solid ${rrColor}44` }}>
          <span style={styles.cardLabel}>R:R Ratio</span>
          <span style={{ ...styles.cardValue, fontSize: "2rem", color: rrColor }}>
            {rr ? `${rr}R` : "—"}
          </span>
        </div>
      </div>

      <div style={{ ...styles.field, marginBottom: "20px" }}>
        <label style={styles.label}>Notes</label>
        <textarea
          style={{ ...styles.input, height: "80px", resize: "vertical" }}
          placeholder="Setup, contexte, raison d'entrée..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        onClick={() => onAnalyze({ pair, direction, entry, stopLoss: sl, takeProfit: tp, riskPercent: "", result: "", notes })}
        disabled={!isValid || !pair}
        style={{
          ...styles.button,
          opacity: (!isValid || !pair) ? 0.5 : 1,
          cursor: (!isValid || !pair) ? "not-allowed" : "pointer",
        }}
      >
        🤖 Lancer l'Analyse IA
      </button>
    </div>
  );
}

const styles = {
  wrapper: { backgroundColor: "#1e293b", borderRadius: "12px", padding: "28px", border: "1px solid #334155" },
  title: { fontSize: "1.2rem", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" },
  subtitle: { fontSize: "0.875rem", color: "#64748b", marginBottom: "24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.72rem", fontWeight: "500", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "10px 12px", color: "#e2e8f0", fontSize: "0.9rem", outline: "none", width: "100%", boxSizing: "border-box" },
  results: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" },
  card: { backgroundColor: "#0f172a", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #1e293b" },
  cardLabel: { fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "500" },
  cardValue: { fontSize: "1.25rem", fontWeight: "700", color: "#e2e8f0" },
  button: { padding: "14px 28px", backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "1rem", width: "100%" },
};