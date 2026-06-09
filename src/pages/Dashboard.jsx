import { useState, useEffect } from "react";
import { getTrades } from "../lib/tradesService.js";
import { analytics } from "../lib/analytics.js";
import InstrumentIcon from "../components/InstrumentIcon.jsx";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  TrendingUp, TrendingDown, Target, BarChart2,
  Award, Activity
} from "lucide-react";

const R_BIN_CENTERS = [-3, -2, -1, 0, 1, 2, 3, 4];

function getPeriodTrades(trades, timeFilter) {
  const days = timeFilter === "HEBDO" ? 7 : timeFilter === "MENSUEL" ? 30 : 365;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days + 1);
  return trades.filter((trade) => {
    if (!trade.date) return true;
    const tradeDate = new Date(trade.date);
    return !Number.isNaN(tradeDate.getTime()) && tradeDate >= cutoff;
  });
}

function getTradeRMultiple(trade) {
  const result = (trade.result || "").toLowerCase();
  const rr = Math.abs(parseFloat(trade.rr) || 0);
  if (result === "win") return rr;
  if (result === "loss") return -rr;
  if (result === "breakeven") return 0;
  return null;
}

function getRecentTradeMeta(trade) {
  const rMultiple = getTradeRMultiple(trade);
  if (rMultiple > 0) {
    return {
      value: `+${rMultiple.toFixed(2)}R`,
      color: "#10B981",
      bg: "#10B98115",
      icon: <TrendingUp size={11} color="#10B981" />,
    };
  }
  if (rMultiple < 0) {
    return {
      value: `${rMultiple.toFixed(2)}R`,
      color: "#EF4444",
      bg: "#EF444415",
      icon: <TrendingDown size={11} color="#EF4444" />,
    };
  }
  if (rMultiple === 0) {
    return {
      value: "0.00R",
      color: "#6B7FA3",
      bg: "#1E2D4515",
      icon: <Activity size={11} color="#6B7FA3" />,
    };
  }
  return {
    value: "—",
    color: "#6B7FA3",
    bg: "#1E2D4515",
    icon: <Activity size={11} color="#6B7FA3" />,
  };
}

function getRBin(rMultiple) {
  if (rMultiple <= -2.5) return -3;
  if (rMultiple >= 3.5) return 4;
  if (rMultiple > -0.5 && rMultiple < 0.5) return 0;
  return Math.round(rMultiple);
}

function formatRBinLabel(value) {
  if (value === -3) return "≤ -3R";
  if (value === 4) return "+4R+";
  if (value > 0) return `+${value}R`;
  return `${value}R`;
}

function clampChartX(value) {
  return Math.max(-3.4, Math.min(4.4, value));
}

function buildRDistribution(trades) {
  const rMultiples = trades
    .map(getTradeRMultiple)
    .filter((value) => typeof value === "number" && !Number.isNaN(value));
  const total = rMultiples.length;
  const counts = R_BIN_CENTERS.reduce((acc, center) => ({ ...acc, [center]: 0 }), {});
  rMultiples.forEach((value) => {
    counts[getRBin(value)] += 1;
  });
  const gains = rMultiples.filter((value) => value > 0);
  const losses = rMultiples.filter((value) => value < 0);

  return {
    total,
    avgGain: gains.length ? gains.reduce((sum, value) => sum + value, 0) / gains.length : null,
    avgLoss: losses.length ? losses.reduce((sum, value) => sum + value, 0) / losses.length : null,
    data: R_BIN_CENTERS.map((center) => ({
      x: center,
      label: formatRBinLabel(center),
      count: counts[center],
      pct: total ? Math.round((counts[center] / total) * 100) : 0,
      side: center < 0 ? "loss" : center > 0 ? "gain" : "neutral",
    })),
  };
}

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [timeFilter, setTimeFilter] = useState("HEBDO");

  useEffect(() => {
    getTrades().then((data) => {
      setTrades(data ?? []);
      analytics.dashboardViewed();
    }).catch(() => setTrades([]));
  }, []);

  const periodTrades = getPeriodTrades(trades, timeFilter);
  const total = periodTrades.length;
  const rMultiples = periodTrades
    .map(getTradeRMultiple)
    .filter((value) => typeof value === "number" && !Number.isNaN(value));
  const wins = rMultiples.filter((value) => value > 0).length;
  const losses = rMultiples.filter((value) => value < 0).length;
  const closedTotal = rMultiples.length;
  const winRate = closedTotal > 0 ? ((wins / closedTotal) * 100).toFixed(1) : 0;
  const rrValues = periodTrades
    .filter((trade) => getTradeRMultiple(trade) !== null)
    .map((t) => Math.abs(parseFloat(t.rr)))
    .filter((v) => !Number.isNaN(v) && v > 0);
  const avgRR = rrValues.length > 0 ? (rrValues.reduce((a, b) => a + b, 0) / rrValues.length).toFixed(2) : "—";
  const grossWinR = rMultiples.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
  const grossLossR = Math.abs(rMultiples.filter((value) => value < 0).reduce((sum, value) => sum + value, 0));
  const profitFactor = grossLossR > 0 ? (grossWinR / grossLossR).toFixed(2) : grossWinR > 0 ? "∞" : "—";
  const totalPnl = rMultiples.reduce((acc, value) => acc + value, 0);
  const isStrongProfitFactor = profitFactor === "∞" || parseFloat(profitFactor) >= 1.5;
  const isPositiveProfitFactor = profitFactor === "∞" || parseFloat(profitFactor) >= 1;

  const rDistribution = buildRDistribution(periodTrades);
  const maxBinCount = Math.max(...rDistribution.data.map((bin) => bin.count), 1);

  const pairCount = periodTrades.reduce((acc, t) => {
    const p = (t.pair || "").toUpperCase();
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const topPairs = Object.entries(pairCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([pair, count]) => ({ pair, count, pct: Math.round((count / total) * 100) }));

  const recent = periodTrades.slice(0, 8);
  const winTrades = rMultiples.filter((value) => value > 0);
  const lossTrades = rMultiples.filter((value) => value < 0);
  const avgWin = winTrades.length > 0 ? (winTrades.reduce((a, value) => a + value, 0) / winTrades.length).toFixed(2) : "—";
  const avgLoss = lossTrades.length > 0 ? (Math.abs(lossTrades.reduce((a, value) => a + value, 0)) / lossTrades.length).toFixed(2) : "—";
  const bestWin = winTrades.length > 0 ? Math.max(...winTrades).toFixed(2) : "—";

  const HistogramTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipPair}>Tranche {d.label}</p>
        <p style={{ ...styles.tooltipVal, color: d.side === "loss" ? "#F87171" : d.side === "gain" ? "#34D399" : "#94A3B8" }}>
          {d.count} trade{d.count > 1 ? "s" : ""}
        </p>
        <p style={styles.tooltipPct}>{d.pct}% de la période</p>
      </div>
    );
  };

  if (trades.length === 0) {
    return (
      <div style={styles.empty}>
        <BarChart2 size={40} color="#1E2D45" />
        <h2 style={styles.emptyTitle}>Aucune donnée disponible</h2>
        <p style={styles.emptySub}>Commence par logger des trades pour voir tes performances.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.metricsGrid}>
        <MetricCard label="Total P&L" value={`${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}R`} sub={`Sur ${total} trades`} icon={<TrendingUp size={14} color={totalPnl >= 0 ? "#10B981" : "#EF4444"} />} color={totalPnl >= 0 ? "#10B981" : "#EF4444"} trend={totalPnl >= 0 ? "up" : "down"} />
        <MetricCard label="Win Rate" value={`${winRate}%`} sub={`${wins}W · ${losses}L`} icon={<Target size={14} color={winRate >= 50 ? "#10B981" : "#EF4444"} />} color={winRate >= 50 ? "#10B981" : "#EF4444"} trend={winRate >= 50 ? "up" : "down"} />
        <MetricCard label="Profit Factor" value={profitFactor} sub="Ratio gains / pertes" icon={<Award size={14} color="#6366F1" />} color={isStrongProfitFactor ? "#10B981" : "#F59E0B"} trend={isPositiveProfitFactor ? "up" : "down"} />
        <MetricCard label="Avg R:R" value={avgRR === "—" ? "—" : `${avgRR}R`} sub={`${closedTotal} trades`} icon={<Activity size={14} color="#6366F1" />} color="#6366F1" trend="neutral" />
      </div>

      <div style={styles.midGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <p style={styles.sectionLabel}>RÉPARTITION DES GAINS & PERTES (R)</p>
              <p style={styles.chartSub}>Distribution des trades par R-multiple</p>
            </div>
            <div style={styles.timeFilters}>
              {["HEBDO", "MENSUEL", "ANNUEL"].map((f) => (
                <button key={f} onClick={() => setTimeFilter(f)} style={{ ...styles.timeBtn, backgroundColor: timeFilter === f ? "#1E2D45" : "transparent", color: timeFilter === f ? "#E8EDF5" : "#6B7FA3" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rDistribution.data} margin={{ top: 18, right: 8, left: -16, bottom: 0 }} barCategoryGap="24%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4555" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={[-3.5, 4.5]}
                ticks={R_BIN_CENTERS}
                tick={{ fill: "#6B7FA3", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatRBinLabel}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, Math.max(1, maxBinCount)]}
                tick={{ fill: "#6B7FA3", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={34}
              />
              {rDistribution.avgLoss !== null && (
                <ReferenceLine
                  x={clampChartX(rDistribution.avgLoss)}
                  stroke="#F87171"
                  strokeDasharray="4 5"
                  strokeWidth={1.4}
                  label={{ value: "Avg loss", position: "insideTop", fill: "#F87171", fontSize: 9 }}
                />
              )}
              {rDistribution.avgGain !== null && (
                <ReferenceLine
                  x={clampChartX(rDistribution.avgGain)}
                  stroke="#34D399"
                  strokeDasharray="4 5"
                  strokeWidth={1.4}
                  label={{ value: "Avg win", position: "insideTop", fill: "#34D399", fontSize: 9 }}
                />
              )}
              <Tooltip content={<HistogramTooltip />} cursor={{ fill: "#1E2D4522" }} />
              <Bar dataKey="count" radius={[6, 6, 2, 2]} barSize={30}>
                {rDistribution.data.map((entry) => (
                  <Cell
                    key={entry.x}
                    fill={entry.side === "loss" ? "rgba(248, 113, 113, 0.58)" : entry.side === "gain" ? "rgba(52, 211, 153, 0.76)" : "rgba(148, 163, 184, 0.34)"}
                    stroke={entry.side === "loss" ? "rgba(248, 113, 113, 0.78)" : entry.side === "gain" ? "rgba(45, 212, 191, 0.95)" : "rgba(148, 163, 184, 0.5)"}
                    strokeWidth={1.2}
                    style={{ filter: entry.side === "gain" ? "drop-shadow(0 0 7px rgba(45, 212, 191, 0.35))" : "none" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.sideCard}>
          <p style={{ ...styles.sectionLabel, textAlign: "center" }}>TOP PAIRES</p>
          <div style={styles.pairsList}>
            {topPairs.map(({ pair, count, pct }) => (
              <div key={pair} style={styles.pairRow}>
                <div style={styles.pairLeft}>
                  <InstrumentIcon symbol={pair} size={30} />
                  <div>
                    <p style={styles.pairName}>{pair}</p>
                    <p style={styles.pairCount}>{count} trades</p>
                  </div>
                </div>
                <div style={styles.pairRight}>
                  <div style={styles.pairBarTrack}>
                    <div style={{ ...styles.pairBarFill, width: `${pct}%` }} />
                  </div>
                  <span style={styles.pairPct}>{pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.sideCard}>
          <p style={{ ...styles.sectionLabel, textAlign: "center" }}>ACTIVITÉ RÉCENTE</p>
          <div style={styles.recentList}>
            {recent.map((t) => {
              const meta = getRecentTradeMeta(t);
              return (
                <div key={t.id} style={styles.recentRow}>
                  <div style={{ ...styles.recentStatus, backgroundColor: meta.bg }}>
                    {meta.icon}
                  </div>
                  <div style={styles.recentInfo}>
                    <p style={styles.recentPair}>{t.pair}</p>
                    <p style={styles.recentDate}>{t.date}</p>
                  </div>
                  <span style={{ ...styles.recentPnl, color: meta.color }}>{meta.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.sideCard}>
          <p style={{ ...styles.sectionLabel, textAlign: "center" }}>STATISTIQUES CLÉS</p>
          <div style={styles.statsGrid}>
            <StatBox icon={<TrendingUp size={12} color="#10B981" />} label="AVG WIN" value={avgWin === "—" ? "—" : `+${avgWin}R`} color="#10B981" />
            <StatBox icon={<TrendingDown size={12} color="#EF4444" />} label="AVG LOSS" value={avgLoss === "—" ? "—" : `-${avgLoss}R`} color="#EF4444" />
            <StatBox icon={<Activity size={12} color="#6366F1" />} label="RISK/REWARD" value={avgRR === "—" ? "—" : `1:${avgRR}`} color="#E8EDF5" />
            <StatBox icon={<Award size={12} color="#F59E0B" />} label="BEST TRADE" value={bestWin === "—" ? "—" : `+${bestWin}R`} color="#F59E0B" />
            <StatBox icon={<BarChart2 size={12} color="#6366F1" />} label="PROFIT FACTOR" value={profitFactor} color="#6366F1" />
            <StatBox icon={<Target size={12} color="#10B981" />} label="TOTAL WINS" value={`${wins} / ${total}`} color="#10B981" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, color, trend }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricTop}>
        <p style={styles.metricLabel}>{label}</p>
        <div style={styles.metricIconWrap}>{icon}</div>
      </div>
      <p style={{ ...styles.metricValue, color }}>{value}</p>
      <div style={styles.metricBottom}>
        <span style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#6B7FA3", fontSize: "0.6rem" }}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "●"}
        </span>
        <span style={styles.metricSub}>{sub}</span>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statHeader}>{icon}<p style={styles.statLabel}>{label}</p></div>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "14px" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" },
  emptyTitle: { color: "#E8EDF5", fontSize: "1.2rem", fontWeight: "600", margin: 0 },
  emptySub: { color: "#6B7FA3", fontSize: "0.875rem", margin: 0 },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" },
  metricCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "18px", display: "flex", flexDirection: "column", gap: "8px" },
  metricTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  metricLabel: { fontSize: "0.67rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 },
  metricIconWrap: { width: "26px", height: "26px", borderRadius: "7px", backgroundColor: "#121B2E", border: "1px solid #1E2D45", display: "flex", alignItems: "center", justifyContent: "center" },
  metricValue: { fontSize: "1.65rem", fontWeight: "700", margin: 0, letterSpacing: "-0.02em" },
  metricBottom: { display: "flex", alignItems: "center", gap: "5px" },
  metricSub: { fontSize: "0.72rem", color: "#6B7FA3" },
  midGrid: { display: "grid", gridTemplateColumns: "1fr 280px", gap: "14px" },
  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  chartCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "20px" },
  chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  sectionLabel: { fontSize: "0.67rem", fontWeight: "700", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px 0" },
  chartSub: { fontSize: "0.75rem", color: "#3B4B6B", margin: 0 },
  timeFilters: { display: "flex", gap: "2px", backgroundColor: "#070B14", borderRadius: "7px", padding: "3px" },
  timeBtn: { padding: "4px 10px", borderRadius: "5px", fontSize: "0.67rem", fontWeight: "600", cursor: "pointer", fontFamily: "'Inter', sans-serif", border: "none", transition: "all 0.15s" },
  tooltip: { backgroundColor: "#0D1421", border: "1px solid #1E2D45", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  tooltipPair: { color: "#6B7FA3", fontSize: "0.72rem", margin: "0 0 3px 0" },
  tooltipVal: { fontSize: "1rem", fontWeight: "700", margin: 0 },
  sideCard: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "18px", display: "flex", flexDirection: "column" },
  pairsList: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", flex: 1 },
  pairRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  pairLeft: { display: "flex", alignItems: "center", gap: "10px" },
  pairRight: { display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end" },
  pairName: { color: "#E8EDF5", fontWeight: "600", fontSize: "0.8rem", margin: 0 },
  pairCount: { color: "#6B7FA3", fontSize: "0.67rem", margin: 0 },
  pairBarTrack: { width: "60px", height: "3px", backgroundColor: "#1E2D45", borderRadius: "999px", overflow: "hidden" },
  pairBarFill: { height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #4338CA, #6366F1)" },
  pairPct: { color: "#6B7FA3", fontSize: "0.7rem", fontWeight: "600", minWidth: "28px", textAlign: "right" },
  recentList: { display: "flex", flexDirection: "column", marginTop: "12px", maxHeight: "280px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#1E2D45 transparent", flex: 1 },
  recentRow: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #1E2D4533" },
  recentStatus: { width: "26px", height: "26px", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  recentInfo: { flex: 1 },
  recentPair: { color: "#E8EDF5", fontWeight: "600", fontSize: "0.8rem", margin: 0 },
  recentDate: { color: "#6B7FA3", fontSize: "0.67rem", margin: 0 },
  recentPnl: { fontWeight: "700", fontSize: "0.82rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px", flex: 1 },
  statBox: { backgroundColor: "#070B14", borderRadius: "7px", padding: "10px 12px", border: "1px solid #1E2D45" },
  statHeader: { display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" },
  statLabel: { fontSize: "0.62rem", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 },
  statValue: { fontSize: "0.95rem", fontWeight: "700", margin: 0 },
};
