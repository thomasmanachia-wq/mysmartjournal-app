export default function TradeTable({ trades, onDelete }) {
  if (trades.length === 0) return (
    <p style={{ color: "#475569", textAlign: "center", marginTop: "40px" }}>
      Aucun trade enregistré.
    </p>
  );

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Trade History</h2>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Date", "Pair", "Direction", "Entry", "SL", "TP", "R:R", "Risk %", "Result", "Notes", ""].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} style={styles.row}>
                {(() => {
                  const normalizedResult = typeof trade.result === "string" ? trade.result.toUpperCase() : "PENDING";
                  return (
                    <>
                <td style={styles.td}>{trade.date}</td>
                <td style={{ ...styles.td, fontWeight: "600", color: "#e2e8f0" }}>{trade.pair}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: trade.direction === "buy" ? "#14532d" : "#4c1d1d",
                    color: trade.direction === "buy" ? "#4ade80" : "#f87171",
                  }}>
                    {trade.direction.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>{trade.entry}</td>
                <td style={styles.td}>{trade.stopLoss}</td>
                <td style={styles.td}>{trade.takeProfit}</td>
                <td style={{ ...styles.td, fontWeight: "600", color: "#818cf8" }}>
                  {trade.rr ? `${trade.rr}R` : "—"}
                </td>
                <td style={styles.td}>{trade.risk ? `${trade.risk}%` : "—"}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor:
                      normalizedResult === "WIN" ? "#14532d" :
                      normalizedResult === "LOSS" ? "#4c1d1d" : "#1e293b",
                    color:
                      normalizedResult === "WIN" ? "#4ade80" :
                      normalizedResult === "LOSS" ? "#f87171" : "#94a3b8",
                  }}>
                    {normalizedResult}
                  </span>
                </td>
                <td style={{ ...styles.td, color: "#64748b", maxWidth: "180px" }}>
                  <span style={styles.notes}>{trade.notes || "—"}</span>
                </td>
                <td style={styles.td}>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(trade.id)}
                      style={styles.deleteBtn}
                    >
                      🗑
                    </button>
                  )}
                </td>
                    </>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { marginTop: "8px" },
  title: { fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", color: "#e2e8f0" },
  tableWrapper: { overflowX: "auto", borderRadius: "12px", border: "1px solid #1e293b" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: "500", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", whiteSpace: "nowrap" },
  row: { backgroundColor: "#1e293b", borderBottom: "1px solid #0f172a" },
  td: { padding: "12px 16px", color: "#94a3b8", whiteSpace: "nowrap" },
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "600" },
  notes: { display: "block", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  deleteBtn: { backgroundColor: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", opacity: 0.6 },
};