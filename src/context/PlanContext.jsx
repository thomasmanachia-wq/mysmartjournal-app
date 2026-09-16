import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { getSettings } from "../lib/settingsService.js";
import { analytics, identifyUser } from "../lib/analytics.js";

const PlanContext = createContext({ plan: "free", loading: true });

export function PlanProvider({ children }) {
  const [plan, setPlanState] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Ignorer TOKEN_REFRESHED pour éviter des re-fetches et re-renders inutiles au focus
      if (event === "TOKEN_REFRESHED") return;
      loadPlan(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadPlan(isInitial = false) {
    try {
      if (isInitial) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const settings = await getSettings();
      const currentPlan = settings?.plan || "free";
      setPlanState(currentPlan);

      // Enrichissement du profil PostHog avec le plan réel (distinct de l'événement app_opened
      // qui est tracké une seule fois dans AuthContext au chargement de la session)
      identifyUser(user.id, {
        email: user.email,
        plan: currentPlan,
        trading_level: settings?.trading_level,
        main_market: settings?.main_market,
      });
    } catch {
      setPlanState("free");
    } finally {
      setLoading(false);
    }
  }

  function setPlan(newPlan) {
    setPlanState(newPlan);
    if (newPlan === "premium") analytics.premiumActivated();
    if (newPlan === "free") analytics.subscriptionCancelled();
  }

  return (
    <PlanContext.Provider value={{ plan, loading, isPremium: plan === "premium", setPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}