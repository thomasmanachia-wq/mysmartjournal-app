import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { getSettings, updateSettings } from "../lib/settingsService.js";

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function check(isInitial = false) {
      try {
        if (mounted && isInitial) {
          setLoading(true);
          setError(null);
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setOnboardingDone(false);
          return;
        }
        const settings = await getSettings();
        if (mounted) setOnboardingDone(settings?.onboarding_completed === true);
      } catch (err) {
        if (mounted) {
          setOnboardingDone(false);
          setError(err.message || "Impossible de charger l'onboarding.");
        }
      } finally {
        if (mounted && isInitial) setLoading(false);
      }
    }

    check(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Évite tout clignotement ou rechargement au focus d'onglet / renouvellement de token
      if (event === "TOKEN_REFRESHED") return;
      if (event === "SIGNED_OUT") {
        if (mounted) {
          setOnboardingDone(false);
          setLoading(false);
        }
        return;
      }
      check(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function completeOnboarding() {
    await updateSettings({ onboarding_completed: true });
    setOnboardingDone(true);
  }

  return (
    <OnboardingContext.Provider value={{ onboardingDone, loading, error, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
