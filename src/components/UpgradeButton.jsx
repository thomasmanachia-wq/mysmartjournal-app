import { useState } from "react";
import { apiFetch, supabase } from "../lib/supabase.js";
import { usePlan } from "../context/PlanContext.jsx";
import { analytics } from "../lib/analytics.js";
import { Zap, Loader } from "lucide-react";

export default function UpgradeButton({ style, source = "upgrade_button" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isPremium } = usePlan();

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    analytics.premiumClicked(source);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Veuillez vous reconnecter.");

      const data = await apiFetch("/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, email: user.email }),
      });

      if (data.url) {
        analytics.checkoutStarted();
        window.location.href = data.url;
      } else {
        throw new Error("URL Stripe introuvable.");
      }
    } catch (err) {
      analytics.errorOccurred("checkout", err.message, { source });
      setError(err.message);
      setLoading(false);
    }
  }

  if (isPremium) {
    return (
      <div style={{ ...styles.premiumBadge, ...style }}>
        <Zap size={13} color="#F59E0B" />
        Premium actif
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleUpgrade} disabled={loading} style={{ ...styles.btn, ...style }}>
        {loading
          ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> Redirection...</>
          : <><Zap size={13} /> Passer au Premium</>
        }
      </button>
      {error && <p style={styles.error}>{error}</p>}
      <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

const styles = {
  btn: { display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 20px", backgroundColor: "#F59E0B", color: "#000", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  premiumBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#451A0322", border: "1px solid #F59E0B44", borderRadius: "8px", color: "#F59E0B", fontSize: "0.8rem", fontWeight: "600" },
  error: { color: "#EF4444", fontSize: "0.78rem", marginTop: "6px" },
};
