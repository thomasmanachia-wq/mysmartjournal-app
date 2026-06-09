import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { getSettings } from "../lib/settingsService.js";
import { analytics, identifyUser } from "../lib/analytics.js";

const PlanContext = createContext({ plan: "free", loading: true });

export function PlanProvider({ children }) {
  const [plan, setPlanState] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadPlan();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadPlan() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const settings = await getSettings();
      const currentPlan = settings?.plan || "free";
      setPlanState(currentPlan);

      identifyUser(user.id, {
        email: user.email,
        plan: currentPlan,
        trading_level: settings?.trading_level,
        main_market: settings?.main_market,
      });

      analytics.appOpened(currentPlan);
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