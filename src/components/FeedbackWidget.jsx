import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { analytics } from "../lib/analytics.js";
import { ThumbsUp, ThumbsDown, Check, X, ChevronDown } from "lucide-react";

const FEEDBACK_STATE_KEY = "msj_analysis_feedback_state";
const FEEDBACK_PROMPT_INTERVAL = 7;
const FEEDBACK_COOLDOWN_DAYS = 7;

export default function FeedbackWidget({ tradeId, aiScore, pair, plan = "free" }) {
  const [rating, setRating] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackId, setFeedbackId] = useState(null);
  const [shouldShow, setShouldShow] = useState(false);
  const [form, setForm] = useState({
    what_was_useful: "",
    what_was_missing: "",
    suggestions: "",
  });

  useEffect(() => {
    const eventKey = tradeId || `${pair || "unknown"}-${aiScore || "na"}`;
    const now = Date.now();
    const state = readFeedbackState();
    const seenEvents = Array.isArray(state.seenEvents) ? state.seenEvents : [];
    let analysisCount = state.analysisCount || 0;

    if (!seenEvents.includes(eventKey)) {
      analysisCount += 1;
      seenEvents.push(eventKey);
    }

    const lastPromptAt = state.lastPromptAt || 0;
    const lastPromptCount = state.lastPromptCount || 0;
    const cooldownMs = FEEDBACK_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const promptDue =
      analysisCount >= FEEDBACK_PROMPT_INTERVAL &&
      analysisCount - lastPromptCount >= FEEDBACK_PROMPT_INTERVAL &&
      now - lastPromptAt >= cooldownMs;

    writeFeedbackState({
      ...state,
      analysisCount,
      seenEvents: seenEvents.slice(-40),
      ...(promptDue ? { lastPromptAt: now, lastPromptCount: analysisCount } : {}),
    });

    setShouldShow(promptDue);
  }, [tradeId, pair, aiScore]);

  function rememberFeedbackAction(action) {
    const state = readFeedbackState();
    writeFeedbackState({
      ...state,
      [`${action}At`]: Date.now(),
    });
  }

  async function handleRating(value) {
    setRating(value);
    setExpanded(true);

    // Track immédiatement le vote
    analytics[value === "positive" ? "feedbackPositive" : "feedbackNegative"]?.(pair, aiScore);

    // Sauvegarde le rating seul sans formulaire
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("analysis_feedback").insert([{
        user_id: user.id,
        trade_id: tradeId || null,
        rating: value,
        ai_score: aiScore,
        pair,
        plan,
      }]).select("id").single();

      if (error) throw error;
      setFeedbackId(data?.id || null);
      rememberFeedbackAction("rated");
    } catch (err) {
      console.error("Feedback rating error:", err.message);
    }
  }

  async function handleSubmit() {
    if (!rating) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Met à jour avec le commentaire
      if (!feedbackId) throw new Error("Feedback introuvable.");

      const { error } = await supabase
        .from("analysis_feedback")
        .update({
          what_was_useful: form.what_was_useful || null,
          what_was_missing: form.what_was_missing || null,
          suggestions: form.suggestions || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", feedbackId)
        .eq("user_id", user.id)
        .select("id")
        .single();

      if (error) throw error;

      analytics.feedbackSubmitted?.(pair, rating, aiScore);
      rememberFeedbackAction("submitted");
      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submit error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    rememberFeedbackAction("dismissed");
    setExpanded(false);
    setSubmitted(true);
  }

  if (!shouldShow) return null;

  if (submitted) {
    return (
      <div style={styles.submitted}>
        <Check size={14} color="#10B981" />
        <span style={{ color: "#10B981", fontSize: "0.82rem" }}>Merci pour votre retour</span>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.ratingRow}>
        <span style={styles.question}>Cette analyse vous a-t-elle aidé ?</span>
        <div style={styles.buttons}>
          <button
            onClick={() => handleRating("positive")}
            style={{
              ...styles.ratingBtn,
              backgroundColor: rating === "positive" ? "#064E3B" : "transparent",
              borderColor: rating === "positive" ? "#10B981" : "#1E2D45",
              color: rating === "positive" ? "#10B981" : "#6B7FA3",
            }}
          >
            <ThumbsUp size={14} />
            <span>Utile</span>
          </button>
          <button
            onClick={() => handleRating("negative")}
            style={{
              ...styles.ratingBtn,
              backgroundColor: rating === "negative" ? "#450A0A" : "transparent",
              borderColor: rating === "negative" ? "#EF4444" : "#1E2D45",
              color: rating === "negative" ? "#EF4444" : "#6B7FA3",
            }}
          >
            <ThumbsDown size={14} />
            <span>Peu utile</span>
          </button>
        </div>
      </div>

      {/* Formulaire optionnel */}
      {rating && !expanded && (
        <button onClick={() => setExpanded(true)} style={styles.expandBtn}>
          <ChevronDown size={13} /> Détailler votre retour (optionnel)
        </button>
      )}

      {expanded && (
        <div style={styles.form}>
          <div style={styles.formHeader}>
            <span style={styles.formTitle}>Détaillez votre retour</span>
            <button onClick={handleSkip} style={styles.skipBtn}>
              <X size={13} />
            </button>
          </div>

          {rating === "positive" && (
            <TextArea
              label="Qu'est-ce qui était particulièrement utile ?"
              placeholder="Ex: Le plan d'action était précis, l'analyse du setup était pertinente..."
              value={form.what_was_useful}
              onChange={(v) => setForm((p) => ({ ...p, what_was_useful: v }))}
            />
          )}

          {rating === "negative" && (
            <TextArea
              label="Qu'est-ce qui manquait ou était incorrect ?"
              placeholder="Ex: L'analyse ne correspondait pas au contexte de marché..."
              value={form.what_was_missing}
              onChange={(v) => setForm((p) => ({ ...p, what_was_missing: v }))}
            />
          )}

          <TextArea
            label="Suggestions d'amélioration (optionnel)"
            placeholder="Comment pourrions-nous améliorer cette analyse ?"
            value={form.suggestions}
            onChange={(v) => setForm((p) => ({ ...p, suggestions: v }))}
          />

          <div style={styles.formActions}>
            <button onClick={handleSkip} style={styles.cancelBtn}>Passer</button>
            <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function readFeedbackState() {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_STATE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeFeedbackState(state) {
  try {
    localStorage.setItem(FEEDBACK_STATE_KEY, JSON.stringify(state));
  } catch {
    // Le feedback reste optionnel si le stockage local est indisponible.
  }
}

function TextArea({ label, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={styles.fieldLabel}>{label}</label>
      <textarea
        style={styles.textarea}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    </div>
  );
}

const styles = {
  wrapper: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "16px", marginTop: "12px" },
  ratingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" },
  question: { color: "#6B7FA3", fontSize: "0.82rem" },
  buttons: { display: "flex", gap: "8px" },
  ratingBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "7px", border: "1px solid", fontSize: "0.78rem", fontWeight: "500", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" },
  expandBtn: { display: "inline-flex", alignItems: "center", gap: "5px", background: "none", border: "none", color: "#3B4B6B", fontSize: "0.75rem", cursor: "pointer", marginTop: "10px", fontFamily: "'Inter', sans-serif" },
  submitted: { display: "flex", alignItems: "center", gap: "7px", padding: "10px 14px", backgroundColor: "#064E3B22", border: "1px solid #10B98133", borderRadius: "8px", marginTop: "12px" },
  form: { marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  formTitle: { color: "#E8EDF5", fontSize: "0.82rem", fontWeight: "600" },
  skipBtn: { background: "none", border: "none", color: "#6B7FA3", cursor: "pointer", padding: "2px" },
  fieldLabel: { fontSize: "0.68rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.07em" },
  textarea: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "7px", padding: "9px 12px", color: "#E8EDF5", fontSize: "0.82rem", outline: "none", fontFamily: "'Inter', sans-serif", resize: "vertical", boxSizing: "border-box", width: "100%" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: "8px" },
  cancelBtn: { padding: "7px 16px", backgroundColor: "transparent", border: "1px solid #1E2D45", borderRadius: "7px", color: "#6B7FA3", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  submitBtn: { padding: "7px 16px", backgroundColor: "#3B82F6", border: "none", borderRadius: "7px", color: "#fff", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
};
