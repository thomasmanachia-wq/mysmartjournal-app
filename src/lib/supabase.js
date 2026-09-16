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
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    const error = new Error("Session expirée. Veuillez vous reconnecter.");
    error.status = 401;
    throw error;
  }

  const res = await fetch(apiUrl(url), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const error = new Error(data?.error || data || `Erreur serveur ${res.status}`);
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}
