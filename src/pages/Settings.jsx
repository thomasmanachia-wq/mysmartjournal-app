import { useState, useEffect } from "react";
import { supabase, apiFetch } from "../lib/supabase.js";
import { getSettings, updateSettings } from "../lib/settingsService.js";
import { usePlan } from "../context/PlanContext.jsx";
import UpgradeButton from "../components/UpgradeButton.jsx";
import {
  User, TrendingUp, Brain, Settings as SettingsIcon, CreditCard,
  Check, AlertCircle, Loader, ChevronRight, Mail, Trash2,
  Moon, MessageSquare, Bug, Lightbulb, FileText,
  Shield, ExternalLink, Zap, Star, Clock, ArrowRight, X,
  KeyRound, Headphones, Gauge
} from "lucide-react";

const SECTIONS = [
  { id: "compte",      label: "Compte",       desc: "Profil et sécurité",      icon: User },
  { id: "trading",     label: "Trading",      desc: "Trades et profil trader", icon: TrendingUp },
  { id: "ia",          label: "IA",           desc: "Coach et analyses",       icon: Brain },
  { id: "app",         label: "Application",  desc: "Affichage et emails",     icon: SettingsIcon },
  { id: "facturation", label: "Abonnement",   desc: "Plan et facturation",     icon: CreditCard },
  { id: "support",     label: "Support",      desc: "Contact et feedback",     icon: MessageSquare },
];

export default function Settings() {
  const [section, setSection] = useState("compte");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const s = await getSettings();
      setSettings(s);
      setLoading(false);
      const params = new URLSearchParams(window.location.search);
      const sectionParam = params.get("section") || params.get("tab");
      if (sectionParam) {
        const valid = ["compte", "trading", "ia", "app", "facturation", "support"];
        if (valid.includes(sectionParam)) setSection(sectionParam);
      }
    }
    load();
  }, []);

  function handleSettingsUpdate(updated) {
    setSettings((prev) => ({ ...prev, ...updated }));
  }

  if (loading) {
    return (
      <div style={s.centered}>
        <Loader size={20} color="#3B82F6" />
        <p style={{ color: "#6B7FA3", margin: 0, fontSize: "0.875rem" }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Centre de contrôle</h1>
          <p style={s.pageSubtitle}>Compte, préférences de trading, IA et abonnement au même endroit.</p>
        </div>
      </div>

      <div style={s.summaryGrid}>
        <SummaryItem
          icon={<User size={14} color="#60A5FA" />}
          label="Compte"
          value={user?.email || "Utilisateur connecté"}
        />
        <SummaryItem
          icon={<Star size={14} color={settings?.plan === "premium" ? "#F59E0B" : "#60A5FA"} />}
          label="Plan"
          value={settings?.plan === "premium" ? "Premium" : "Gratuit"}
        />
        <SummaryItem
          icon={<Gauge size={14} color="#10B981" />}
          label="Profil trading"
          value={settings?.style_de_trading || "intraday"}
        />
      </div>

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <div style={s.sidebarInner}>
            {SECTIONS.map(({ id, label, desc, icon }) => {
              const active = section === id;
              const SectionIcon = icon;
              return (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  style={{
                    ...s.sidebarBtn,
                    backgroundColor: active ? "#131F33" : "transparent",
                    color: active ? "#E8EDF5" : "#5A7090",
                    borderLeft: active ? "2px solid #3B82F6" : "2px solid transparent",
                  }}
                >
                  <SectionIcon size={14} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={s.sidebarLabel}>{label}</span>
                    <span style={s.sidebarDesc}>{desc}</span>
                  </span>
                  {active && <ChevronRight size={12} style={{ opacity: 0.4 }} />}
                </button>
              );
            })}
          </div>

          {/* Lien documents légaux */}
          <div style={s.sidebarLegal}>
            <p style={s.sidebarLegalTitle}>Documents</p>
            <LegalLink label="Conditions d'utilisation" href="/terms" />
            <LegalLink label="Confidentialité" href="/privacy" />
            <LegalLink label="Disclaimer Trading" href="/disclaimer" />
          </div>
        </aside>

        {/* Content */}
        <div style={s.content}>
          {section === "compte"      && <CompteSection user={user} />}
          {section === "trading"     && <TradingSection settings={settings} onUpdate={handleSettingsUpdate} />}
          {section === "ia"          && <IASection settings={settings} onUpdate={handleSettingsUpdate} />}
          {section === "app"         && <AppSection settings={settings} onUpdate={handleSettingsUpdate} />}
          {section === "facturation" && <FacturationSection settings={settings} onUpdate={handleSettingsUpdate} />}
          {section === "support"     && <SupportSection />}
        </div>
      </div>
    </div>
  );
}

function LegalLink({ label, href }) {
  return (
    <a
      href={href}
      onClick={(e) => { e.preventDefault(); window.open(href, "_blank"); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#3B4B6B",
        fontSize: "0.72rem",
        textDecoration: "none",
        padding: "4px 0",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = "#6B7FA3"}
      onMouseLeave={(e) => e.currentTarget.style.color = "#3B4B6B"}
    >
      <FileText size={10} />
      {label}
      <ExternalLink size={9} style={{ marginLeft: "auto", opacity: 0.45 }} />
    </a>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div style={s.summaryItem}>
      <div style={s.summaryIcon}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={s.summaryLabel}>{label}</p>
        <p style={s.summaryValue}>{value}</p>
      </div>
    </div>
  );
}

// ─── COMPTE ───────────────────────────────────────────────────────────────────

function CompteSection({ user }) {
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  async function handleUpdateEmail() {
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setEmailStatus({ type: "success", msg: "Vérifiez votre boîte mail pour confirmer." });
      return true;
    } catch (err) {
      setEmailStatus({ type: "error", msg: err.message });
      return false;
    }
  }

  async function handleUpdatePassword() {
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", msg: "Les mots de passe ne correspondent pas." });
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", msg: "Minimum 6 caractères." });
      return false;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordStatus({ type: "success", msg: "Mot de passe mis à jour." });
      setNewPassword("");
      setConfirmPassword("");
      return true;
    } catch (err) {
      setPasswordStatus({ type: "error", msg: err.message });
      return false;
    }
  }

  return (
    <div style={s.sections}>
      <SectionHeader title="Compte" subtitle="Profil utilisateur, email et sécurité de connexion" />

      <Card>
        <div style={s.profilePanel}>
          <div style={s.profileAvatar}>
            <User size={18} color="#60A5FA" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={s.profileTitle}>Profil utilisateur</p>
            <p style={s.profileMeta}>{user?.email || "Email non disponible"}</p>
          </div>
          <div style={s.securityBadge}>
            <Shield size={12} />
            Session sécurisée
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ padding: "20px" }}>
          <div style={s.cardRowHeader}>
            <div style={s.cardRowIconWrap}>
              <KeyRound size={15} color="#3B82F6" />
            </div>
            <div>
              <p style={s.cardRowTitle}>Identifiants</p>
              <p style={s.cardRowDesc}>Email de connexion et mot de passe</p>
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <Field label="Adresse email">
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  style={s.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <SaveButton onClick={handleUpdateEmail} compact />
              </div>
            </Field>
            <StatusMsg status={emailStatus} />
          </div>
          <div style={s.localDivider} />
          <div style={s.twoCol}>
            <Field label="Nouveau mot de passe">
              <input style={s.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="Confirmer">
              <input style={s.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </Field>
          </div>
          <SaveButton
            label="Mettre à jour le mot de passe"
            onClick={handleUpdatePassword}
            style={{ display: "flex", justifyContent: "center", margin: "12px auto 0" }}
          />
          <StatusMsg status={passwordStatus} />
        </div>
      </Card>

      {/* Zone dangereuse — isolée */}
      <div style={s.dangerZone}>
        <div style={s.dangerZoneHeader}>
          <Trash2 size={14} color="#EF4444" />
          <span style={s.dangerZoneTitle}>Zone dangereuse</span>
        </div>
        <div style={s.dangerZoneBody}>
          <div>
            <p style={s.dangerZoneLabel}>Demande de suppression</p>
            <p style={s.dangerZoneDesc}>
              Une demande manuelle permet de vérifier l'identité avant suppression définitive.
            </p>
          </div>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} style={s.dangerBtn}>
              Demander
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => window.open("mailto:support@mysmartjournal.org?subject=Suppression%20de%20compte", "_blank")}
                style={s.dangerBtn}
              >
                Envoyer la demande
              </button>
              <button onClick={() => setDeleteConfirm(false)} style={s.cancelBtn}>Annuler</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TRADING ──────────────────────────────────────────────────────────────────

function TradingSection({ settings, onUpdate }) {
  const [form, setForm] = useState({
    capital_initial: settings?.capital_initial || 10000,
    risque_par_trade: settings?.risque_par_trade || 1,
    style_de_trading: settings?.style_de_trading || "intraday",
    paires_favorites: settings?.paires_favorites || [],
  });
  const [status, setStatus] = useState(null);
  const [pairInput, setPairInput] = useState("");

  function addPair() {
    if (!pairInput.trim()) return;
    const p = pairInput.trim().toUpperCase();
    if (!form.paires_favorites.includes(p)) {
      setForm((prev) => ({ ...prev, paires_favorites: [...prev.paires_favorites, p] }));
    }
    setPairInput("");
  }

  function removePair(pair) {
    setForm((prev) => ({ ...prev, paires_favorites: prev.paires_favorites.filter((p) => p !== pair) }));
  }

  async function handleSave() {
    try {
      const updated = await updateSettings(form);
      onUpdate(updated);
      setStatus({ type: "success", msg: "Préférences sauvegardées." });
      return true;
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
      return false;
    }
  }

  const styles_trading = ["scalping", "intraday", "swing"];
  const styleLabels = {
    scalping: { label: "Scalping", desc: "Minutes à quelques heures" },
    intraday: { label: "Intraday", desc: "Ouvert et fermé dans la journée" },
    swing: { label: "Swing", desc: "Positions sur plusieurs jours" },
  };

  return (
    <div style={s.sections}>
      <SectionHeader title="Trading" subtitle="Configurez votre profil de trader" />

      <Card>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={s.cardRowHeader}>
            <div style={s.cardRowIconWrap}>
              <Gauge size={15} color="#3B82F6" />
            </div>
            <div>
              <p style={s.cardRowTitle}>Paramètres de risque</p>
              <p style={s.cardRowDesc}>Capital et risque de référence pour vos trades</p>
            </div>
          </div>
          <div style={s.twoCol}>
            <Field label="Capital initial (€)">
              <input
                style={s.input}
                type="number"
                value={form.capital_initial}
                onChange={(e) => setForm((p) => ({ ...p, capital_initial: parseFloat(e.target.value) }))}
              />
            </Field>
            <Field label="Risque par trade (%)">
              <input
                style={s.input}
                type="number"
                step="0.1"
                value={form.risque_par_trade}
                onChange={(e) => setForm((p) => ({ ...p, risque_par_trade: parseFloat(e.target.value) }))}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ padding: "20px" }}>
          <p style={s.cardSectionLabel}>Style de trading</p>
          <OptionGrid
            options={styles_trading.map((style) => ({
              value: style,
              label: styleLabels[style].label,
              desc: styleLabels[style].desc,
            }))}
            value={form.style_de_trading}
            onChange={(value) => setForm((p) => ({ ...p, style_de_trading: value }))}
          />
        </div>
      </Card>

      <Card>
        <div style={{ padding: "20px" }}>
          <p style={s.cardSectionLabel}>Paires & instruments favoris</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", marginBottom: "10px" }}>
            <input
              style={{ ...s.input, flex: 1 }}
              value={pairInput}
              onChange={(e) => setPairInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPair()}
              placeholder="EUR/USD, BTC, US30..."
            />
            <button onClick={addPair} style={s.addBtn}>Ajouter</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {form.paires_favorites.map((pair) => (
              <span key={pair} style={s.tag}>
                {pair}
                <button onClick={() => removePair(pair)} style={s.tagX}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div style={s.inlineNote}>
            Ces préférences servent à contextualiser les analyses et les vues de performance.
          </div>
        </div>
      </Card>

      <SaveButton label="Sauvegarder les préférences trading" onClick={handleSave} fullWidth />
      <StatusMsg status={status} />
    </div>
  );
}

// ─── IA ───────────────────────────────────────────────────────────────────────

function IASection({ settings, onUpdate }) {
  const [form, setForm] = useState({
    mode_coaching: settings?.mode_coaching || "normal",
    domaine_de_focus: settings?.domaine_de_focus || "technique",
  });
  const [status, setStatus] = useState(null);

  async function handleSave() {
    try {
      const updated = await updateSettings(form);
      onUpdate(updated);
      setStatus({ type: "success", msg: "Préférences IA sauvegardées." });
      return true;
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
      return false;
    }
  }

  const coachOptions = [
    { value: "strict", label: "Strict", desc: "Direct, exigeant, zéro complaisance." },
    { value: "normal", label: "Équilibré", desc: "Rigueur et encouragement." },
    { value: "encourageant", label: "Bienveillant", desc: "Focus sur la progression." },
  ];

  const focusOptions = [
    { value: "technique", label: "Technique", desc: "Setup, entrée, SL/TP, R:R" },
    { value: "psychologie", label: "Psychologie", desc: "Émotions et biais cognitifs" },
    { value: "discipline", label: "Discipline", desc: "Consistency et respect du plan" },
  ];

  return (
    <div style={s.sections}>
      <SectionHeader title="Intelligence Artificielle" subtitle="Personnalisez le comportement de votre coach IA" />

      <Card>
        <div style={{ padding: "20px" }}>
          <p style={s.cardSectionLabel}>Ton du coaching</p>
          <p style={{ color: "#3B4B6B", fontSize: "0.78rem", margin: "4px 0 14px" }}>
            Définit la rigueur et le style de feedback de l'IA sur vos trades.
          </p>
          <OptionGrid
            options={coachOptions}
            value={form.mode_coaching}
            onChange={(value) => setForm((p) => ({ ...p, mode_coaching: value }))}
          />
        </div>
      </Card>

      <Card>
        <div style={{ padding: "20px" }}>
          <p style={s.cardSectionLabel}>Domaine de focus prioritaire</p>
          <p style={{ color: "#3B4B6B", fontSize: "0.78rem", margin: "4px 0 14px" }}>
            L'IA mettra l'accent sur ce domaine dans chaque analyse.
          </p>
          <OptionGrid
            options={focusOptions}
            value={form.domaine_de_focus}
            onChange={(value) => setForm((p) => ({ ...p, domaine_de_focus: value }))}
          />
        </div>
      </Card>

      <SaveButton label="Sauvegarder les préférences IA" onClick={handleSave} fullWidth />
      <StatusMsg status={status} />
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

function AppSection({ settings, onUpdate }) {
  const [form, setForm] = useState({
    theme: settings?.theme || "sombre",
    email_notifications: settings?.email_notifications ?? true,
    email_frequency: settings?.email_frequency || "normal",
  });
  const [status, setStatus] = useState(null);

  async function handleSave() {
    try {
      const updated = await updateSettings({
        theme: form.theme,
        email_notifications: form.email_notifications,
        email_frequency: form.email_frequency,
      });
      onUpdate(updated);
      setStatus({ type: "success", msg: "Paramètres sauvegardés." });
      return true;
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
      return false;
    }
  }

  return (
    <div style={s.sections}>
      <SectionHeader title="Application" subtitle="Préférences d'affichage et de communication" />

      <Card>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "0" }}>
          {/* Thème */}
          <div style={s.settingRow}>
            <div style={s.settingRowLeft}>
              <Moon size={15} color="#3B82F6" />
              <div>
                <p style={s.settingRowTitle}>Thème</p>
                <p style={s.settingRowDesc}>Thème clair disponible prochainement</p>
              </div>
            </div>
            <div style={{
              padding: "4px 12px",
              borderRadius: "6px",
              backgroundColor: "#0F2040",
              border: "1px solid #1A3060",
              color: "#60A5FA",
              fontSize: "0.75rem",
              fontWeight: "600",
            }}>
              Sombre
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ padding: "20px" }}>
          <p style={s.cardSectionLabel}>Emails & communications</p>
          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "0" }}>
            <div style={s.settingRow}>
              <div style={s.settingRowLeft}>
                <Mail size={15} color="#3B82F6" />
                <div>
                  <p style={s.settingRowTitle}>Emails de rétention</p>
                  <p style={s.settingRowDesc}>Rappels, conseils et séquence d'onboarding</p>
                </div>
              </div>
              <Toggle
                value={form.email_notifications}
                onChange={() => setForm((p) => ({ ...p, email_notifications: !p.email_notifications }))}
              />
            </div>
            <div style={s.rowDivider} />
            <div style={s.settingRow}>
              <div style={s.settingRowLeft}>
                <Clock size={15} color="#3B82F6" />
                <div>
                  <p style={s.settingRowTitle}>Fréquence</p>
                  <p style={s.settingRowDesc}>Cadence des emails automatiques</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { value: "normal", label: "Normal" },
                  { value: "minimal", label: "Minimal" },
                  { value: "none", label: "Aucun" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setForm((p) => ({ ...p, email_frequency: value }))}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "7px",
                      border: `1px solid ${form.email_frequency === value ? "#3B82F6" : "#1A2740"}`,
                      backgroundColor: form.email_frequency === value ? "#0F2040" : "transparent",
                      color: form.email_frequency === value ? "#60A5FA" : "#4B607A",
                      fontSize: "0.72rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <SaveButton label="Sauvegarder" onClick={handleSave} fullWidth />
      <StatusMsg status={status} />
    </div>
  );
}

// ─── FACTURATION ──────────────────────────────────────────────────────────────

function FacturationSection({ settings, onUpdate }) {
  const { isPremium } = usePlan();
  const [cancelling, setCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalStatus, setPortalStatus] = useState(null);

  const cancellationScheduled = settings?.cancel_at_period_end === true;
  const periodEnd = settings?.subscription_current_period_end
    ? new Date(settings.subscription_current_period_end).toLocaleDateString("fr-FR")
    : null;
  const scheduledStatus = cancellationScheduled
    ? {
        type: "success",
        msg: periodEnd
          ? `Annulation planifiée. Votre accès Premium reste actif jusqu'au ${periodEnd}.`
          : "Annulation planifiée. Votre accès Premium reste actif jusqu'à la fin de la période.",
      }
    : null;

  async function handleCancel() {
    setCancelling(true);
    setCancelStatus(null);
    try {
      const data = await apiFetch("/cancel-subscription", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const nextPeriodEnd = data.current_period_end
        ? new Date(data.current_period_end * 1000).toISOString()
        : settings?.subscription_current_period_end || null;
      onUpdate?.({
        cancel_at_period_end: true,
        subscription_current_period_end: nextPeriodEnd,
      });
      setCancelStatus({
        type: "success",
        msg: nextPeriodEnd
          ? `Annulation planifiée. Votre accès Premium reste actif jusqu'au ${new Date(nextPeriodEnd).toLocaleDateString("fr-FR")}.`
          : "Annulation planifiée. Votre accès Premium reste actif jusqu'à la fin de la période.",
      });
    } catch (err) {
      setCancelStatus({ type: "error", msg: err.message });
    } finally {
      setCancelling(false);
    }
  }

  async function handleOpenPortal() {
    setPortalLoading(true);
    setPortalStatus(null);
    try {
      const data = await apiFetch("/create-billing-portal-session", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!data?.url) throw new Error("URL Stripe introuvable.");
      window.location.href = data.url;
    } catch (err) {
      setPortalStatus({ type: "error", msg: err.message });
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div style={s.sections}>
      <SectionHeader title="Abonnement" subtitle="Gérez votre plan et vos accès" />

      {/* Plan actuel */}
      <Card>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: isPremium ? "#1A1200" : "#0A1628",
                border: `1px solid ${isPremium ? "#F59E0B33" : "#1A2740"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {isPremium ? <Star size={18} color="#F59E0B" /> : <Zap size={18} color="#3B82F6" />}
              </div>
              <div>
                <p style={{ color: "#E8EDF5", fontWeight: "700", fontSize: "0.95rem", margin: "0 0 2px" }}>
                  {isPremium ? "MySmartJournal Premium" : "Plan Gratuit"}
                </p>
                <p style={{ color: "#4B607A", fontSize: "0.78rem", margin: 0 }}>
                  {isPremium ? "Toutes les fonctionnalités débloquées" : "3 analyses IA par jour"}
                </p>
              </div>
            </div>
            <span style={{
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "0.68rem",
              fontWeight: "700",
              letterSpacing: "0.05em",
              backgroundColor: isPremium ? "#1A100044" : "#0A162844",
              border: `1px solid ${isPremium ? "#F59E0B44" : "#1A274044"}`,
              color: isPremium ? "#F59E0B" : "#3B82F6",
            }}>
              {isPremium ? "PREMIUM" : "GRATUIT"}
            </span>
          </div>

          {isPremium && (
            <>
              <div style={{ ...s.rowDivider, marginTop: "16px", marginBottom: "16px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {[
                  "Analyses IA Premium",
                  "Questions de réflexion personnalisées",
                  "Plan d'action détaillé",
                  "Support prioritaire",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#10B98120", border: "1px solid #10B98133", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={8} color="#10B981" />
                    </div>
                    <span style={{ color: "#6B7FA3", fontSize: "0.78rem" }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <StatusMsg status={portalStatus || cancelStatus || scheduledStatus} />

          {isPremium && (
            <div style={s.subscriptionActionRow}>
              {settings?.stripe_customer_id && (
                <button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  style={{ ...s.cancelBtn, minWidth: "180px" }}
                >
                  {portalLoading ? "Ouverture..." : "Gérer la facturation"}
                </button>
              )}
              <button
                onClick={handleCancel}
                disabled={cancelling || cancellationScheduled}
                style={s.ghostDangerBtn}
              >
                {cancellationScheduled ? "Annulation planifiée" : cancelling ? "Annulation..." : "Annuler l'abonnement"}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* CTA Upgrade si Free */}
      {!isPremium && (
        <div style={s.upgradeCard}>
          <div style={s.upgradeCardGlow} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "#1A100044", border: "1px solid #F59E0B33", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={16} color="#F59E0B" />
              </div>
              <div>
                <p style={{ color: "#E8EDF5", fontWeight: "700", fontSize: "0.95rem", margin: 0 }}>
                  Passer à Premium
                </p>
                <p style={{ color: "#6B7FA3", fontSize: "0.75rem", margin: 0 }}>
                  Débloquez tout le potentiel de votre journal
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span style={{ color: "#F59E0B", fontSize: "1.4rem", fontWeight: "800" }}>7.99€</span>
                <span style={{ color: "#4B607A", fontSize: "0.75rem" }}> /mois</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
              {[
                "Analyses IA Premium",
                "Questions de réflexion",
                "Plan d'action détaillé",
                "Coach IA personnalisé",
                "Support prioritaire",
                "Export bientôt disponible",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <Check size={11} color="#10B981" />
                  <span style={{ color: "#94A3B8", fontSize: "0.78rem" }}>{f}</span>
                </div>
              ))}
            </div>

            <UpgradeButton />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUPPORT ──────────────────────────────────────────────────────────────────

function SupportSection() {
  return (
    <div style={s.sections}>
      <SectionHeader title="Support" subtitle="Nous sommes là pour vous aider" />

      <Card>
        <div style={{ padding: "4px 0" }}>
          <SupportRow
            icon={<Headphones size={15} color="#3B82F6" />}
            title="Contacter le support"
            desc="Réponse sous 24h"
            action={() => window.open("mailto:support@mysmartjournal.org", "_blank")}
            actionLabel="Envoyer un email"
          />
          <div style={s.rowDivider} />
          <SupportRow
            icon={<Bug size={15} color="#F59E0B" />}
            title="Signaler un bug"
            desc="Aidez-nous à améliorer l'application"
            action={() => window.open("mailto:bugs@mysmartjournal.org?subject=Bug Report", "_blank")}
            actionLabel="Signaler"
          />
          <div style={s.rowDivider} />
          <SupportRow
            icon={<MessageSquare size={15} color="#10B981" />}
            title="Feedback produit"
            desc="Partager un retour sur l'expérience"
            action={() => window.open("mailto:feedback@mysmartjournal.org?subject=Feedback%20MySmartJournal", "_blank")}
            actionLabel="Partager"
          />
          <div style={s.rowDivider} />
          <SupportRow
            icon={<Lightbulb size={15} color="#A78BFA" />}
            title="Suggestion d'amélioration"
            desc="Proposer une idée pour le produit"
            action={() => window.open("mailto:ideas@mysmartjournal.org?subject=Suggestion", "_blank")}
            actionLabel="Suggérer"
          />
        </div>
      </Card>

      <div style={{ padding: "16px 20px", backgroundColor: "#080E1A", borderRadius: "10px", border: "1px solid #0F1E30" }}>
        <p style={{ color: "#3B4B6B", fontSize: "0.75rem", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
          MySmartJournal v1.0 · mysmartjournal.org<br />
          Ce service ne constitue pas un conseil financier. Trading involves risk of loss.
        </p>
      </div>
    </div>
  );
}

function SupportRow({ icon, title, desc, action, actionLabel }) {
  return (
    <div style={{ ...s.settingRow, padding: "14px 20px" }}>
      <div style={s.settingRowLeft}>
        {icon}
        <div>
          <p style={s.settingRowTitle}>{title}</p>
          <p style={s.settingRowDesc}>{desc}</p>
        </div>
      </div>
      <button
        onClick={action}
        style={{
          padding: "6px 14px",
          borderRadius: "7px",
          border: "1px solid #1A2740",
          backgroundColor: "transparent",
          color: "#6B7FA3",
          fontSize: "0.75rem",
          fontWeight: "500",
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#E8EDF5"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1A2740"; e.currentTarget.style.color = "#6B7FA3"; }}
      >
        {actionLabel}
        <ArrowRight size={11} />
      </button>
    </div>
  );
}

// ─── COMPOSANTS PARTAGÉS ──────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      <p style={{ color: "#4B607A", fontSize: "0.82rem", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      backgroundColor: "#0C1422",
      borderRadius: "8px",
      border: "1px solid #111C2E",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

function CardRow({ icon, title, description, children }) {
  return (
    <div style={{ padding: "20px" }}>
      <div style={s.cardRowHeader}>
        <div style={s.cardRowIconWrap}>{icon}</div>
        <div>
          <p style={s.cardRowTitle}>{title}</p>
          <p style={s.cardRowDesc}>{description}</p>
        </div>
      </div>
      <div style={{ marginTop: "14px" }}>{children}</div>
    </div>
  );
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div style={s.optionGrid}>
      {options.map(({ value: optionValue, label, desc }) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            style={{
              ...s.optionCard,
              borderColor: active ? "#3B82F6" : "#1A2740",
              backgroundColor: active ? "#0F2040" : "#080E1A",
            }}
          >
            <span style={s.optionCardHeader}>
              <span style={{ color: active ? "#E8EDF5" : "#94A3B8", fontWeight: "650", fontSize: "0.84rem" }}>
                {label}
              </span>
              {active && (
                <span style={s.optionCheck}>
                  <Check size={9} color="#fff" />
                </span>
              )}
            </span>
            <span style={s.optionDesc}>{desc}</span>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: "42px",
        height: "24px",
        borderRadius: "999px",
        backgroundColor: value ? "#2563EB" : "#1A2740",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        flexShrink: 0,
        border: `1px solid ${value ? "#3B82F660" : "#263550"}`,
      }}
    >
      <div style={{
        position: "absolute",
        top: "3px",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        backgroundColor: value ? "#fff" : "#4B607A",
        transform: value ? "translateX(21px)" : "translateX(3px)",
        transition: "transform 0.2s, background-color 0.2s",
        boxShadow: value ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
      }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={s.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ label = "Sauvegarder", onClick, fullWidth, compact, style: extraStyle }) {
  const [saved, setSaved] = useState(false);
  async function handle() {
    const result = await onClick();
    if (result === false) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <button
      onClick={handle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: compact ? "7px 16px" : "9px 22px",
        backgroundColor: saved ? "#064E3B" : "#2563EB",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "600",
        fontSize: "0.82rem",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        width: fullWidth ? "100%" : "auto",
        justifyContent: fullWidth ? "center" : "flex-start",
        transition: "background-color 0.2s",
        ...extraStyle,
      }}
    >
      {saved ? <><Check size={13} /> Sauvegardé</> : label}
    </button>
  );
}

function StatusMsg({ status }) {
  if (!status) return null;
  const isSuccess = status.type === "success";
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      width: isSuccess ? "fit-content" : "100%",
      maxWidth: "100%",
      margin: isSuccess ? "12px auto 0" : "10px 0 0",
      padding: isSuccess ? "7px 14px" : "9px 12px",
      borderRadius: isSuccess ? "999px" : "8px",
      border: "1px solid",
      fontSize: "0.78rem",
      fontWeight: "650",
      textAlign: "center",
      backgroundColor: isSuccess ? "#071A13" : "#450A0A18",
      borderColor: isSuccess ? "#10B9812E" : "#EF444433",
      color: isSuccess ? "#54D799" : "#EF4444",
      boxShadow: isSuccess ? "0 8px 24px rgba(16, 185, 129, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
    }}>
      <span style={{
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: isSuccess ? "#10B9811F" : "transparent",
        border: isSuccess ? "1px solid #10B98135" : "none",
      }}>
        {isSuccess ? <Check size={10} /> : <AlertCircle size={12} />}
      </span>
      <span>{status.msg}</span>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = {
  page: {
    padding: "36px 32px",
    maxWidth: "1020px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "12px",
  },
  pageHeader: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#E8EDF5",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    color: "#4B607A",
    fontSize: "0.875rem",
    margin: 0,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "24px",
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
    backgroundColor: "#0C1422",
    border: "1px solid #111C2E",
    borderRadius: "8px",
    padding: "12px 14px",
  },
  summaryIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#0F1E30",
    border: "1px solid #1A2740",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  summaryLabel: {
    color: "#3B4B6B",
    fontSize: "0.68rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 2px",
  },
  summaryValue: {
    color: "#C8D5E8",
    fontSize: "0.84rem",
    fontWeight: "650",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(198px, 220px) minmax(0, 1fr)",
    gap: "24px",
    alignItems: "start",
  },
  sidebar: {
    backgroundColor: "#0C1422",
    borderRadius: "8px",
    border: "1px solid #111C2E",
    overflow: "hidden",
    position: "sticky",
    top: "80px",
    display: "flex",
    flexDirection: "column",
  },
  sidebarInner: {
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
  sidebarBtn: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    padding: "10px 11px",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    fontFamily: "'Inter', sans-serif",
    textAlign: "left",
    transition: "all 0.12s",
    letterSpacing: "-0.01em",
  },
  sidebarLabel: {
    display: "block",
    lineHeight: "1.2",
  },
  sidebarDesc: {
    display: "block",
    color: "#3B4B6B",
    fontSize: "0.68rem",
    fontWeight: "500",
    lineHeight: "1.25",
    marginTop: "2px",
  },
  sidebarLegal: {
    borderTop: "1px solid #0F1E30",
    padding: "12px 12px 14px",
  },
  sidebarLegalTitle: {
    fontSize: "0.62rem",
    fontWeight: "700",
    color: "#2A3A50",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 8px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
  },
  profilePanel: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px 20px",
  },
  profileAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "8px",
    backgroundColor: "#0F1E30",
    border: "1px solid #1A2740",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileTitle: {
    color: "#E8EDF5",
    fontWeight: "700",
    fontSize: "0.95rem",
    margin: "0 0 2px",
  },
  profileMeta: {
    color: "#6B7FA3",
    fontSize: "0.8rem",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  securityBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginLeft: "auto",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #10B98133",
    backgroundColor: "#064E3B18",
    color: "#10B981",
    fontSize: "0.72rem",
    fontWeight: "650",
    whiteSpace: "nowrap",
  },
  localDivider: {
    height: "1px",
    backgroundColor: "#0F1E30",
    margin: "18px 0",
  },
  fieldLabel: {
    fontSize: "0.68rem",
    fontWeight: "600",
    color: "#4B607A",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  input: {
    backgroundColor: "#080E1A",
    border: "1px solid #1A2740",
    borderRadius: "8px",
    padding: "9px 12px",
    color: "#E8EDF5",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.15s",
  },
  cardRowHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  cardRowIconWrap: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#0F1E30",
    border: "1px solid #1A2740",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  },
  cardRowTitle: {
    color: "#E8EDF5",
    fontWeight: "600",
    fontSize: "0.875rem",
    margin: "0 0 2px",
  },
  cardRowDesc: {
    color: "#4B607A",
    fontSize: "0.75rem",
    margin: 0,
  },
  cardSectionLabel: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#3B4B6B",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: 0,
  },
  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 20px",
  },
  settingRowLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: 0,
  },
  settingRowTitle: {
    color: "#C8D5E8",
    fontWeight: "500",
    fontSize: "0.85rem",
    margin: "0 0 2px",
  },
  settingRowDesc: {
    color: "#3B4B6B",
    fontSize: "0.72rem",
    margin: 0,
  },
  rowDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, #0F1E30 20%, #0F1E30 80%, transparent)",
    margin: "0 20px",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "8px",
    marginTop: "12px",
  },
  optionCard: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minHeight: "82px",
    padding: "13px",
    borderRadius: "8px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
    fontFamily: "'Inter', sans-serif",
  },
  optionCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "8px",
  },
  optionCheck: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#3B82F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionDesc: {
    color: "#4B607A",
    fontSize: "0.72rem",
    lineHeight: "1.4",
  },
  inlineNote: {
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #10233A",
    backgroundColor: "#08111F",
    color: "#4B607A",
    fontSize: "0.76rem",
    lineHeight: "1.45",
  },
  addBtn: {
    padding: "9px 16px",
    backgroundColor: "#0F1E30",
    border: "1px solid #1A2740",
    borderRadius: "8px",
    color: "#60A5FA",
    fontWeight: "600",
    fontSize: "0.82rem",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    backgroundColor: "#0F1E30",
    color: "#60A5FA",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "600",
    border: "1px solid #1A3060",
  },
  tagX: {
    background: "none",
    border: "none",
    color: "#3B5070",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    transition: "color 0.15s",
  },
  dangerZone: {
    borderRadius: "8px",
    border: "1px solid #2A0E0E",
    backgroundColor: "#0A0608",
    overflow: "hidden",
    marginTop: "8px",
  },
  dangerZoneHeader: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "12px 20px",
    borderBottom: "1px solid #1A0A0A",
    backgroundColor: "#0D0808",
  },
  dangerZoneTitle: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#EF4444",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  dangerZoneBody: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 20px",
  },
  dangerZoneLabel: {
    color: "#94A3B8",
    fontWeight: "500",
    fontSize: "0.85rem",
    margin: "0 0 3px",
  },
  dangerZoneDesc: {
    color: "#3B4B6B",
    fontSize: "0.75rem",
    margin: 0,
  },
  dangerBtn: {
    padding: "7px 16px",
    backgroundColor: "#1A0808",
    border: "1px solid #EF444433",
    borderRadius: "8px",
    color: "#EF4444",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  cancelBtn: {
    padding: "7px 14px",
    backgroundColor: "transparent",
    border: "1px solid #1A2740",
    borderRadius: "8px",
    color: "#4B607A",
    fontSize: "0.78rem",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  subscriptionActionRow: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
  },
  ghostDangerBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "220px",
    padding: "8px 18px",
    backgroundColor: "transparent",
    border: "1px solid #EF444422",
    borderRadius: "8px",
    color: "#EF4444",
    fontSize: "0.78rem",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.15s",
  },
  upgradeCard: {
    position: "relative",
    borderRadius: "8px",
    border: "1px solid #2A1A0044",
    background: "linear-gradient(135deg, #0D1220 0%, #0A0D18 100%)",
    padding: "24px",
    overflow: "hidden",
  },
  upgradeCardGlow: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #F59E0B08 0%, transparent 70%)",
    pointerEvents: "none",
  },
};
