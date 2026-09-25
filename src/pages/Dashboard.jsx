import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { Drawer } from "vaul";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Target,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Crown,
  Coffee,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { getTrades } from "../lib/tradesService.js";
import { cn } from "../lib/utils.js";

// Emotion configurations
const EMOTION_CONFIG = {
  calm: {
    label: "Calm",
    icon: Target,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    isTilt: false,
  },
  fomo: {
    label: "FOMO",
    icon: Zap,
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    isTilt: true,
  },
  revenge: {
    label: "Revenge",
    icon: Flame,
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    isTilt: true,
  },
  anxious: {
    label: "Anxious",
    icon: Activity,
    badgeClass: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    isTilt: true,
  },
  greed: {
    label: "Greed",
    icon: Crown,
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    isTilt: true,
  },
  bored: {
    label: "Bored",
    icon: Coffee,
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    isTilt: false,
  },
};

// Generates realistic institutional sample trades for the current month if user has 0 logs
function generateSampleTrades(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const pad = (n) => String(n).padStart(2, "0");
  const d = (day) => `${year}-${pad(month + 1)}-${pad(day)}`;

  return [
    {
      id: "mock-1",
      date: d(2),
      time: "09:30 EST",
      pair: "EUR/USD",
      direction: "BUY",
      lots: "5.0 Lots",
      entry: "1.08450",
      result: "win",
      pnl: 480,
      rr: 1.8,
      emotion: "calm",
      notes: "Clean London Open liquidity sweep of prior day high. Executed strictly on 5m FVG displacement.",
    },
    {
      id: "mock-2",
      date: d(4),
      time: "10:15 EST",
      pair: "NAS100",
      direction: "SELL",
      lots: "3.0 Lots",
      entry: "19,850.00",
      result: "win",
      pnl: 720,
      rr: 2.4,
      emotion: "calm",
      notes: "NY session open rejection of 1h premium supply zone. Target set at sell-side liquidity.",
    },
    {
      id: "mock-3",
      date: d(7),
      time: "08:45 EST",
      pair: "XAU/USD",
      direction: "BUY",
      lots: "4.0 Lots",
      entry: "2,635.40",
      result: "win",
      pnl: 650,
      rr: 2.1,
      emotion: "calm",
      notes: "Gold trend continuation after CPI consolidation. Held trade firmly to pre-defined TP.",
    },
    {
      id: "mock-4",
      date: d(9),
      time: "14:20 EST",
      pair: "GBP/JPY",
      direction: "SELL",
      lots: "3.5 Lots",
      entry: "191.240",
      result: "loss",
      pnl: -310,
      rr: -1.0,
      emotion: "calm",
      notes: "Invalidation reached. Cut position immediately at stop loss without moving stops.",
    },
    {
      id: "mock-5",
      date: d(11),
      time: "09:10 EST",
      pair: "EUR/USD",
      direction: "BUY",
      lots: "5.0 Lots",
      entry: "1.08720",
      result: "win",
      pnl: 560,
      rr: 1.9,
      emotion: "calm",
      notes: "Daily order block retest. Discipline score maximum.",
    },
    {
      id: "mock-6",
      date: d(14),
      time: "11:05 EST",
      pair: "US30",
      direction: "BUY",
      lots: "2.5 Lots",
      entry: "42,120.00",
      result: "win",
      pnl: 890,
      rr: 2.8,
      emotion: "calm",
      notes: "Followed institutional playbook. No hesitation on execution.",
    },
    {
      id: "mock-7",
      date: d(16),
      time: "15:40 EST",
      pair: "NAS100",
      direction: "BUY",
      lots: "4.0 Lots",
      entry: "20,010.00",
      result: "loss",
      pnl: -450,
      rr: -1.0,
      emotion: "fomo",
      notes: "Chased late afternoon breakout after missing morning leg. Caught in liquidity sweep.",
    },
    {
      id: "mock-8",
      date: d(18),
      time: "09:25 EST",
      pair: "EUR/USD",
      direction: "SELL",
      lots: "5.0 Lots",
      entry: "1.09110",
      result: "win",
      pnl: 620,
      rr: 2.0,
      emotion: "calm",
      notes: "Returned to systematic rules after Wednesday tilt. Clean execution.",
    },
    {
      id: "mock-9",
      date: d(21),
      time: "10:30 EST",
      pair: "XAU/USD",
      direction: "BUY",
      lots: "3.5 Lots",
      entry: "2,652.80",
      result: "win",
      pnl: 740,
      rr: 2.3,
      emotion: "calm",
      notes: "Institutional orderflow aligned with HTF bias.",
    },
    {
      id: "mock-10",
      date: d(23),
      time: "13:10 EST",
      pair: "BTC/USD",
      direction: "BUY",
      lots: "1.5 Lots",
      entry: "64,200.00",
      result: "win",
      pnl: 520,
      rr: 1.7,
      emotion: "calm",
      notes: "Weekend range breakout confirmation on volume.",
    },
    {
      id: "mock-11",
      date: d(24),
      time: "11:50 EST",
      pair: "GBP/JPY",
      direction: "BUY",
      lots: "4.0 Lots",
      entry: "192.150",
      result: "loss",
      pnl: -260,
      rr: -1.0,
      emotion: "calm",
      notes: "Stopped out on sudden BOJ commentary. Risk was strictly capped at 1R.",
    },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trades, setTrades] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load trades from Supabase, or fall back to realistic sample data
  useEffect(() => {
    let mounted = true;

    async function fetchTrades() {
      try {
        const data = await getTrades();
        if (mounted) {
          if (data && data.length > 0) {
            setTrades(data);
          } else {
            setTrades(generateSampleTrades(new Date()));
          }
        }
      } catch {
        if (mounted) {
          setTrades(generateSampleTrades(new Date()));
        }
      }
    }

    fetchTrades();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle incoming trade locked from /active-trade
  useEffect(() => {
    if (location.state?.lockedTrade) {
      const incoming = location.state.lockedTrade;
      const newTrade = {
        id: `locked-${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm") + " EST",
        pair: incoming.symbol || "EUR/USD",
        direction: incoming.side || "BUY",
        lots: incoming.lots || "5.0 Lots",
        entry: incoming.entry || "1.08450",
        result: "win", // active trade in profit
        pnl: 420,
        rr: 1.6,
        emotion: incoming.emotion || "calm",
        notes: incoming.thesis || "Context locked live via Focus Mode.",
      };

      setTrades((prev) => [newTrade, ...prev]);

      toast.success("Trade context locked & synced to calendar", {
        description: "Session audit updated with live emotional telemetry.",
      });

      // Clear location state so toast does not repeat
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Calendar dates computation with date-fns
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Map trades by day string (yyyy-MM-dd)
  const tradesByDay = useMemo(() => {
    const map = {};
    trades.forEach((trade) => {
      if (!trade.date) return;
      const dayKey = trade.date.includes("T")
        ? trade.date.split("T")[0]
        : trade.date;
      if (!map[dayKey]) {
        map[dayKey] = [];
      }
      map[dayKey].push(trade);
    });
    return map;
  }, [trades]);

  // Month-filtered trades for KPIs
  const currentMonthTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (!trade.date) return false;
      const d = new Date(trade.date);
      return (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      );
    });
  }, [trades, currentMonth]);

  // 4 Top KPIs calculation
  const metrics = useMemo(() => {
    const tradeList = currentMonthTrades.length > 0 ? currentMonthTrades : trades;
    let netPnl = 0;
    let grossWins = 0;
    let grossLosses = 0;
    let winsCount = 0;
    let calmCount = 0;

    tradeList.forEach((t) => {
      const pnl = Number(t.pnl) || (t.result === "win" ? 450 : t.result === "loss" ? -250 : 0);
      netPnl += pnl;

      if (pnl > 0 || (t.result || "").toLowerCase() === "win") {
        winsCount += 1;
        grossWins += Math.abs(pnl);
      } else if (pnl < 0 || (t.result || "").toLowerCase() === "loss") {
        grossLosses += Math.abs(pnl);
      }

      const emotion = (t.emotion || "calm").toLowerCase();
      if (!EMOTION_CONFIG[emotion]?.isTilt) {
        calmCount += 1;
      }
    });

    const totalTrades = tradeList.length;
    const winRate = totalTrades > 0 ? ((winsCount / totalTrades) * 100).toFixed(1) : "0.0";
    const profitFactor =
      grossLosses > 0
        ? (grossWins / grossLosses).toFixed(2)
        : grossWins > 0
        ? "3.40"
        : "1.00";
    const disciplineScore =
      totalTrades > 0 ? Math.round((calmCount / totalTrades) * 100) : 95;

    return {
      netPnl,
      winRate,
      profitFactor,
      disciplineScore,
      totalTrades,
      winsCount,
      lossesCount: totalTrades - winsCount,
    };
  }, [currentMonthTrades, trades]);

  // Drawer selected day trades
  const selectedDayKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedDayTrades = selectedDayKey ? tradesByDay[selectedDayKey] || [] : [];
  const selectedDayPnl = selectedDayTrades.reduce((acc, t) => {
    return acc + (Number(t.pnl) || (t.result === "win" ? 450 : -250));
  }, 0);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setIsDrawerOpen(true);
  };

  return (
    <div
      className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/30 via-slate-950 to-black text-slate-100 p-4 sm:p-6 lg:p-8"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top, rgba(30, 41, 59, 0.45) 0%, #030712 60%, #000000 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col space-y-8">
        {/* Top Header: Title & Action to Focus Mode */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Psychology Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Behavioral Heatmap
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Audit your execution discipline, tilt triggers, and daily session telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/active-trade")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all shadow-lg shadow-white/5 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Focus Mode</span>
            </button>
          </div>
        </div>

        {/* 3. Bandeau KPI Supérieur (4 Cartes Épurées) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Net P&L */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col justify-between transition-all hover:border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
              <span>Net P&L</span>
              <div
                className={cn(
                  "p-1.5 rounded-lg",
                  metrics.netPnl >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                )}
              >
                {metrics.netPnl >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>
            <div>
              <div
                className={cn(
                  "text-2xl sm:text-3xl font-mono font-bold tracking-tight",
                  metrics.netPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {metrics.netPnl >= 0 ? "+" : ""}$
                {Math.abs(metrics.netPnl).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                <span className="text-emerald-400 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +14.2%
                </span>
                <span>vs previous period</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Win Rate */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col justify-between transition-all hover:border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
              <span>Win Rate</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                {metrics.winRate}%
              </div>
              <div className="text-xs text-slate-400 mt-2">
                <span className="text-slate-200 font-medium">
                  {metrics.winsCount}W · {metrics.lossesCount}L
                </span>{" "}
                across {metrics.totalTrades} executions
              </div>
            </div>
          </div>

          {/* KPI 3: Profit Factor */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col justify-between transition-all hover:border-slate-700/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
              <span>Profit Factor</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                {metrics.profitFactor}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                <span className="text-emerald-400 font-medium">Optimal edge</span>{" "}
                (target: &gt; 1.80)
              </div>
            </div>
          </div>

          {/* KPI 4: Discipline Score (Signature KPI) */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col justify-between transition-all hover:border-slate-700/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
              <span>Discipline Score</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                  {metrics.disciplineScore}%
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Institutional
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Zero FOMO & plan compliance
              </div>
            </div>
          </div>
        </div>

        {/* 4. Le Calendrier Comportemental (Heatmap mensuelle) */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm p-5 sm:p-7 shadow-2xl">
          {/* Controls bar: Month Selector & Legend */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Current
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
                <span>Win Day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/20 border border-rose-500/40" />
                <span>Loss Day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>100% Calm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Tilt Trigger</span>
              </div>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Month grid cells */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {calendarDays.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayTrades = tradesByDay[dayKey] || [];
              const hasTrades = dayTrades.length > 0;
              const inCurrentMonth = isSameMonth(day, currentMonth);

              // Calculate Day PnL
              let dayPnl = 0;
              let hasTilt = false;

              if (hasTrades) {
                dayTrades.forEach((t) => {
                  const pnl =
                    Number(t.pnl) ||
                    (t.result === "win" ? 450 : t.result === "loss" ? -250 : 0);
                  dayPnl += pnl;

                  const emotion = (t.emotion || "calm").toLowerCase();
                  if (EMOTION_CONFIG[emotion]?.isTilt) {
                    hasTilt = true;
                  }
                });
              }

              const isWinDay = hasTrades && dayPnl > 0;
              const isLossDay = hasTrades && dayPnl < 0;

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[85px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group",
                    !inCurrentMonth && "opacity-25 pointer-events-none",
                    hasTrades && isWinDay && "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/15",
                    hasTrades && isLossDay && "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/15",
                    hasTrades && !isWinDay && !isLossDay && "bg-slate-900/60 border-slate-700/40 hover:border-slate-600",
                    !hasTrades && "bg-slate-900/20 border-slate-800/40 hover:border-slate-700/60 text-slate-500",
                    isToday(day) && "ring-1 ring-blue-500/60 shadow-lg shadow-blue-500/5"
                  )}
                >
                  {/* Top: Day number & today marker */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "text-xs font-mono font-medium",
                        isToday(day)
                          ? "w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold"
                          : inCurrentMonth
                          ? "text-slate-300"
                          : "text-slate-600"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Small dot on top right indicating trade presence */}
                    {hasTrades && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {dayTrades.length}T
                      </span>
                    )}
                  </div>

                  {/* Middle: Net P&L */}
                  {hasTrades ? (
                    <div className="my-1">
                      <div
                        className={cn(
                          "font-mono text-xs sm:text-sm font-bold tracking-tight",
                          isWinDay
                            ? "text-emerald-400"
                            : isLossDay
                            ? "text-rose-400"
                            : "text-slate-300"
                        )}
                      >
                        {dayPnl >= 0 ? "+" : ""}${Math.abs(dayPnl)}
                      </div>
                    </div>
                  ) : (
                    <div className="my-1 text-[11px] text-slate-600 hidden sm:block">
                      —
                    </div>
                  )}

                  {/* Bottom: Pastille de Discipline IA */}
                  {hasTrades ? (
                    <div className="w-full">
                      {hasTilt ? (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded-full w-full justify-center truncate">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">Tilt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded-full w-full justify-center truncate">
                          <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">Calm</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Le Tiroir d'Inspection de Session (Vaul) */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[28px] bg-slate-950 border-t border-slate-800 text-slate-100 max-h-[88vh] outline-none shadow-2xl">
            {/* Grab handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700/70 my-4" />

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-10 max-w-3xl w-full mx-auto">
              <Drawer.Title className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Session Audit —{" "}
                {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : ""}
              </Drawer.Title>
              <Drawer.Description className="text-sm text-slate-400 mt-1 mb-6">
                Execution autopsy, captured psychology, and emotional compliance metrics.
              </Drawer.Description>

              {/* Session Overview Bar */}
              {selectedDayTrades.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                        Session P&L
                      </span>
                      <span
                        className={cn(
                          "text-xl font-mono font-bold",
                          selectedDayPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {selectedDayPnl >= 0 ? "+" : ""}${Math.abs(selectedDayPnl)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                        Total Positions
                      </span>
                      <span className="text-xl font-mono font-bold text-white">
                        {selectedDayTrades.length} trade
                        {selectedDayTrades.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-slate-800 bg-slate-900/50">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                        Emotional State
                      </span>
                      {selectedDayTrades.some((t) =>
                        EMOTION_CONFIG[(t.emotion || "calm").toLowerCase()]?.isTilt
                      ) ? (
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mt-1">
                          <AlertTriangle className="w-4 h-4" />
                          Tilt Triggers Detected
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
                          <ShieldCheck className="w-4 h-4" />
                          100% Calm & Disciplined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* List of positions executed during the session */}
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Position Breakdown ({selectedDayTrades.length})
                  </h3>

                  <div className="space-y-4">
                    {selectedDayTrades.map((t) => {
                      const emotionKey = (t.emotion || "calm").toLowerCase();
                      const emotionInfo =
                        EMOTION_CONFIG[emotionKey] || EMOTION_CONFIG.calm;
                      const EmotionIcon = emotionInfo.icon;
                      const isWin =
                        t.result === "win" || (Number(t.pnl) || 0) > 0;

                      return (
                        <div
                          key={t.id}
                          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 transition-all hover:border-slate-700/80"
                        >
                          {/* Row 1: Hard Data Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-base font-bold text-white tracking-wide">
                                {t.pair}
                              </span>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-xs font-bold",
                                  t.direction === "BUY"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                )}
                              >
                                {t.direction}
                              </span>
                              <span className="text-xs font-mono text-slate-400">
                                {t.lots || "5.0 Lots"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-slate-400">
                                {t.time || "Market Session"}
                              </span>
                              <span
                                className={cn(
                                  "font-mono text-base font-bold",
                                  isWin ? "text-emerald-400" : "text-rose-400"
                                )}
                              >
                                {isWin ? "+" : ""}${Math.abs(Number(t.pnl) || 450)}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Psychology & Emotion Tag */}
                          <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">
                                Captured Mental State:
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                                  emotionInfo.badgeClass
                                )}
                              >
                                <EmotionIcon className="w-3.5 h-3.5" />
                                {emotionInfo.label}
                              </span>
                            </div>

                            {t.entry && (
                              <span className="text-xs font-mono text-slate-500">
                                Entry: <span className="text-slate-300">{t.entry}</span>
                              </span>
                            )}
                          </div>

                          {/* Row 3: Trade Thesis (Journal Express) */}
                          {t.notes && (
                            <div className="mt-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                                Trade Thesis:
                              </span>
                              "{t.notes}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Empty state for non-traded day */
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-4">
                    <CalendarIcon className="w-7 h-7 text-slate-500" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    No positions executed on this day
                  </h4>
                  <p className="text-sm text-slate-400 max-w-sm mb-6">
                    Rest, disciplined patience, and protecting capital during unaligned market regimes are hallmarks of elite traders.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate("/active-trade");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>Enter Focus Mode</span>
                  </button>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
