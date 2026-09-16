import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "")
  .replace(/\/$/, "");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function apiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!normalizedPath.startsWith("/api/") && normalizedPath !== "/api") {
    normalizedPath = `/api${normalizedPath}`;
  }
  return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
}

export async function apiFetch(url, options = {}) {
  let { data: { session } } = await supabase.auth.getSession();
  let token = session?.access_token;

  // Si pas de token ou session expirée, tenter un refresh silencieux
  if (!token) {
    try {
      const { data: refreshedData } = await supabase.auth.refreshSession();
      token = refreshedData?.session?.access_token;
    } catch {
      // Ignorer l'erreur immédiate, le check ci-dessous gérera
    }
  }

  if (!token) {
    const error = new Error("Session expired. Please log in again.");
    error.status = 401;
    throw error;
  }

  let res = await fetch(apiUrl(url), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  // Si le serveur répond 401 (ex: token tout juste expiré côté serveur), tenter un refresh et rejouer la requête une fois
  if (res.status === 401) {
    try {
      const { data: refreshedData } = await supabase.auth.refreshSession();
      const newToken = refreshedData?.session?.access_token;
      if (newToken) {
        res = await fetch(apiUrl(url), {
          ...options,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${newToken}`,
            ...options.headers,
          },
        });
      }
    } catch {
      // Poursuivre vers la gestion d'erreur standard
    }
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const error = new Error(data?.error || data || `Server error ${res.status}`);
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}
