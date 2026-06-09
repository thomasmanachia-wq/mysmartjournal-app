import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import logo from "./assets/logo.png";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlanProvider } from "./context/PlanContext.jsx";
import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Onboarding from "./pages/Onboarding.jsx";
import Journal from "./pages/Journal.jsx";
import Analyse from "./pages/Analyse.jsx";
import ReponseIA from "./pages/ReponseIA.jsx";
import TradeDetail from "./pages/TradeDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Settings from "./pages/Settings.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TradingDisclaimer from "./pages/TradingDisclaimer.jsx";
import AdminFeedback from "./pages/AdminFeedback.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import {
  User, CreditCard, MessageSquare, LogOut,
  Shield, ChevronDown, ChevronUp
} from "lucide-react";

const ADMIN_EMAILS = ["thomasmanach06@gmail.com"];

function OnboardingGuard({ children }) {
  const { onboardingDone, loading } = useOnboarding();
  if (loading) return null;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  return children;
}

function DropdownItem({ label, icon: Icon, onClick, danger, muted }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        padding: "9px 14px",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.82rem",
        fontWeight: "500",
        textAlign: "left",
        borderRadius: "0",
        backgroundColor: hovered
          ? danger ? "rgba(239,68,68,0.08)" : "#1E2D45"
          : "transparent",
        color: danger ? "#EF4444" : muted ? "#4B607A" : "#C8D5E8",
        transition: "background-color 0.12s",
      }}
    >
      <span style={{
        width: "16px",
        height: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        opacity: danger ? 1 : muted ? 0.5 : 0.65,
      }}>
        <Icon size={14} />
      </span>
      <span>{label}</span>
    </button>
  );
}

function NavLink({ label, path, active }) {
  const navigate = useNavigate();
  return (
    <a
      href={path}
      onClick={(e) => { e.preventDefault(); navigate(path); }}
      style={{
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "0.875rem",
        padding: "6px 14px",
        borderRadius: "7px",
        letterSpacing: "-0.01em",
        color: active ? "#E8EDF5" : "#6B7FA3",
        backgroundColor: active ? "#1A2640" : "transparent",
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      {label}
      {active && (
        <span style={{
          position: "absolute",
          bottom: "-1px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "16px",
          height: "2px",
          borderRadius: "999px",
          backgroundColor: "#3B82F6",
        }} />
      )}
    </a>
  );
}

function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  if (location.pathname === "/onboarding") return null;
  if (!user) return null;

  const isAdmin = ADMIN_EMAILS.includes(user.email);
  const initial = (user.email || "U")[0].toUpperCase();
  const username = user.email ? user.email.split("@")[0] : "";

  function goTo(path) { setMenuOpen(false); navigate(path); }
  function onSignOut() { setMenuOpen(false); signOut(); }

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav style={navStyles.bar}>

      {/* ── Logo */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate("/")}
        onKeyDown={(e) => e.key === "Enter" && navigate("/")}
        style={navStyles.logoWrap}
      >
        <img
          src={logo}
          alt="MySmartJournal"
          style={{ height: "42px", width: "auto", display: "block" }}
        />
        <span style={navStyles.logoText}>MySmartJournal</span>
      </div>

      {/* ── Nav centrale */}
      <div style={navStyles.center}>
        <NavLink label="Journal"   path="/"          active={isActive("/")} />
        <NavLink label="Analyse"   path="/analyse"   active={isActive("/analyse")} />
        <NavLink label="Dashboard" path="/dashboard" active={isActive("/dashboard")} />
      </div>

      {/* ── Profil */}
      <div style={{ position: "relative" }} ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            ...navStyles.profileBtn,
            backgroundColor: menuOpen ? "#1A2640" : "transparent",
            borderColor: menuOpen ? "#2D4060" : "#1E2D45",
            boxShadow: menuOpen ? "0 0 0 1px #3B82F620" : "none",
          }}
        >
          <div style={navStyles.avatar}>
            <span style={navStyles.avatarText}>{initial}</span>
          </div>
          <span style={navStyles.username}>{username}</span>
          <span style={{ color: "#4B607A", display: "flex", alignItems: "center" }}>
            {menuOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>

        {/* ── Dropdown */}
        {menuOpen && (
          <div style={navStyles.dropdown}>

            {/* Header user */}
            <div style={navStyles.dropdownHead}>
              <div style={navStyles.avatarLg}>
                <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#3B82F6" }}>
                  {initial}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden", flex: 1 }}>
                <span style={{
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  color: "#E8EDF5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {username}
                </span>
                <span style={{
                  fontSize: "0.7rem",
                  color: "#4B607A",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {user.email}
                </span>
              </div>
            </div>

            <div style={navStyles.sep} />

            <DropdownItem
              label="Mon compte"
              icon={User}
              onClick={() => goTo("/settings")}
            />
            <DropdownItem
              label="Facturation"
              icon={CreditCard}
              onClick={() => goTo("/settings?section=facturation")}
            />
            <DropdownItem
              label="Support"
              icon={MessageSquare}
              onClick={() => {
                window.open("mailto:support@mysmartjournal.org", "_blank");
                setMenuOpen(false);
              }}
            />

            {isAdmin && (
              <>
                <div style={navStyles.sep} />
                <DropdownItem
                  label="Admin — Feedbacks"
                  icon={Shield}
                  onClick={() => goTo("/admin/feedback")}
                  muted
                />
              </>
            )}

            <div style={navStyles.sep} />

            <DropdownItem
              label="Déconnexion"
              icon={LogOut}
              onClick={onSignOut}
              danger
            />

          </div>
        )}
      </div>

    </nav>
  );
}

function AppShell() {
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#070B14",
      color: "#E8EDF5",
      fontFamily: "'Inter', sans-serif",
    }}>
      <NavBar />
      <main style={isOnboarding ? navStyles.onboardingMain : navStyles.main}>
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/signup"     element={<Signup />} />
          <Route path="/terms"      element={<TermsOfService />} />
          <Route path="/privacy"    element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<TradingDisclaimer />} />
          <Route path="/admin/feedback" element={<ProtectedRoute><AdminFeedback /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/" element={
            <ProtectedRoute>
              <OnboardingGuard><Journal /></OnboardingGuard>
            </ProtectedRoute>
          } />
          <Route path="/analyse" element={
            <ProtectedRoute>
              <OnboardingGuard><Analyse /></OnboardingGuard>
            </ProtectedRoute>
          } />
          <Route path="/reponse-ia" element={<ProtectedRoute><ReponseIA /></ProtectedRoute>} />
          <Route path="/trade/:id"  element={<ProtectedRoute><TradeDetail /></ProtectedRoute>} />
          <Route path="/dashboard"  element={
            <ProtectedRoute>
              <OnboardingGuard><Dashboard /></OnboardingGuard>
            </ProtectedRoute>
          } />
          <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlanProvider>
          <OnboardingProvider>
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </OnboardingProvider>
        </PlanProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const navStyles = {
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  onboardingMain: {
    maxWidth: "none",
    margin: 0,
  },
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: "60px",
    borderBottom: "1px solid #111C2E",
    backgroundColor: "#080E1A",
    position: "sticky",
    top: 0,
    zIndex: 200,
    backdropFilter: "blur(12px)",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    userSelect: "none",
    outline: "none",
    borderRadius: "8px",
    padding: "4px 8px",
    marginLeft: "-8px",
    transition: "opacity 0.15s",
  },
  logoText: {
    fontWeight: "700",
    fontSize: "1rem",
    color: "#E8EDF5",
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
  },

  center: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },

  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 10px 5px 5px",
    borderRadius: "10px",
    border: "1px solid",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "all 0.15s",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1E3A5F, #0F2040)",
    border: "1.5px solid #3B82F640",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: "#60A5FA",
  },
  avatarLg: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1E3A5F, #0F2040)",
    border: "1.5px solid #3B82F640",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  username: {
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "#8899AA",
    maxWidth: "110px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    letterSpacing: "-0.01em",
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: "0",
    width: "248px",
    backgroundColor: "#0C1422",
    border: "1px solid #182030",
    borderRadius: "14px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
    overflow: "hidden",
    animation: "dropdownIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  dropdownHead: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "16px 14px 13px",
    background: "linear-gradient(180deg, #111B2E 0%, transparent 100%)",
  },
  sep: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, #1A2840, transparent)",
    margin: "3px 0",
  },
};
