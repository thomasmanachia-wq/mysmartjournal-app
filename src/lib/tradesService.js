import { supabase } from "./supabase.js";

export async function getTrades() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non authentifié.");

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertTrade(trade) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non authentifié.");

  const rr = parseFloat(trade.rr);
  const size = parseFloat(trade.size);
  const aiAnalysis = trade.aiAnalysis
    ? {
        ...trade.aiAnalysis,
        trade_context: {
          ...(trade.aiAnalysis.trade_context || {}),
          exit_price: trade.exitPrice || null,
          analysis_type: trade.analysisType || null,
        },
        reflection_answers: trade.reflectionAnswers || [],
      }
    : null;

  const { data, error } = await supabase
    .from("trades")
    .insert([{
      user_id: user.id,
      pair: trade.pair,
      date: trade.date,
      direction: trade.direction,
      entry: parseFloat(trade.entry),
      stop_loss: parseFloat(trade.stopLoss),
      take_profit: parseFloat(trade.takeProfit),
      risk_percent: parseFloat(trade.risk) || null,
      result: trade.result,
      notes: trade.notes,
      rr: Number.isFinite(rr) ? rr : null,
      setup: trade.setup || null,
      emotion: trade.emotion || null,
      timeframe: trade.timeframe || null,
      size: Number.isFinite(size) ? size : null,
      ai_score: trade.aiScore ? parseInt(trade.aiScore) : null,
      ai_analysis: aiAnalysis,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTrade(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non authentifié.");

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}
