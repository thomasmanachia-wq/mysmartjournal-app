import { supabase } from "./supabase.js";

const DEFAULTS = {
  capital_initial: 10000,
  risque_par_trade: 1,
  style_de_trading: "intraday",
  paires_favorites: ["EURUSD", "GBPUSD"],
  mode_coaching: "normal",
  domaine_de_focus: "technique",
  langue: "FR",
  theme: "sombre",
  notifications: true,
};

export async function getSettings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non authentifié.");

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // Pas encore de settings — crée avec les defaults
    return await createSettings(user.id);
  }
  if (error) throw error;
  return data;
}

export async function createSettings(userId, fields = {}) {
  const { data, error } = await supabase
    .from("user_settings")
    .insert([{ user_id: userId, ...DEFAULTS, ...fields }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSettings(fields) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non authentifié.");

  const { data, error } = await supabase
    .from("user_settings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select()
    .single();
  if (error && error.code === "PGRST116") {
    return await createSettings(user.id, fields);
  }
  if (error) throw error;
  return data;
}
