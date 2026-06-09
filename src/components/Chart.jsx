import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
  } from "recharts";

  function normalizeResult(result) {
    return typeof result === "string" ? result.toUpperCase() : "PENDING";
  }
  
  export default function Chart({ trades }) {
    if (!trades || trades.length === 0) return null;
  
    // Construit la courbe equity cumulative
    const data = trades
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((acc, trade, i) => {
        const prev = acc[i - 1]?.cumulative ?? 0;
        const rr = parseFloat(trade.rr) || 0;
        const normalizedResult = normalizeResult(trade.result);
        const delta = normalizedResult === "WIN" ? rr : normalizedResult === "LOSS" ? -1 : 0;
        acc.push({
          name: `${trade.pair} ${trade.date}`,
          cumulative: parseFloat((prev + delta).toFixed(2)),
          trade: i + 1,
        });
        return acc;
      }, []);
  
    const isPositive = data[data.length - 1]?.cumulative >= 0;
  
    const CustomTooltip = ({ active, payload }) => {
      if (!active || !payload?.length) return null;
      const val = payload[0].value;
      return (
        <div style={styles.tooltip}>
          <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}>
            {payload[0].payload.name}
          </p>
          <p style={{ color: val >= 0 ? "#4ade80" : "#f87171", fontWeight: "700", margin: 0 }}>
            {val >= 0 ? "+" : ""}{val}R
          </p>
        </div>
      );
    };
  
    return (
      <div style={styles.wrapper}>
        <h2 style={styles.title}>Equity Curve</h2>
        <p style={styles.subtitle}>Performance cumulée en R</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="trade"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
              label={{ value: "Trades", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
              tickFormatter={(v) => `${v}R`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke={isPositive ? "#4ade80" : "#f87171"}
              strokeWidth={2}
              dot={{ fill: isPositive ? "#4ade80" : "#f87171", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  const styles = {
    wrapper: {
      backgroundColor: "#1e293b",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #334155",
      marginBottom: "24px",
    },
    title: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#e2e8f0",
      marginBottom: "4px",
    },
    subtitle: {
      fontSize: "0.8rem",
      color: "#64748b",
      marginBottom: "20px",
    },
    tooltip: {
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "8px",
      padding: "10px 14px",
    },
  };