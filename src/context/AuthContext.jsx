import { createContext, useContext, useEffect, useState } from "react";
// ✅ Ajout de apiFetch ici pour que l'appel backend fonctionne
import { supabase, apiFetch } from "../lib/supabase.js";
import { analytics, identifyUser, resetUser } from "../lib/analytics.js";

// Import des helpers Sentry pour le contexte utilisateur
import { setSentryUser, clearSentryUser } from "../lib/monitoring.js";

const AuthContext = createContext(null);
const REMEMBER_SESSION_KEY = "msj_remember_session";
const SESSION_ACTIVE_KEY = "msj_session_active";

function readStorage(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Le comportement d'auth reste valide si le navigateur bloque le stockage.
  }
}

function removeStorage(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore les environnements où le stockage est indisponible.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      const remember = readStorage(localStorage, REMEMBER_SESSION_KEY);
      const sessionActive = readStorage(sessionStorage, SESSION_ACTIVE_KEY);
      if (session?.user && remember === "false" && sessionActive !== "true") {
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        identifyUser(session.user.id, { email: session.user.email });
        analytics.appOpened("unknown");
        // Identification de l'user dans Sentry au chargement de la session
        setSentryUser(session.user.id, session.user.email, "free");
      }
      setLoading(false);
    }

    loadSession().catch(() => {
      setUser(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ Nouvelle fonction signUp propre (sans doublon)
  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    if (data?.user) {
      analytics.signupCompleted(data.user.id, email);
      if (data.session) {
        // Welcome email via backend (avec délai pour laisser Supabase créer les settings)
        setTimeout(async () => {
          try {
            await apiFetch("/send-welcome-email", { method: "POST", body: JSON.stringify({}) });
          } catch (e) {
            console.error("Welcome email error:", e);
          }
        }, 2000);
      }
    }
    return {
      user: data?.user || null,
      session: data?.session || null,
      requiresEmailConfirmation: Boolean(data?.user && !data?.session),
    };
  }

  async function signIn(email, password, options = {}) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const rememberSession = options.remember ?? true;
    writeStorage(localStorage, REMEMBER_SESSION_KEY, rememberSession ? "true" : "false");
    if (rememberSession) {
      removeStorage(sessionStorage, SESSION_ACTIVE_KEY);
    } else {
      writeStorage(sessionStorage, SESSION_ACTIVE_KEY, "true");
    }
    if (data?.user) {
      analytics.loginCompleted(data.user.id, email, "free");
      // Identification de l'user dans Sentry après connexion réussie
      setSentryUser(data.user.id, email, "free");
    }
  }

  async function signOut() {
    analytics.logoutCompleted();
    // Nettoyage du contexte utilisateur Sentry à la déconnexion
    clearSentryUser();
    removeStorage(localStorage, REMEMBER_SESSION_KEY);
    removeStorage(sessionStorage, SESSION_ACTIVE_KEY);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
