import { usePlan } from "../context/PlanContext.jsx";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function PremiumGate({ children, feature = "cette fonctionnalité" }) {
  const { isPremium, loading } = usePlan();
  const navigate = useNavigate();

  if (loading) return null;

  if (!isPremium) {
    return (
      <div style={styles.gate}>
        <div style={styles.lockIcon}>
          <Lock size={24} color="#F59E0B" />
        </div>
        <h3 style={styles.title}>Fonctionnalité Premium</h3>
        <p style={styles.desc}>
          {feature} est disponible uniquement avec MySmartJournal Premium.
        </p>
        <button onClick={() => navigate("/settings?section=facturation")} style={styles.btn}>
          Passer au Premium — 7.99€/mois
        </button>
      </div>
    );
  }

  return children;
}

const styles = {
  gate: { backgroundColor: "#0D1421", borderRadius: "12px", border: "1px solid #F59E0B33", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  lockIcon: { width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#451A0322", border: "1px solid #F59E0B33", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { color: "#E8EDF5", fontSize: "1rem", fontWeight: "700", margin: 0 },
  desc: { color: "#6B7FA3", fontSize: "0.875rem", margin: 0, maxWidth: "320px" },
  btn: { padding: "10px 24px", backgroundColor: "#F59E0B", color: "#000", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginTop: "4px" },
};
