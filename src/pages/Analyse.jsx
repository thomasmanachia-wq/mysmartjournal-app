import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext";
import { getSettings } from "../lib/settingsService.js";
import { analytics } from "../lib/analytics.js";
import { captureAIError } from "../lib/monitoring.js";
import {
  DollarSign, Target, Activity, Brain,
  TrendingUp, TrendingDown, Loader, ArrowRight,
  Plus, X, ChevronDown
} from "lucide-react";

const EMOTIONS = ["Confiant", "Neutre", "Anxieux", "FOMO", "Revenge"];
const USER_PREFS_KEY = "analysis_preferences";
const ANALYSIS_DRAFT_KEY = "msj_analysis_draft_v1";
const ANALYSIS_PREFS_STORAGE_KEY = "msj_analysis_preferences_v1";

const MARKETS = [
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
  { value: "indices", label: "Indices" },
  { value: "actions", label: "Actions" },
  { value: "commodities", label: "Matières premières" },
];

const DEFAULT_INSTRUMENTS = {
  forex: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "USDCAD", "NZDUSD", "EURJPY", "GBPJPY", "EURGBP", "XAUUSD"],
  crypto: ["BTCUSD", "ETHUSD", "SOLUSD", "XRPUSD", "BNBUSD", "ADAUSD"],
  indices: ["US30", "NAS100", "SPX500", "DAX40", "CAC40"],
  actions: ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META"],
  commodities: ["XAUUSD", "XAGUSD", "WTI", "BRENT"],
};

const DEFAULT_ANALYSIS_TYPES = ["SMC", "ICT", "Price Action", "Supply & Demand", "Wyckoff", "Volume Profile"];

const DEFAULT_ANALYSIS_PREFS = {
  preferredMarket: "forex",
  customInstruments: {},
  hiddenInstruments: {},
  customSetups: [],
  customAnalysisTypes: [],
  hiddenAnalysisTypes: [],
};

function normalizeInstrument(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))];
}

function createDefaultForm() {
  return {
    date: new Date().toISOString().split("T")[0],
    market: "forex",
    pair: "",
    entryPrice: "",
    exitPrice: "",
    takeProfit: "",
    stopLoss: "",
    size: "0.01",
    timeframe: "",
    direction: "long",
    setup: "",
    analysisType: "",
    notes: "",
    risk: "",
    emotion: "",
  };
}

function readStorageJson(key) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorageJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // La page reste utilisable si le navigateur bloque le stockage local.
  }
}

function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore les environnements où le stockage local est indisponible.
  }
}

function getUserStorageKey(baseKey, userId) {
  return userId ? `${baseKey}:${userId}` : null;
}

function clearLegacyAnalysisStorage() {
  removeStorageItem(ANALYSIS_DRAFT_KEY);
  removeStorageItem(ANALYSIS_PREFS_STORAGE_KEY);
}

function readAnalysisDraft(userId) {
  const key = getUserStorageKey(ANALYSIS_DRAFT_KEY, userId);
  if (!key) return null;
  const draft = readStorageJson(key);
  if (!draft) return null;
  return { ...createDefaultForm(), ...draft };
}

function writeAnalysisDraft(userId, form) {
  const key = getUserStorageKey(ANALYSIS_DRAFT_KEY, userId);
  if (!key) return;
  writeStorageJson(key, form);
}

function readStoredAnalysisPrefs(userId) {
  const key = getUserStorageKey(ANALYSIS_PREFS_STORAGE_KEY, userId);
  if (!key) return {};
  return readStorageJson(key) || {};
}

function writeStoredAnalysisPrefs(userId, prefs) {
  const key = getUserStorageKey(ANALYSIS_PREFS_STORAGE_KEY, userId);
  if (!key) return;
  writeStorageJson(key, prefs);
}

function getAnalysisErrorMessage(error) {
  if (error?.status === 401) return "Session expirée. Reconnecte-toi puis relance l'analyse.";
  if (error?.status === 403) return "Accès refusé. Vérifie ton compte puis réessaie.";
  if (error?.status === 429) return error.message || "Trop de requêtes. Attends quelques instants puis réessaie.";
  if (error?.status >= 500) return "Le service d'analyse IA est momentanément indisponible. Réessaie dans quelques instants.";
  return error?.message || "Erreur lors de l'analyse. Réessaie dans quelques instants.";
}

export default function Analyse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState(null);
  const [analysisPrefs, setAnalysisPrefs] = useState(DEFAULT_ANALYSIS_PREFS);
  const [favoriteInstruments, setFavoriteInstruments] = useState([]);
  const [customInputs, setCustomInputs] = useState({ instrument: "", setup: "", analysisType: "" });
  const [openAdd, setOpenAdd] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const storageUserIdRef = useRef(null);
  const storageReadyRef = useRef(false);
  const formTouchedRef = useRef(false);
  const latestFormRef = useRef(createDefaultForm());
  const [form, setForm] = useState(() => latestFormRef.current);

  function updateForm(updater) {
    setForm((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      formTouchedRef.current = true;
      latestFormRef.current = next;
      if (storageReadyRef.current && storageUserIdRef.current) {
        writeAnalysisDraft(storageUserIdRef.current, next);
      }
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      storageReadyRef.current = false;
      storageUserIdRef.current = user?.id || null;
      setError(null);

      if (!user?.id) {
        const defaultForm = createDefaultForm();
        latestFormRef.current = defaultForm;
        formTouchedRef.current = false;
        setForm(defaultForm);
        setAnalysisPrefs(DEFAULT_ANALYSIS_PREFS);
        setFavoriteInstruments([]);
        return;
      }

      const defaultForm = createDefaultForm();
      latestFormRef.current = defaultForm;
      formTouchedRef.current = false;
      setForm(defaultForm);

      try {
        const settings = await getSettings().catch(() => null);
        if (cancelled) return;

        const savedPrefs = {
          ...(user?.user_metadata?.[USER_PREFS_KEY] || {}),
          ...readStoredAnalysisPrefs(user.id),
        };
        const nextPrefs = {
          preferredMarket: savedPrefs.preferredMarket || settings?.main_market || "forex",
          customInstruments: savedPrefs.customInstruments || {},
          hiddenInstruments: savedPrefs.hiddenInstruments || {},
          customSetups: savedPrefs.customSetups || [],
          customAnalysisTypes: savedPrefs.customAnalysisTypes || [],
          hiddenAnalysisTypes: savedPrefs.hiddenAnalysisTypes || [],
        };
        setAnalysisPrefs(nextPrefs);
        setFavoriteInstruments(settings?.paires_favorites || []);

        const draft = readAnalysisDraft(user.id);
        const preferredMarket = settings?.main_market || savedPrefs.preferredMarket || "forex";
        const safeMarket = MARKETS.some((market) => market.value === preferredMarket) ? preferredMarket : "forex";
        storageReadyRef.current = true;
        if (formTouchedRef.current) {
          writeAnalysisDraft(user.id, latestFormRef.current);
        } else {
          const nextForm = draft || { ...createDefaultForm(), market: safeMarket };
          latestFormRef.current = nextForm;
          setForm(nextForm);
        }
        clearLegacyAnalysisStorage();
      } catch {
        // La page reste utilisable même si les préférences ne sont pas encore disponibles.
        if (!cancelled) {
          storageReadyRef.current = true;
        }
      }
    }

    loadPreferences();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  function handleChange(e) {
    const { name, value } = e.target;
    updateForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMarketChange(e) {
    const market = e.target.value;
    updateForm((prev) => ({ ...prev, market, pair: "" }));
    persistAnalysisPrefs({ ...analysisPrefs, preferredMarket: market });
  }

  function persistAnalysisPrefs(nextPrefs) {
    const normalizedPrefs = {
      preferredMarket: nextPrefs.preferredMarket || form.market,
      customInstruments: nextPrefs.customInstruments || {},
      hiddenInstruments: nextPrefs.hiddenInstruments || {},
      customSetups: nextPrefs.customSetups || [],
      customAnalysisTypes: nextPrefs.customAnalysisTypes || [],
      hiddenAnalysisTypes: nextPrefs.hiddenAnalysisTypes || [],
    };
    setAnalysisPrefs(normalizedPrefs);
    if (storageReadyRef.current && storageUserIdRef.current) {
      writeStoredAnalysisPrefs(storageUserIdRef.current, normalizedPrefs);
    }
  }

  function addCustomInstrument() {
    const instrument = normalizeInstrument(customInputs.instrument);
    if (!instrument || !form.market) return;
    const current = analysisPrefs.customInstruments?.[form.market] || [];
    const hiddenForMarket = analysisPrefs.hiddenInstruments?.[form.market] || [];
    const nextPrefs = {
      ...analysisPrefs,
      customInstruments: {
        ...analysisPrefs.customInstruments,
        [form.market]: uniqueList([...current, instrument]),
      },
      hiddenInstruments: {
        ...analysisPrefs.hiddenInstruments,
        [form.market]: hiddenForMarket.filter((item) => item !== instrument),
      },
      preferredMarket: form.market,
    };
    updateForm((prev) => ({ ...prev, pair: instrument }));
    setCustomInputs((prev) => ({ ...prev, instrument: "" }));
    setOpenAdd(null);
    persistAnalysisPrefs(nextPrefs);
  }

  function addCustomSetup() {
    const setup = customInputs.setup.trim();
    if (!setup) return;
    const nextPrefs = { ...analysisPrefs, customSetups: uniqueList([...(analysisPrefs.customSetups || []), setup]) };
    updateForm((prev) => ({ ...prev, setup }));
    setCustomInputs((prev) => ({ ...prev, setup: "" }));
    setOpenAdd(null);
    persistAnalysisPrefs(nextPrefs);
  }

  function addCustomAnalysisType() {
    const analysisType = customInputs.analysisType.trim();
    if (!analysisType) return;
    const nextPrefs = {
      ...analysisPrefs,
      customAnalysisTypes: uniqueList([...(analysisPrefs.customAnalysisTypes || []), analysisType]),
      hiddenAnalysisTypes: (analysisPrefs.hiddenAnalysisTypes || []).filter((item) => item !== analysisType),
    };
    updateForm((prev) => ({ ...prev, analysisType }));
    setCustomInputs((prev) => ({ ...prev, analysisType: "" }));
    setOpenAdd(null);
    persistAnalysisPrefs(nextPrefs);
  }

  function removeInstrumentOption(value) {
    const instrument = normalizeInstrument(value);
    if (!instrument || !form.market) return;

    const customForMarket = analysisPrefs.customInstruments?.[form.market] || [];
    const defaultForMarket = DEFAULT_INSTRUMENTS[form.market] || [];
    const favoriteForMarket = favoriteInstruments.map((item) => normalizeInstrument(String(item || "")));
    const hiddenForMarket = analysisPrefs.hiddenInstruments?.[form.market] || [];
    const shouldHide = defaultForMarket.includes(instrument) || favoriteForMarket.includes(instrument);

    const nextPrefs = {
      ...analysisPrefs,
      customInstruments: {
        ...analysisPrefs.customInstruments,
        [form.market]: customForMarket.filter((item) => item !== instrument),
      },
      hiddenInstruments: {
        ...analysisPrefs.hiddenInstruments,
        [form.market]: shouldHide ? uniqueList([...hiddenForMarket, instrument]) : hiddenForMarket,
      },
    };

    updateForm((prev) => ({ ...prev, pair: prev.pair === instrument ? "" : prev.pair }));
    persistAnalysisPrefs(nextPrefs);
  }

  function removeSetupOption(value) {
    const nextPrefs = {
      ...analysisPrefs,
      customSetups: (analysisPrefs.customSetups || []).filter((item) => item !== value),
    };
    updateForm((prev) => ({ ...prev, setup: prev.setup === value ? "" : prev.setup }));
    persistAnalysisPrefs(nextPrefs);
  }

  function removeAnalysisTypeOption(value) {
    const customMethods = analysisPrefs.customAnalysisTypes || [];
    const hiddenMethods = analysisPrefs.hiddenAnalysisTypes || [];
    const isDefaultMethod = DEFAULT_ANALYSIS_TYPES.includes(value);
    const nextPrefs = {
      ...analysisPrefs,
      customAnalysisTypes: customMethods.filter((item) => item !== value),
      hiddenAnalysisTypes: isDefaultMethod ? uniqueList([...hiddenMethods, value]) : hiddenMethods,
    };
    updateForm((prev) => ({ ...prev, analysisType: prev.analysisType === value ? "" : prev.analysisType }));
    persistAnalysisPrefs(nextPrefs);
  }

  function selectEmotion(emotion) {
    updateForm((prev) => ({ ...prev, emotion: prev.emotion === emotion ? "" : emotion }));
  }

  const rr = (() => {
    const e = parseFloat(form.entryPrice);
    const sl = parseFloat(form.stopLoss);
    const tp = parseFloat(form.takeProfit);
    if (!e || !sl || !tp) return null;
    const risk = Math.abs(e - sl);
    const reward = Math.abs(tp - e);
    return risk > 0 ? (reward / risk).toFixed(2) : null;
  })();

  const isDisabled = !form.pair || !form.entryPrice || !form.stopLoss || !form.takeProfit || loading;
  const hiddenInstruments = analysisPrefs.hiddenInstruments?.[form.market] || [];
  const instrumentOptions = uniqueList([
    ...(DEFAULT_INSTRUMENTS[form.market] || []),
    ...(analysisPrefs.customInstruments?.[form.market] || []),
    ...favoriteInstruments.map((instrument) => normalizeInstrument(String(instrument || ""))),
  ]).filter((instrument) => !hiddenInstruments.includes(instrument));
  const setupOptions = uniqueList([...(analysisPrefs.customSetups || [])]);
  const hiddenAnalysisTypes = analysisPrefs.hiddenAnalysisTypes || [];
  const analysisTypeOptions = uniqueList([...DEFAULT_ANALYSIS_TYPES, ...(analysisPrefs.customAnalysisTypes || [])])
    .filter((method) => !hiddenAnalysisTypes.includes(method));

  async function handleSubmit() {
    if (isDisabled) return;
    setLoading(true);
    setError(null);
    analytics.analysisStarted(form.pair, form.direction);
    const marketLabel = MARKETS.find((market) => market.value === form.market)?.label || form.market;
    const analysisContext = [
      marketLabel && `Marché: ${marketLabel}`,
      form.timeframe && `Timeframe: ${form.timeframe}`,
      form.setup && `Setup: ${form.setup}`,
      form.analysisType && `Type d'analyse: ${form.analysisType}`,
      form.emotion && `Émotion pré-trade: ${form.emotion}`,
      form.size && `Taille: ${form.size}`,
      form.exitPrice && `Prix de sortie: ${form.exitPrice}`,
      form.notes && `Notes: ${form.notes}`,
    ].filter(Boolean).join("\n");
    try {
      const data = await apiFetch("/api/analyzeTrade", {
        method: "POST",
        body: JSON.stringify({
          market: form.market,
          pair: form.pair,
          date: form.date,
          direction: form.direction,
          entry: form.entryPrice,
          exitPrice: form.exitPrice,
          stopLoss: form.stopLoss,
          takeProfit: form.takeProfit,
          size: form.size,
          timeframe: form.timeframe,
          setup: form.setup,
          analysisType: form.analysisType,
          emotion: form.emotion,
          riskPercent: form.risk,
          notes: analysisContext,
        }),
      });

      if (data.limit_reached) {
        analytics.premiumClicked("analysis_limit");
        navigate("/settings?section=facturation");
        return;
      }

      analytics.analysisGenerated(form.pair, data?.score?.overall, data?.plan || (data?.is_limited ? "free" : "premium"), data?.is_limited);
      navigate("/reponse-ia", { state: { form, aiData: data } });

      // Marque première analyse et activité
      try {
        await apiFetch("/mark-first-analysis", {
          method: "POST",
          body: JSON.stringify({ pair: form.pair, score: data?.score?.overall }),
        });
        await apiFetch("/track-activity", { method: "POST", body: JSON.stringify({}) });
      } catch { /* silencieux */ }

    } catch (err) {
      if (err?.payload?.limit_reached) {
        analytics.premiumClicked("analysis_limit");
        navigate("/settings?section=facturation");
        return;
      }
      captureAIError(form.pair, err.message);
      analytics.aiError(form.pair, err.message);
      setError(getAnalysisErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (name) => ({
    ...styles.input,
    borderColor: focusedField === name ? "#3B82F6" : "#1E2D45",
    boxShadow: focusedField === name ? "0 0 0 3px rgba(59,130,246,0.08)" : "none",
  });

  const fp = (name) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField(null),
  });

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>La maîtrise commence par la clarté.</h1>
        <p style={styles.heroSub}>Renseigne ton trade, l'IA s'occupe du reste.</p>
      </div>

      {rr && (
        <div style={styles.rrBanner}>
          <Activity size={13} color="#3B82F6" />
          <span style={styles.rrText}>R:R calculé en temps réel</span>
          <span style={{ ...styles.rrValue, color: rr >= 2 ? "#10B981" : rr >= 1 ? "#F59E0B" : "#EF4444" }}>1:{rr}</span>
        </div>
      )}

      <div style={styles.mainGrid}>
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrap}><DollarSign size={13} color="#3B82F6" /></div>
              <h2 style={styles.cardTitle}>Données du Marché</h2>
            </div>
            <div style={styles.fieldsGrid2}>
              <Field label="Date du Trade"><input style={inputStyle("date")} type="date" name="date" value={form.date} onChange={handleChange} {...fp("date")} /></Field>
              <Field label="Marché & Instrument">
                <div style={styles.marketInstrumentRow}>
                  <select
                    style={inputStyle("market")}
                    name="market"
                    value={form.market}
                    onChange={handleMarketChange}
                    {...fp("market")}
                  >
                    <option value="">Marché</option>
                    {MARKETS.map((market) => <option key={market.value} value={market.value}>{market.label}</option>)}
                  </select>
                  <DropdownSelect
                    name="pair"
                    value={form.pair}
                    placeholder="Instrument"
                    options={instrumentOptions}
                    inputStyle={inputStyle}
                    fp={fp}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    onSelect={(value) => updateForm((prev) => ({ ...prev, pair: value }))}
                    onRemove={removeInstrumentOption}
                  />
                </div>
                <InlineAdd
                  type="instrument"
                  open={openAdd === "instrument"}
                  value={customInputs.instrument}
                  placeholder="Ex: GER40"
                  buttonLabel="Ajouter un instrument"
                  onOpen={() => setOpenAdd(openAdd === "instrument" ? null : "instrument")}
                  onChange={(value) => setCustomInputs((prev) => ({ ...prev, instrument: value }))}
                  onAdd={addCustomInstrument}
                />
              </Field>
              <Field label="Prix d'Entrée"><input style={inputStyle("entryPrice")} type="number" step="any" name="entryPrice" value={form.entryPrice} onChange={handleChange} placeholder="0.00000" {...fp("entryPrice")} /></Field>
              <Field label="Prix de Sortie"><input style={inputStyle("exitPrice")} type="number" step="any" name="exitPrice" value={form.exitPrice} onChange={handleChange} placeholder="0.00000" {...fp("exitPrice")} /></Field>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrap}><Target size={13} color="#3B82F6" /></div>
              <h2 style={styles.cardTitle}>Objectifs & Exécution</h2>
            </div>
            <div style={styles.fieldsGrid2}>
              <Field label="Take-Profit"><input style={inputStyle("takeProfit")} type="number" step="any" name="takeProfit" value={form.takeProfit} onChange={handleChange} placeholder="Cible" {...fp("takeProfit")} /></Field>
              <Field label="Stop-Loss"><input style={inputStyle("stopLoss")} type="number" step="any" name="stopLoss" value={form.stopLoss} onChange={handleChange} placeholder="Protection" {...fp("stopLoss")} /></Field>
              <Field label="Taille (Lots)"><input style={inputStyle("size")} type="number" step="any" name="size" value={form.size} onChange={handleChange} placeholder="0.01" {...fp("size")} /></Field>
              <Field label="Timeframe"><input style={inputStyle("timeframe")} name="timeframe" value={form.timeframe} onChange={handleChange} placeholder="H4, M15..." {...fp("timeframe")} /></Field>
              <Field label="Direction" style={{ gridColumn: "1 / -1" }}>
                <div style={styles.dirWrapper}>
                  <button type="button" onClick={() => updateForm((p) => ({ ...p, direction: "long" }))} style={{ ...styles.dirBtn, backgroundColor: form.direction === "long" ? "#064E3B" : "#0D1421", color: form.direction === "long" ? "#10B981" : "#6B7FA3", border: form.direction === "long" ? "1px solid #10B98155" : "1px solid #1E2D45", boxShadow: form.direction === "long" ? "0 0 12px rgba(16,185,129,0.15)" : "none" }}>
                    <TrendingUp size={13} /> LONG
                  </button>
                  <button type="button" onClick={() => updateForm((p) => ({ ...p, direction: "short" }))} style={{ ...styles.dirBtn, backgroundColor: form.direction === "short" ? "#450A0A" : "#0D1421", color: form.direction === "short" ? "#EF4444" : "#6B7FA3", border: form.direction === "short" ? "1px solid #EF444455" : "1px solid #1E2D45", boxShadow: form.direction === "short" ? "0 0 12px rgba(239,68,68,0.15)" : "none" }}>
                    <TrendingDown size={13} /> SHORT
                  </button>
                </div>
              </Field>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, display: "flex", flexDirection: "column" }}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconWrap}><Brain size={13} color="#3B82F6" /></div>
            <h2 style={styles.cardTitle}>Stratégie & Mental</h2>
          </div>
          <div style={{ ...styles.fields, flex: 1 }}>
            <SmartSelectField
              label="Setup"
              name="setup"
              value={form.setup}
              options={setupOptions}
              inputStyle={inputStyle}
              fp={fp}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              onSelect={(value) => updateForm((prev) => ({ ...prev, setup: value }))}
              onRemove={removeSetupOption}
              addProps={{
                type: "setup",
                open: openAdd === "setup",
                value: customInputs.setup,
                placeholder: "Ex: London Reversal",
                buttonLabel: "Ajouter mon setup",
                onOpen: () => setOpenAdd(openAdd === "setup" ? null : "setup"),
                onChange: (value) => setCustomInputs((prev) => ({ ...prev, setup: value })),
                onAdd: addCustomSetup,
              }}
            />
            <SmartSelectField
              label="Type d'Analyse"
              name="analysisType"
              value={form.analysisType}
              options={analysisTypeOptions}
              inputStyle={inputStyle}
              fp={fp}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              onSelect={(value) => updateForm((prev) => ({ ...prev, analysisType: value }))}
              onRemove={removeAnalysisTypeOption}
              addProps={{
                type: "analysisType",
                open: openAdd === "analysisType",
                value: customInputs.analysisType,
                placeholder: "Ex: Smart Money",
                buttonLabel: "Ajouter ma méthode",
                onOpen: () => setOpenAdd(openAdd === "analysisType" ? null : "analysisType"),
                onChange: (value) => setCustomInputs((prev) => ({ ...prev, analysisType: value })),
                onAdd: addCustomAnalysisType,
              }}
            />
            <Field label="Notes & Observations" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <textarea style={{ ...inputStyle("notes"), flex: 1, minHeight: "80px", resize: "none" }} name="notes" value={form.notes} onChange={handleChange} placeholder="Contexte du trade, facteurs influents..." {...fp("notes")} />
            </Field>
            <Field label="Risque (%)"><input style={inputStyle("risk")} type="number" step="any" name="risk" value={form.risk} onChange={handleChange} placeholder="Ex: 1" {...fp("risk")} /></Field>
            <Field label="Émotions Pré-Trade">
              <div style={styles.emotions}>
                {EMOTIONS.map((e) => {
                  const active = form.emotion === e;
                  const emotionColor = e === "Confiant" ? "#10B981" : e === "Neutre" ? "#3B82F6" : e === "Anxieux" ? "#F59E0B" : e === "FOMO" ? "#EF4444" : "#8B5CF6";
                  return (
                    <button key={e} type="button" onClick={() => selectEmotion(e)} style={{ ...styles.emotionBtn, backgroundColor: active ? emotionColor + "18" : "transparent", color: active ? emotionColor : "#6B7FA3", border: active ? `1px solid ${emotionColor}55` : "1px solid #1E2D45" }}>
                      {e}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.cta}>
        <button type="button" onClick={handleSubmit} disabled={isDisabled} style={{ ...styles.submitBtn, opacity: isDisabled ? 0.45 : 1, cursor: isDisabled ? "not-allowed" : "pointer" }}>
          {loading
            ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyse en cours...</>
            : <><Activity size={15} /> Lancer l'Analyse IA <ArrowRight size={15} /></>
          }
        </button>
        <p style={styles.ctaNote}>L'IA analysera votre trade en temps réel · Résultat en ~3 secondes</p>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        input::placeholder, textarea::placeholder { color: #3B4B6B; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
      `}</style>
    </div>
  );
}

function SmartSelectField({ label, name, value, options, inputStyle, fp, openDropdown, setOpenDropdown, onSelect, onRemove, addProps }) {
  return (
    <Field label={label}>
      <DropdownSelect
        name={name}
        value={value}
        placeholder="Sélectionner"
        options={options}
        inputStyle={inputStyle}
        fp={fp}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        onSelect={onSelect}
        onRemove={onRemove}
      />
      <InlineAdd {...addProps} />
    </Field>
  );
}

function DropdownSelect({ name, value, placeholder, options, inputStyle, fp, openDropdown, setOpenDropdown, onSelect, onRemove }) {
  const isOpen = openDropdown === name;
  return (
    <div
      style={styles.dropdownWrap}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpenDropdown(null);
          fp(name).onBlur();
        }
      }}
    >
      <button
        type="button"
        style={{
          ...inputStyle(name),
          ...styles.dropdownTrigger,
          color: value ? "#E8EDF5" : "#3B4B6B",
        }}
        onFocus={fp(name).onFocus}
        onClick={(event) => {
          event.preventDefault();
          setOpenDropdown(isOpen ? null : name);
        }}
      >
        <span style={styles.dropdownValue}>{value || placeholder}</span>
        <ChevronDown size={16} color="#8A9BB8" />
      </button>

      {isOpen && (
        <div style={styles.dropdownMenu}>
          {options.length === 0 ? (
            <div style={styles.dropdownEmpty}>Ajoutez votre première option</div>
          ) : options.map((option) => (
            <div key={option} style={styles.dropdownOptionRow}>
              <button
                type="button"
                style={styles.dropdownOptionBtn}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelect(option);
                  setOpenDropdown(null);
                }}
              >
                {option}
              </button>
              <button
                type="button"
                style={styles.dropdownRemoveBtn}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove(option);
                }}
                aria-label={`Retirer ${option}`}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineAdd({ open, value, placeholder, buttonLabel, onOpen, onChange, onAdd }) {
  return (
    <div style={styles.inlineAddWrap}>
      {!open ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onOpen();
          }}
          style={styles.inlineAddBtn}
        >
          <Plus size={11} /> {buttonLabel}
        </button>
      ) : (
        <div style={styles.inlineAddRow}>
          <input
            style={{ ...styles.input, ...styles.inlineAddInput }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onAdd();
              }
            }}
            placeholder={placeholder}
            autoFocus
          />
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onAdd();
            }}
            style={styles.inlineConfirmBtn}
          >
            Ajouter
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...style }}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { padding: "36px 32px", maxWidth: "1060px", margin: "0 auto" },
  hero: { textAlign: "center", marginBottom: "24px" },
  heroTitle: { fontSize: "1.75rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 8px 0", letterSpacing: "-0.02em" },
  heroSub: { color: "#6B7FA3", fontSize: "0.9rem", margin: 0 },
  rrBanner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "7px 20px", backgroundColor: "#1E3A5F22", border: "1px solid #3B82F633", borderRadius: "999px", width: "fit-content", margin: "0 auto 20px" },
  rrText: { color: "#6B7FA3", fontSize: "0.78rem" },
  rrValue: { fontWeight: "700", fontSize: "0.9rem" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "stretch", marginBottom: "28px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { backgroundColor: "#0D1421", borderRadius: "10px", border: "1px solid #1E2D45", padding: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.25)" },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  cardIconWrap: { width: "26px", height: "26px", borderRadius: "7px", backgroundColor: "#1E3A5F44", border: "1px solid #3B82F633", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: "0.875rem", fontWeight: "600", color: "#E8EDF5", margin: 0 },
  fields: { display: "flex", flexDirection: "column", gap: "12px" },
  fieldsGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  fieldLabel: { fontSize: "0.67rem", fontWeight: "600", color: "#6B7FA3", textTransform: "uppercase", letterSpacing: "0.08em" },
  input: { backgroundColor: "#121B2E", border: "1px solid #1E2D45", borderRadius: "8px", padding: "9px 12px", color: "#E8EDF5", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", transition: "border-color 0.15s, box-shadow 0.15s" },
  marketInstrumentRow: { display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: "8px" },
  selectCompact: { minWidth: 0 },
  dropdownWrap: { position: "relative" },
  dropdownTrigger: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", textAlign: "left", cursor: "pointer" },
  dropdownValue: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dropdownMenu: { position: "absolute", zIndex: 30, top: "calc(100% + 6px)", left: 0, right: 0, maxHeight: "188px", overflowY: "auto", padding: "6px", backgroundColor: "#0A101B", border: "1px solid #1E2D45", borderRadius: "8px", boxShadow: "0 16px 40px rgba(0,0,0,0.34)" },
  dropdownOptionRow: { display: "grid", gridTemplateColumns: "1fr 24px", alignItems: "center", gap: "4px", borderRadius: "6px" },
  dropdownOptionBtn: { minWidth: 0, width: "100%", padding: "8px 8px", border: "none", backgroundColor: "transparent", color: "#DCE5F4", textAlign: "left", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  dropdownRemoveBtn: { width: "22px", height: "22px", border: "none", borderRadius: "5px", backgroundColor: "transparent", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  dropdownEmpty: { padding: "9px 8px", color: "#64748B", fontSize: "0.78rem", fontWeight: "500" },
  inlineAddWrap: { minHeight: "18px" },
  inlineAddBtn: { display: "inline-flex", alignItems: "center", gap: "5px", width: "fit-content", padding: "0", border: "none", backgroundColor: "transparent", color: "#3B82F6", fontSize: "0.7rem", fontWeight: "600", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  inlineAddRow: { display: "grid", gridTemplateColumns: "1fr auto", gap: "6px", marginTop: "2px" },
  inlineAddInput: { padding: "7px 10px", fontSize: "0.78rem", borderRadius: "7px" },
  inlineConfirmBtn: { padding: "7px 10px", borderRadius: "7px", border: "1px solid #1E2D45", backgroundColor: "#1E3A5F44", color: "#60A5FA", fontSize: "0.72rem", fontWeight: "600", cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  emotions: { display: "flex", flexWrap: "wrap", gap: "6px" },
  emotionBtn: { padding: "5px 12px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "500", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" },
  dirWrapper: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  dirBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", borderRadius: "8px", fontWeight: "600", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" },
  errorBanner: { backgroundColor: "#450A0A", border: "1px solid #EF444444", borderRadius: "8px", padding: "12px 16px", color: "#EF4444", fontSize: "0.85rem", marginBottom: "16px", textAlign: "center" },
  cta: { textAlign: "center" },
  submitBtn: { display: "inline-flex", alignItems: "center", gap: "10px", padding: "13px 36px", background: "linear-gradient(135deg, #059669, #10B981)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "0.95rem", fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 20px rgba(16,185,129,0.25)" },
  ctaNote: { color: "#3B4B6B", fontSize: "0.78rem", marginTop: "10px" },
};
