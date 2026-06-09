import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTrades } from "../lib/tradesService.js";
import InstrumentIcon from "../components/InstrumentIcon.jsx";

const FILTERS = ["Tous", "Gagnants", "Perdants", "Ce mois"];

function getSignedR(trade) {
  const result = (trade.result || "").toLowerCase();
  const rr = Math.abs(parseFloat(trade.rr) || 0);
  if (result === "win") return rr;
  if (result === "loss") return -rr;
  if (result === "breakeven") return 0;
  return null;
}

function getResultLabel(result) {
  const value = (result || "").toLowerCase();
  if (value === "win") return "WIN";
  if (value === "loss") return "LOSS";
  if (value === "breakeven") return "BE";
  return "PENDING";
}

export default function Journal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { loadTrades(); }, []);

  async function loadTrades() {
    try {
      setLoading(true);
      const data = await getTrades();
      setTrades(data.map((t) => ({
        ...t,
        stopLoss: t.stop_loss,
        takeProfit: t.take_profit,
        risk: t.risk_percent,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = trades.filter((t) => {
    const now = new Date();
    const r = (t.result || "").toLowerCase();
    if (filter === "Gagnants" && r !== "win") return false;
    if (filter === "Perdants" && r !== "loss") return false;
    if (filter === "Ce mois") {
      const tradeDate = new Date(t.date);
      if (
        Number.isNaN(tradeDate.getTime()) ||
        tradeDate.getMonth() !== now.getMonth() ||
        tradeDate.getFullYear() !== now.getFullYear()
      ) return false;
    }
    if (search && !t.pair?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = filtered.length;
  const wins = filtered.filter((t) => (t.result || "").toLowerCase() === "win").length;
  const closedTrades = filtered.filter((t) => ["win", "loss", "breakeven"].includes((t.result || "").toLowerCase()));
  const winRate = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(1) : 0;
  const signedRs = filtered.map(getSignedR).filter((value) => value !== null);
  const rrValues = closedTrades
    .map((trade) => Math.abs(parseFloat(trade.rr)))
    .filter((value) => !Number.isNaN(value) && value > 0);
  const avgRR = rrValues.length > 0
    ? (rrValues.reduce((a, value) => a + value, 0) / rrValues.length).toFixed(2)
    : "—";
  const totalR = signedRs.reduce((sum, value) => sum + value, 0);

  function getScoreLabel(score) {
    if (!score) return { label: "—", color: "#6B7FA3" };
    if (score >= 9) return { label: "A+", color: "#10B981" };
    if (score >= 8) return { label: "A", color: "#10B981" };
    if (score >= 7) return { label: "B+", color: "#3B82F6" };
    if (score >= 6) return { label: "B", color: "#3B82F6" };
    if (score >= 5) return { label: "C", color: "#F59E0B" };
    return { label: "D", color: "#EF4444" };
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Décryptez vos performances et reproduisez vos meilleurs trades.</h1>
        <p style={styles.heroSub}>Chaque trade est une leçon. Transformez vos données en insights actionnables.</p>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.filters}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...styles.filterBtn,
              backgroundColor: filter === f ? "#3B82F6" : "#0D1421",
              color: filter === f ? "#fff" : "#6B7FA3",
              border: filter === f ? "1px solid #3B82F6" : "1px solid #1E2D45",
            }}>
              {f}
            </button>
          ))}
        </div>
        <div style={styles.searchRow}>
          <input
            style={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un trade..."
          />
          <button onClick={() => navigate("/analyse")} style={styles.addBtn}>
            + Nouveau Trade
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7FA3", textAlign: "center", padding: "40px" }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ color: "#6B7FA3", margin: 0 }}>Aucun trade trouvé.</p>
          <button onClick={() => navigate("/analyse")} style={styles.addBtn}>
            + Loguer mon premier trade
          </button>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Date", "Paire", "Direction", "P&L", "Résultat", "Setup", "Score IA", "Détail"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade) => {
                const r = (trade.result || "").toLowerCase();
                const isWin = r === "win";
                const isLoss = r === "loss";
                const scoreInfo = getScoreLabel(trade.ai_score);
                const signedR = getSignedR(trade);
                const pnl = signedR === null
                  ? "—"
                  : `${signedR > 0 ? "+" : ""}${signedR.toFixed(2)}R`;
                const pnlColor = isWin ? "#10B981" : isLoss ? "#EF4444" : "#6B7FA3";
                const resultColor = isWin ? "#10B981" : isLoss ? "#EF4444" : "#6B7FA3";
                const resultBg = isWin ? "#064E3B" : isLoss ? "#450A0A" : "#1E2D45";
                const resultLabel = getResultLabel(trade.result);

                return (
                  <tr key={trade.id} style={styles.row}>
                    <td style={styles.td}>
                      <span style={{ color: "#E8EDF5", fontWeight: "500" }}>{trade.date}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: "700", color: "#E8EDF5" }}>
                      <span style={styles.pairCell}>
                        <InstrumentIcon symbol={trade.pair} size={28} />
                        <span>{trade.pair?.toUpperCase()}</span>
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: trade.direction === "buy" || trade.direction === "long" ? "#064E3B" : "#450A0A",
                        color: trade.direction === "buy" || trade.direction === "long" ? "#10B981" : "#EF4444",
                      }}>
                        {trade.direction === "buy" || trade.direction === "long" ? "LONG" : "SHORT"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: pnlColor, fontWeight: "600" }}>{pnl}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: resultBg, color: resultColor }}>
                        {resultLabel}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {trade.setup
                        ? <span style={{ ...styles.badge, backgroundColor: "#1E3A5F", color: "#3B82F6" }}>{trade.setup}</span>
                        : <span style={{ color: "#3B4B6B" }}>—</span>
                      }
                    </td>
                    <td style={styles.td}>
                      {trade.ai_score ? (
                        <span style={{
                          ...styles.scoreBadge,
                          backgroundColor: scoreInfo.color + "22",
                          color: scoreInfo.color,
                          border: `1px solid ${scoreInfo.color}44`,
                        }}>
                          {trade.ai_score} {scoreInfo.label}
                        </span>
                      ) : <span style={{ color: "#3B4B6B" }}>—</span>}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => navigate(`/trade/${trade.id}`)}
                        style={styles.viewBtn}
                      >
                        →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={styles.statsFooter}>
            <StatFooter label="Total Trades" value={total} />
            <StatFooter label="Win Rate" value={`${winRate}%`} color={winRate >= 50 ? "#10B981" : "#EF4444"} />
            <StatFooter label="P&L Total" value={`${totalR >= 0 ? "+" : ""}${totalR.toFixed(2)}R`} color={totalR >= 0 ? "#10B981" : "#EF4444"} />
            <StatFooter label="Avg R:R" value={avgRR === "—" ? "—" : `${avgRR}R`} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatFooter({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#6B7FA3", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" }}>{label}</p>
      <p style={{ color: color || "#E8EDF5", fontSize: "1.3rem", fontWeight: "700", margin: 0 }}>{value}</p>
    </div>
  );
}

const styles = {
  page: { padding: "40px 32px", maxWidth: "1200px", margin: "0 auto" },
  hero: { textAlign: "center", marginBottom: "36px" },
  heroTitle: { fontSize: "1.8rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 10px 0" },
  heroSub: { color: "#6B7FA3", fontSize: "0.95rem", margin: 0 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  filters: { display: "flex", gap: "8px" },
  filterBtn: { padding: "8px 16px", borderRadius: "8px", fontWeight: "500", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  searchRow: { display: "flex", gap: "10px" },
  search: { backgroundColor: "#0D1421", border: "1px solid #1E2D45", borderRadius: "8px", padding: "8px 14px", color: "#E8EDF5", fontSize: "0.875rem", outline: "none", width: "220px", fontFamily: "'Inter', sans-serif" },
  addBtn: { padding: "8px 16px", backgroundColor: "#3B82F6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  empty: { textAlign: "center", padding: "60px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  tableWrapper: { backgroundColor: "#0D1421", borderRadius: "12px", border: "1px solid #1E2D45", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 20px", textAlign: "left", fontSize: "0.7rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #1E2D45", backgroundColor: "#0D1421" },
  row: { borderBottom: "1px solid #1E2D45" },
  td: { padding: "16px 20px", fontSize: "0.875rem", color: "#94A3B8" },
  pairCell: { display: "inline-flex", alignItems: "center", gap: "10px" },
  badge: { display: "inline-block", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" },
  scoreBadge: { display: "inline-block", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700" },
  viewBtn: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "6px", padding: "6px 12px", color: "#6B7FA3", cursor: "pointer", fontSize: "0.9rem" },
  statsFooter: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", padding: "20px 32px", borderTop: "1px solid #1E2D45" },
};
