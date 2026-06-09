import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0f172a" }}>
        <p style={{ color: "#64748b" }}>Chargement...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}