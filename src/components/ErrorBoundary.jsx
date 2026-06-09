import { Component } from "react";
import * as Sentry from "@sentry/react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
    this.setState({ eventId });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.page}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <AlertTriangle size={32} color="#F59E0B" />
            </div>
            <h1 style={styles.title}>Une erreur est survenue</h1>
            <p style={styles.desc}>
              Notre équipe a été automatiquement notifiée et travaille à résoudre le problème.
              Vous pouvez rafraîchir la page ou retourner à l'accueil.
            </p>
            {this.state.eventId && (
              <p style={styles.eventId}>Référence : {this.state.eventId}</p>
            )}
            <div style={styles.actions}>
              <button onClick={() => window.location.reload()} style={styles.primaryBtn}>
                <RefreshCw size={14} /> Rafraîchir la page
              </button>
              <button onClick={() => window.location.href = "/"} style={styles.secondaryBtn}>
                <Home size={14} /> Retour à l'accueil
              </button>
            </div>
            <button
              onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId })}
              style={styles.reportBtn}
            >
              Signaler ce problème
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper avec Sentry HOC pour le tracing
export default Sentry.withErrorBoundary(ErrorBoundaryClass, {
  fallback: ({ error, resetError }) => (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <AlertTriangle size={32} color="#F59E0B" />
        </div>
        <h1 style={styles.title}>Une erreur est survenue</h1>
        <p style={styles.desc}>
          Notre équipe a été automatiquement notifiée.
          Vous pouvez réessayer ou retourner à l'accueil.
        </p>
        <div style={styles.actions}>
          <button onClick={resetError} style={styles.primaryBtn}>
            <RefreshCw size={14} /> Réessayer
          </button>
          <button onClick={() => window.location.href = "/"} style={styles.secondaryBtn}>
            <Home size={14} /> Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  ),
});

// Composant léger pour sections spécifiques
export function SectionErrorBoundary({ children, fallback }) {
  return (
    <Sentry.ErrorBoundary
      fallback={fallback || (
        <div style={styles.sectionError}>
          <AlertTriangle size={16} color="#F59E0B" />
          <span style={{ color: "#6B7FA3", fontSize: "0.85rem" }}>
            Cette section a rencontré une erreur.
          </span>
          <button onClick={() => window.location.reload()} style={styles.smallBtn}>
            Rafraîchir
          </button>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#070B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "24px" },
  card: { backgroundColor: "#0D1421", borderRadius: "14px", border: "1px solid #1E2D45", padding: "40px", maxWidth: "480px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" },
  iconWrap: { width: "68px", height: "68px", borderRadius: "50%", backgroundColor: "#451A0322", border: "1px solid #F59E0B33", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: "1.3rem", fontWeight: "700", color: "#E8EDF5", margin: 0 },
  desc: { color: "#6B7FA3", fontSize: "0.875rem", lineHeight: "1.6", margin: 0 },
  eventId: { color: "#3B4B6B", fontSize: "0.72rem", backgroundColor: "#070B14", padding: "6px 12px", borderRadius: "6px", border: "1px solid #1E2D45", margin: 0 },
  actions: { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 20px", backgroundColor: "#3B82F6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  secondaryBtn: { display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 20px", backgroundColor: "transparent", border: "1px solid #1E2D45", color: "#6B7FA3", borderRadius: "8px", fontWeight: "500", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  reportBtn: { background: "none", border: "none", color: "#3B4B6B", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline", fontFamily: "'Inter', sans-serif" },
  sectionError: { display: "flex", alignItems: "center", gap: "8px", padding: "14px", backgroundColor: "#0D1421", borderRadius: "8px", border: "1px solid #1E2D45" },
  smallBtn: { padding: "4px 10px", backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "6px", color: "#6B7FA3", fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
};