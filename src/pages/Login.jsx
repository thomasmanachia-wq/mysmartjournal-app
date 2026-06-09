import { useState } from "react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const [resetStatus, setResetStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password, { remember });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setResetStatus(null);
    if (!email) {
      setError("Renseignez votre email pour recevoir le lien de réinitialisation.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/settings?section=compte`,
      });
      if (error) throw error;
      setResetStatus("Lien de réinitialisation envoyé.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <img src={logo} alt="Logo" style={{ display: "block", margin: "0 auto 24px auto", height: "65px", width: "auto" }} />

        <h1 style={styles.title}>Bon retour parmi nous</h1>
        <p style={styles.subtitle}>Connectez-vous à votre espace MySmartJournal</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Email">
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              required
            />
          </Field>

          <Field label="Mot de passe">
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div style={styles.forgotRow}>
              <button type="button" onClick={handleForgotPassword} style={styles.forgot}>
                Mot de passe oublié ?
              </button>
            </div>
          </Field>

          <label style={styles.checkRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.checkLabel}>Se souvenir de moi</span>
          </label>

          {error && <p style={styles.error}>{error}</p>}
          {resetStatus && <p style={styles.success}>{resetStatus}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={styles.switchText}>
          Pas encore de compte ?{" "}
          <Link to="/signup" style={styles.link}>Créer un compte</Link>
        </p>

        <LegalFooter />

        <p style={styles.footer}>© 2025 MySmartJournal. Tous droits réservés.</p>
      </div>
    </div>
  );
}

function LegalFooter() {
  return (
    <div style={styles.legalLinks}>
      <Link to="/terms" style={styles.legalLink}>Conditions</Link>
      <Link to="/privacy" style={styles.legalLink}>Confidentialité</Link>
      <Link to="/disclaimer" style={styles.legalLink}>Disclaimer</Link>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#070B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" },
  card: { backgroundColor: "#0D1421", borderRadius: "14px", padding: "40px 36px", width: "100%", maxWidth: "400px", border: "1px solid #1E2D45", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" },
  logoRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "28px" },
  logoImg: { height: "36px", width: "auto" },
  logoText: { fontSize: "1rem", fontWeight: "700", color: "#E8EDF5", letterSpacing: "-0.01em" },
  title: { fontSize: "1.3rem", fontWeight: "700", color: "#E8EDF5", textAlign: "center", margin: "0 0 6px 0" },
  subtitle: { fontSize: "0.82rem", color: "#6B7FA3", textAlign: "center", margin: "0 0 28px 0" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  label: { fontSize: "0.78rem", fontWeight: "500", color: "#94A3B8" },
  input: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "8px", padding: "11px 14px", color: "#E8EDF5", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" },
  forgotRow: { display: "flex", justifyContent: "flex-end", marginTop: "4px" },
  forgot: { background: "none", border: "none", padding: 0, fontSize: "0.78rem", color: "#3B82F6", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  checkRow: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
  checkbox: { width: "14px", height: "14px", accentColor: "#3B82F6", cursor: "pointer" },
  checkLabel: { fontSize: "0.82rem", color: "#6B7FA3" },
  error: { color: "#EF4444", fontSize: "0.82rem", margin: 0 },
  success: { color: "#10B981", fontSize: "0.82rem", margin: 0 },
  button: { padding: "12px", backgroundColor: "#3B82F6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginTop: "4px" },
  switchText: { color: "#6B7FA3", fontSize: "0.82rem", textAlign: "center", marginTop: "20px" },
  link: { color: "#3B82F6", textDecoration: "none", fontWeight: "600" },
  legalLinks: { display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px", flexWrap: "wrap" },
  legalLink: { color: "#3B4B6B", fontSize: "0.72rem", textDecoration: "none" },
  footer: { color: "#2A3A52", fontSize: "0.72rem", textAlign: "center", marginTop: "28px" },
};
