import { useState } from "react";

const initialState = {
  pair: "",
  direction: "buy",
  entry: "",
  stopLoss: "",
  takeProfit: "",
  risk: "",
  result: "win",
  notes: "",
  date: new Date().toISOString().split("T")[0],
};

export default function TradeForm({ onSubmit }) {
  const [form, setForm] = useState(initialState);

  const rr = (() => {
    const entry = parseFloat(form.entry);
    const sl = parseFloat(form.stopLoss);
    const tp = parseFloat(form.takeProfit);
    if (!entry || !sl || !tp) return null;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return risk > 0 ? (reward / risk).toFixed(2) : null;
  })();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.pair || !form.entry || !form.stopLoss || !form.takeProfit) return;
    onSubmit({ ...form, rr, id: Date.now() });
    setForm(initialState);
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Log a Trade</h2>

      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Pair</label>
          <input
            style={styles.input}
            name="pair"
            value={form.pair}
            onChange={handleChange}
            placeholder="e.g. EURUSD"
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Date</label>
          <input
            style={styles.input}
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Direction</label>
          <select style={styles.input} name="direction" value={form.direction} onChange={handleChange}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Result</label>
          <select style={styles.input} name="result" value={form.result} onChange={handleChange}>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="breakeven">Breakeven</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Entry Price</label>
          <input
            style={styles.input}
            type="number"
            name="entry"
            value={form.entry}
            onChange={handleChange}
            placeholder="1.08500"
            step="any"
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Stop Loss</label>
          <input
            style={styles.input}
            type="number"
            name="stopLoss"
            value={form.stopLoss}
            onChange={handleChange}
            placeholder="1.08200"
            step="any"
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Take Profit</label>
          <input
            style={styles.input}
            type="number"
            name="takeProfit"
            value={form.takeProfit}
            onChange={handleChange}
            placeholder="1.09100"
            step="any"
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Risk %</label>
          <input
            style={styles.input}
            type="number"
            name="risk"
            value={form.risk}
            onChange={handleChange}
            placeholder="1"
            step="any"
          />
        </div>
      </div>

      {rr && (
        <div style={styles.rrBadge}>
          Calculated R:R → <strong>{rr}</strong>
        </div>
      )}

      <div style={{ ...styles.field, marginTop: "16px" }}>
        <label style={styles.label}>Notes</label>
        <textarea
          style={{ ...styles.input, height: "80px", resize: "vertical" }}
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Setup, context, mistakes..."
        />
      </div>

      <button type="submit" style={styles.button}>
        + Log Trade
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
    border: "1px solid #334155",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#e2e8f0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.78rem",
    fontWeight: "500",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  rrBadge: {
    marginTop: "16px",
    padding: "10px 16px",
    backgroundColor: "#1e3a5f",
    border: "1px solid #3b82f6",
    borderRadius: "8px",
    color: "#93c5fd",
    fontSize: "0.9rem",
  },
  button: {
    marginTop: "20px",
    padding: "12px 24px",
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
};