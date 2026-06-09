import { supabase } from "./supabase.js";

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_trading_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // Crée le profil si inexistant
    const { data: created } = await supabase
      .from("user_trading_profile")
      .insert([{ user_id: user.id }])
      .select()
      .single();
    return created;
  }

  return data;
}

export async function getRecentTrades(limit = 10) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}