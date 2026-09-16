import { usePlan } from "../context/PlanContext.jsx";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";

export default function PremiumGate({
  children,
  feature = "Detailed Action Plan & Self-Audit",
  title = "Unlock with MySmartJournal Pro",
  description = "Upgrade to Pro to unlock personalized action plans and psychological self-audit prompts.",
  blur = true,
}) {
  const { isPremium, loading } = usePlan();
  const navigate = useNavigate();

  if (loading) return null;

  if (!isPremium) {
    if (blur && children) {
      return (
        <div style={styles.blurContainer}>
          <div style={styles.blurredContent} tabIndex={-1} aria-hidden="true">
            {children}
          </div>
          <div style={styles.overlay}>
            <div style={styles.card}>
              <div style={styles.lockIcon}>
                <Lock size={22} color="#F59E0B" />
              </div>
              <h3 style={styles.title}>{title}</h3>
              <p style={styles.desc}>
                {description || `${feature} is exclusively available with MySmartJournal Pro.`}
              </p>
              <button
                onClick={() => navigate("/settings?section=billing")}
                style={styles.btn}
              >
                <Sparkles size={14} color="#000" />
                Upgrade to Pro — $7.99/mo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.gate}>
        <div style={styles.lockIcon}>
          <Lock size={24} color="#F59E0B" />
        </div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.desc}>
          {description || `${feature} is exclusively available with MySmartJournal Pro.`}
        </p>
        <button onClick={() => navigate("/settings?section=billing")} style={styles.btn}>
          <Sparkles size={14} color="#000" />
          Upgrade to Pro — $7.99/mo
        </button>
      </div>
    );
  }

  return children;
}

const styles = {
  blurContainer: {
    position: "relative",
    borderRadius: "14px",
    overflow: "hidden",
    marginTop: "16px",
    marginBottom: "16px",
  },
  blurredContent: {
    filter: "blur(6px)",
    opacity: 0.32,
    pointerEvents: "none",
    userSelect: "none",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, rgba(8, 12, 20, 0.45) 0%, rgba(8, 12, 20, 0.92) 100%)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    padding: "20px",
    zIndex: 10,
  },
  card: {
    backgroundColor: "#0D1421",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: "14px",
    padding: "28px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    maxWidth: "430px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.55), 0 0 28px rgba(245, 158, 11, 0.08)",
  },
  gate: {
    backgroundColor: "#0D1421",
    borderRadius: "14px",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    padding: "36px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
    marginBottom: "16px",
  },
  lockIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "2px",
  },
  title: {
    color: "#E8EDF5",
    fontSize: "1.1rem",
    fontWeight: "700",
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "-0.01em",
  },
  desc: {
    color: "#94A3B8",
    fontSize: "0.85rem",
    lineHeight: "1.45",
    margin: 0,
    maxWidth: "340px",
    fontFamily: "'Inter', sans-serif",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 24px",
    backgroundColor: "#F59E0B",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "0.875rem",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    marginTop: "4px",
    boxShadow: "0 4px 14px rgba(245, 158, 11, 0.25)",
  },
};
