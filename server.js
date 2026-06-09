import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import OpenAI from "openai";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/node";
import { PostHog } from "posthog-node";
import cron from "node-cron";
import {
  sendWelcomeEmail,
  sendFirstAnalysisCompletedEmail,
  sendPremiumActivatedEmail,
  sendPaymentFailedEmail,
  sendTestEmail,
  TEST_EMAIL_TYPES,
  runOnboardingSequence,
  runRetentionCampaign,
} from "./src/emails/emailService.js";

// ─── SENTRY INIT (avant tout) ─────────────────────────────────────────────────

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 0.2,
  enabled: !!process.env.SENTRY_DSN,
  beforeSend(event) {
    if (event?.exception?.values?.[0]?.value?.includes("429")) return null;
    return event;
  },
});

function captureBackendError(error, context = {}) {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
}

// ─── POSTHOG INIT ─────────────────────────────────────────────────────────────

const posthogClient = process.env.POSTHOG_API_KEY
  ? new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST || "https://eu.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    })
  : null;

function trackEvent(distinctId, event, properties = {}) {
  if (!posthogClient) return;
  try {
    posthogClient.capture({
      distinctId: distinctId || "anonymous",
      event,
      properties: {
        source: "backend",
        timestamp: new Date().toISOString(),
        ...properties,
      },
    });
    if (process.env.NODE_ENV !== "production") {
      posthogClient.flush();
    }
  } catch (err) {
    log("warn", "posthog_track_error", { error: err.message });
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "thomasmanach06@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const DEFAULT_APP_URL = process.env.NODE_ENV === "production"
  ? "https://mysmartjournal-app.vercel.app"
  : "http://localhost:5173";

function cleanBaseUrl(url) {
  return String(url || "").replace(/\/$/, "");
}

function isLocalUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

const APP_BASE_URL = cleanBaseUrl(process.env.MSJ_APP_URL || process.env.VITE_APP_URL || DEFAULT_APP_URL);
const API_BASE_URL = cleanBaseUrl(process.env.MSJ_API_URL || process.env.VITE_API_BASE_URL || APP_BASE_URL);
const hasInvalidProductionUrl = process.env.NODE_ENV === "production" && isLocalUrl(APP_BASE_URL);

// ─── LOGGING ──────────────────────────────────────────────────────────────────

function log(level, action, data = {}) {
  const entry = { timestamp: new Date().toISOString(), level, action, ...data };
  level === "error" ? console.error(JSON.stringify(entry)) : console.log(JSON.stringify(entry));
}

async function updateUserSettingsBy(column, value, fields) {
  const { error } = await supabase
    .from("user_settings")
    .update(fields)
    .eq(column, value);

  if (!error) return { error: null };

  const optionalStripeFields = ["cancel_at_period_end", "subscription_current_period_end"];
  const hasOptionalStripeField = optionalStripeFields.some((field) =>
    Object.prototype.hasOwnProperty.call(fields, field)
  );
  const isMissingColumnError = /column|schema cache|could not find/i.test(error.message || "");

  if (hasOptionalStripeField && isMissingColumnError) {
    const fallbackFields = { ...fields };
    optionalStripeFields.forEach((field) => delete fallbackFields[field]);
    return await supabase
      .from("user_settings")
      .update(fallbackFields)
      .eq(column, value);
  }

  return { error };
}

// ─── WEBHOOK (AVANT tout middleware) ──────────────────────────────────────────

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    log("error", "webhook_signature_invalid", { error: err.message });
    captureBackendError(err, { route: "/webhook" });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;

        if (!userId) {
          log("error", "webhook_missing_user_id", { sessionId: session.id });
          break;
        }

        const { error: supabaseError } = await updateUserSettingsBy(
          "user_id",
          userId,
          {
            plan: "premium",
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            cancel_at_period_end: false,
            subscription_current_period_end: null,
            updated_at: new Date().toISOString(),
          }
        );

        if (supabaseError) {
          log("error", "supabase_update_failed", { error: supabaseError.message, userId });
          captureBackendError(supabaseError, { route: "webhook/checkout.session.completed", userId });
        } else {
          log("info", "user_upgraded_premium", { userId });
          trackEvent(userId, "subscription_upgraded", {
            customer_id: session.customer,
            subscription_id: session.subscription,
          });
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(userId);
            if (authUser?.user?.email) {
              await sendPremiumActivatedEmail(userId, authUser.user.email);
            }
          } catch (emailErr) {
            log("error", "premium_email_error", { error: emailErr.message, userId });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        log("warn", "payment_failed", { customerId });
        trackEvent(customerId, "payment_failed", { customer_id: customerId });

        try {
          const { data: settings } = await supabase
            .from("user_settings")
            .select("user_id, stripe_subscription_id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (settings?.stripe_subscription_id) {
            const subscription = await stripe.subscriptions.retrieve(settings.stripe_subscription_id);
            trackEvent(settings.user_id || customerId, "subscription_payment_failed_status", {
              subscription_status: subscription.status,
              customer_id: customerId,
            });
          }

          if (settings?.user_id) {
            const { data: authUser } = await supabase.auth.admin.getUserById(settings.user_id);
            if (authUser?.user?.email) {
              await sendPaymentFailedEmail(settings.user_id, authUser.user.email);
            }
          }
        } catch (emailErr) {
          log("error", "payment_failed_email_error", { error: emailErr.message });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await updateUserSettingsBy(
          "stripe_customer_id",
          customerId,
          {
            plan: "free",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            subscription_current_period_end: null,
            updated_at: new Date().toISOString(),
          }
        );

        log("info", "subscription_cancelled", { customerId });
        trackEvent(customerId, "subscription_cancelled_by_webhook", { customer_id: customerId });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;
        const shouldRemainPremium = ["active", "trialing", "past_due"].includes(status);

        await updateUserSettingsBy(
          "stripe_customer_id",
          customerId,
          {
            plan: shouldRemainPremium ? "premium" : "free",
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: subscription.cancel_at_period_end === true,
            subscription_current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          }
        );

        log("info", "subscription_updated", {
          customerId,
          status,
          plan: shouldRemainPremium ? "premium" : "free",
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        trackEvent(customerId, "subscription_updated_by_webhook", {
          customer_id: customerId,
          status,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        break;
      }

      default:
        log("info", "webhook_unhandled", { type: event.type });
    }
  } catch (err) {
    log("error", "webhook_processing_error", { error: err.message });
    captureBackendError(err, { route: "/webhook", eventType: event?.type });
    return res.status(500).json({ error: "Erreur interne" });
  }

  res.json({ received: true });
});

// ─── CORS ─────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://mysmartjournal-app.vercel.app",
  APP_BASE_URL,
  API_BASE_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    log("warn", "cors_blocked", { origin });
    return callback(new Error(`CORS bloqué pour l'origine: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-POSTHOG-DISTINCT-ID",
    "X-POSTHOG-SESSION-ID",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.options(/.*/, cors());

// ─── HELMET ───────────────────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

// ─── AUTRES MIDDLEWARES ───────────────────────────────────────────────────────

app.use(express.json({ limit: "10kb" }));
app.use(morgan("combined"));

// ─── RATE LIMITERS ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives. Réessayez dans 1 heure." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Trop d'analyses simultanées. Attendez 1 minute." },
});

app.use(globalLimiter);

// ─── MIDDLEWARE AUTH ───────────────────────────────────────────────────────────

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Token invalide ou expiré." });
    req.user = user;
    next();
  } catch (err) {
    log("error", "auth_middleware_error", { error: err.message });
    return res.status(401).json({ error: "Erreur d'authentification." });
  }
}

function requireAdmin(req, res, next) {
  const email = req.user?.email?.toLowerCase();
  const role = req.user?.app_metadata?.role || req.user?.user_metadata?.role;

  if (role === "admin" || (email && ADMIN_EMAILS.includes(email))) {
    return next();
  }

  log("warn", "admin_access_denied", { userId: req.user?.id, email });
  return res.status(403).json({ error: "Accès admin requis." });
}

// ─── MIDDLEWARE RATE LIMIT ANALYSES (DB) ──────────────────────────────────────

async function checkAnalysisLimit(req, res, next) {
  const userId = req.user.id;
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data: settings } = await supabase
      .from("user_settings").select("plan").eq("user_id", userId).single();

    const plan = settings?.plan || "free";
    const limit = plan === "premium" ? 50 : 3;

    const { data: usage } = await supabase
      .from("analysis_usage").select("count").eq("user_id", userId).eq("date", today).single();

    const currentCount = usage?.count || 0;

    if (currentCount >= limit) {
      log("warn", "analysis_limit_reached", { userId, plan, count: currentCount });
      trackEvent(userId, "analysis_limit_reached", { plan, count: currentCount, limit });
      return res.status(429).json({
        error: plan === "free"
          ? `Limite de ${limit} analyses/jour atteinte. Passez en Premium pour plus.`
          : `Limite journalière de ${limit} analyses atteinte.`,
        limit_reached: true,
        plan,
      });
    }

    if (usage) {
      await supabase.from("analysis_usage").update({ count: currentCount + 1 }).eq("user_id", userId).eq("date", today);
    } else {
      await supabase.from("analysis_usage").insert([{ user_id: userId, date: today, count: 1 }]);
    }

    req.plan = plan;
    next();
  } catch (err) {
    log("error", "analysis_limit_check_error", { error: err.message });
    captureBackendError(err, { route: "checkAnalysisLimit", userId });
    next();
  }
}

// ─── SANITIZER ────────────────────────────────────────────────────────────────

function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;")
    .trim().slice(0, 1000);
}

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Données invalides.",
      details: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

const tradeValidation = [
  body("pair").trim().notEmpty().withMessage("Paire requise.").isLength({ max: 20 }).matches(/^[A-Za-z0-9/. ]+$/),
  body("market").optional().isLength({ max: 40 }),
  body("entry").notEmpty().isFloat({ min: 0 }).withMessage("Prix d'entrée invalide."),
  body("exitPrice").optional({ values: "falsy" }).isFloat({ min: 0 }),
  body("stopLoss").notEmpty().isFloat({ min: 0 }).withMessage("Stop loss invalide."),
  body("takeProfit").notEmpty().isFloat({ min: 0 }).withMessage("Take profit invalide."),
  body("size").optional({ values: "falsy" }).isFloat({ min: 0 }),
  body("timeframe").optional().isLength({ max: 20 }),
  body("setup").optional().isLength({ max: 120 }),
  body("analysisType").optional().isLength({ max: 120 }),
  body("emotion").optional().isLength({ max: 50 }),
  body("direction").isIn(["long", "short", "buy", "sell"]).withMessage("Direction invalide."),
  body("riskPercent").optional({ values: "falsy" }).isFloat({ min: 0, max: 100 }),
  body("notes").optional().isLength({ max: 2000 }),
];

const checkoutValidation = [
  body("user_id").notEmpty().isUUID().withMessage("user_id invalide."),
  body("email").isEmail().withMessage("Email invalide."),
];

const testEmailValidation = [
  body("emailType").isIn(TEST_EMAIL_TYPES).withMessage("Template email invalide."),
  body("to").optional().isEmail().withMessage("Email destinataire invalide."),
  body("payload").optional().isObject().withMessage("Payload invalide."),
];

// ─── PROFILE SERVICE (Coach IA) ───────────────────────────────────────────────

async function getOrCreateProfile(userId) {
  const { data, error } = await supabase
    .from("user_trading_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    const { data: created } = await supabase
      .from("user_trading_profile")
      .insert([{ user_id: userId }])
      .select()
      .single();
    return created;
  }
  return data;
}

async function getRecentTradesForProfile(userId, limit = 10) {
  const { data } = await supabase
    .from("trades")
    .select("pair, direction, result, rr, emotion, setup, ai_score, ai_analysis, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

function detectPatterns(notes, aiAnalysis) {
  const patterns = [];
  const text = `${notes || ""} ${JSON.stringify(aiAnalysis || "")}`.toLowerCase();

  if (text.includes("fomo") || text.includes("peur de rater")) patterns.push("fomo");
  if (text.includes("revenge") || text.includes("revanche") || text.includes("rattraper")) patterns.push("revenge_trading");
  if (text.includes("entrée tardive") || text.includes("late entry") || text.includes("trop tard")) patterns.push("late_entry");
  if (text.includes("anxieux") || text.includes("stress")) patterns.push("anxiety");
  if (text.includes("impatien")) patterns.push("impatience");
  if (text.includes("stop") && (text.includes("trop proche") || text.includes("mauvais"))) patterns.push("bad_stop");

  return patterns;
}

async function updateUserProfile(userId, { aiScore, emotion, patterns, pair }) {
  try {
    const profile = await getOrCreateProfile(userId);
    if (!profile) return;

    const total = (profile.total_trades_analyzed || 0) + 1;
    const newAvgScore = ((profile.avg_ai_score || 0) * (total - 1) + (aiScore || 0)) / total;
    const newDiscipline = ((profile.discipline_score || 0) * (total - 1) + (aiScore >= 7 ? 8 : aiScore >= 4 ? 5 : 2)) / total;
    const newPsychology = ((profile.psychology_score || 0) * (total - 1) + (["Confiant", "Neutre"].includes(emotion) ? 8 : 3)) / total;
    const newExecution = ((profile.execution_score || 0) * (total - 1) + (aiScore || 5)) / total;

    const updates = {
      total_trades_analyzed: total,
      avg_ai_score: parseFloat(newAvgScore.toFixed(2)),
      discipline_score: parseFloat(newDiscipline.toFixed(2)),
      psychology_score: parseFloat(newPsychology.toFixed(2)),
      execution_score: parseFloat(newExecution.toFixed(2)),
      dominant_emotion: emotion || profile.dominant_emotion,
      updated_at: new Date().toISOString(),
    };

    if (patterns.includes("fomo")) updates.fomo_count = (profile.fomo_count || 0) + 1;
    if (patterns.includes("revenge_trading")) updates.revenge_trading_count = (profile.revenge_trading_count || 0) + 1;
    if (patterns.includes("late_entry")) updates.late_entry_count = (profile.late_entry_count || 0) + 1;
    if (patterns.includes("bad_stop")) updates.bad_stop_count = (profile.bad_stop_count || 0) + 1;

    // Insights automatiques
    const scores = {
      discipline: newDiscipline,
      psychology: newPsychology,
      execution: newExecution,
    };
    const maxKey = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const minKey = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b);

    const strengthLabels = {
      discipline: "Excellente discipline de trading",
      psychology: "Bonne maîtrise émotionnelle",
      execution: "Qualité d'exécution au-dessus de la moyenne",
    };
    const weaknessLabels = {
      discipline: "La discipline reste votre principal axe d'amélioration",
      psychology: "La gestion émotionnelle impacte vos performances",
      execution: "La qualité d'exécution doit être travaillée",
    };
    updates.main_strength = strengthLabels[maxKey];
    updates.main_weakness = weaknessLabels[minKey];

    const patternCounts = {
      fomo: updates.fomo_count || profile.fomo_count || 0,
      revenge: updates.revenge_trading_count || profile.revenge_trading_count || 0,
      late_entry: updates.late_entry_count || profile.late_entry_count || 0,
    };
    const topPattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0];
    const priorityLabels = {
      fomo: "Réduire les entrées FOMO en attendant une confirmation supplémentaire",
      revenge: "Appliquer une règle d'arrêt après 2 pertes consécutives",
      late_entry: "Préparer ses niveaux d'entrée avant l'ouverture du marché",
    };
    if (topPattern && topPattern[1] > 0) {
      updates.top_priority = priorityLabels[topPattern[0]];
    }

    // Historique hebdo
    const now = new Date();
    const weekKey = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
    const weekly = Array.isArray(profile.weekly_scores) ? [...profile.weekly_scores] : [];
    const weekIndex = weekly.findIndex(w => w.week === weekKey);
    if (weekIndex >= 0) {
      weekly[weekIndex].avg_score = parseFloat(((weekly[weekIndex].avg_score + aiScore) / 2).toFixed(2));
      weekly[weekIndex].trades++;
    } else {
      weekly.push({ week: weekKey, avg_score: aiScore || 0, trades: 1 });
    }
    updates.weekly_scores = weekly.slice(-12);

    await supabase.from("user_trading_profile").update(updates).eq("user_id", userId);

    // Log patterns
    if (patterns.length > 0) {
      await supabase.from("trade_patterns").insert([{
        user_id: userId,
        patterns,
        ai_score: aiScore,
        emotion,
        pair,
      }]);
    }
  } catch (err) {
    log("warn", "profile_update_error", { error: err.message, userId });
  }
}

function buildEnrichedPrompt(safePair, direction, entry, stopLoss, takeProfit, rr, riskPercent, safeNotes, profile, recentTrades) {
  const hasHistory = profile && (profile.total_trades_analyzed || 0) > 0;

  const historyContext = hasHistory ? `

PROFIL TRADER (HISTORIQUE) :
- Trades analysés : ${profile.total_trades_analyzed}
- Score IA moyen : ${profile.avg_ai_score}/10
- Score discipline : ${(profile.discipline_score || 0).toFixed(1)}/10
- Score psychologie : ${(profile.psychology_score || 0).toFixed(1)}/10
- Score exécution : ${(profile.execution_score || 0).toFixed(1)}/10
- Patterns récurrents : FOMO(${profile.fomo_count || 0}x), Revenge(${profile.revenge_trading_count || 0}x), Entrée tardive(${profile.late_entry_count || 0}x)
- Émotion dominante : ${profile.dominant_emotion || "non définie"}
- Force principale : ${profile.main_strength || "à déterminer"}
- Faiblesse principale : ${profile.main_weakness || "à déterminer"}
${recentTrades.length > 0 ? `
DERNIERS TRADES :
${recentTrades.slice(0, 5).map(t => `- ${t.pair} ${t.direction} | Score:${t.ai_score || "?"}/10 | Résultat:${t.result || "?"} | Émotion:${t.emotion || "?"}`).join("\n")}` : ""}

En tenant compte de CE PROFIL SPÉCIFIQUE, adapte ton analyse. Si tu détectes un pattern déjà présent dans l'historique, SIGNALE-LE explicitement dans "recurring_pattern".
` : "";

  return `Analyse ce trade et retourne UNIQUEMENT ce JSON :
{
  "score": { "overall": <0-10>, "setup_quality": <0-10>, "risk_management": <0-10>, "psychology": <0-10> },
  "verdict": "<phrase courte>",
  "main_mistake": "<erreur principale ou null>",
  "breakdown": { "setup": "<1-2 phrases>", "risk_management": "<1-2 phrases>", "psychology": "<1-2 phrases>" },
  "mistakes": ["<erreur>"],
  "strengths": ["<point fort>"],
  "action_plan": ["<action>"],
  "reflection_questions": ["<question>", "<question>", "<question>"],
  "recurring_pattern": "<pattern récurrent détecté ou null>",
  "progress_note": "<note sur progression par rapport à l'historique ou null>"
}
${historyContext}
Trade : Paire ${safePair} | ${direction} | Entrée ${entry} | SL ${stopLoss} | TP ${takeProfit} | R:R ${rr} | Risque ${riskPercent || "N/A"}% | Notes: ${safeNotes}`;
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Debug PostHog (dev only)
app.get("/debug-posthog", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }
  try {
    trackEvent("debug-test-user", "debug_event_fired", {
      test: true,
      timestamp: new Date().toISOString(),
    });
    await posthogClient?.flush();
    res.json({
      success: true,
      key_prefix: process.env.POSTHOG_API_KEY?.slice(0, 8),
      host: process.env.POSTHOG_HOST,
      message: "Event sent — check PostHog Live Events in 5 seconds",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Checkout Stripe
app.post(
  "/create-checkout-session",
  authLimiter,
  checkoutValidation,
  handleValidationErrors,
  requireAuth,
  async (req, res) => {
    const { user_id, email } = req.body;

    if (user_id !== req.user.id) {
      log("warn", "checkout_user_mismatch", { tokenUser: req.user.id, bodyUser: user_id });
      return res.status(403).json({ error: "Accès refusé." });
    }

    try {
      if (hasInvalidProductionUrl) {
        log("error", "invalid_production_app_url", { appBaseUrl: APP_BASE_URL });
        return res.status(500).json({ error: "Configuration URL production invalide." });
      }

      const { data: settings } = await supabase
        .from("user_settings").select("stripe_customer_id, plan").eq("user_id", user_id).single();

      if (settings?.plan === "premium") {
        return res.status(400).json({ error: "Déjà Premium." });
      }

      let customerId = settings?.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: sanitizeString(email),
          metadata: { user_id },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
        mode: "subscription",
        client_reference_id: user_id,
        success_url: `${APP_BASE_URL}/settings?section=facturation&upgrade=success`,
        cancel_url: `${APP_BASE_URL}/settings?section=facturation&upgrade=cancelled`,
        metadata: { user_id },
      });

      trackEvent(user_id, "checkout_session_created", {
        customer_id: customerId,
        session_id: session.id,
      });

      log("info", "checkout_session_created", { userId: user_id });
      res.json({ url: session.url });
    } catch (err) {
      log("error", "checkout_error", { error: err.message, userId: user_id });
      captureBackendError(err, { route: "/create-checkout-session", userId: user_id });
      trackEvent(user_id, "checkout_session_creation_failed", { error: err.message });
      res.status(500).json({ error: "Erreur lors de la création du paiement." });
    }
  }
);

// Cancel subscription
app.post("/cancel-subscription", requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: settings } = await supabase
      .from("user_settings").select("stripe_subscription_id").eq("user_id", userId).single();

    if (!settings?.stripe_subscription_id) {
      return res.status(400).json({ error: "Aucun abonnement actif." });
    }

    const subscription = await stripe.subscriptions.update(settings.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await updateUserSettingsBy("user_id", userId, {
      cancel_at_period_end: true,
      subscription_current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    });

    trackEvent(userId, "subscription_cancelled_by_user", {
      subscription_id: settings.stripe_subscription_id,
      cancel_at_period_end: true,
    });
    log("info", "subscription_cancelled_by_user", { userId });
    res.json({
      success: true,
      cancel_at_period_end: true,
      current_period_end: subscription.current_period_end,
    });
  } catch (err) {
    log("error", "cancel_subscription_error", { error: err.message, userId });
    captureBackendError(err, { route: "/cancel-subscription", userId });
    res.status(500).json({ error: "Erreur lors de l'annulation." });
  }
});

// Stripe customer portal
app.post("/create-billing-portal-session", requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (!settings?.stripe_customer_id) {
      return res.status(400).json({ error: "Compte Stripe introuvable." });
    }

    if (hasInvalidProductionUrl) {
      log("error", "invalid_production_app_url", { appBaseUrl: APP_BASE_URL });
      return res.status(500).json({ error: "Configuration URL production invalide." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: settings.stripe_customer_id,
      return_url: `${APP_BASE_URL}/settings?section=facturation`,
    });

    trackEvent(userId, "billing_portal_opened", { customer_id: settings.stripe_customer_id });
    res.json({ url: session.url });
  } catch (err) {
    log("error", "billing_portal_error", { error: err.message, userId });
    captureBackendError(err, { route: "/create-billing-portal-session", userId });
    res.status(500).json({ error: "Erreur lors de l'ouverture de la facturation." });
  }
});

// Check plan
app.post("/check-plan", requireAuth, async (req, res) => {
  try {
    const { data } = await supabase
      .from("user_settings").select("plan").eq("user_id", req.user.id).single();
    res.json({ plan: data?.plan || "free" });
  } catch (err) {
    log("error", "check_plan_error", { error: err.message });
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// AI Analysis — enrichie avec profil Coach IA
app.post(
  "/api/analyzeTrade",
  aiLimiter,
  tradeValidation,
  handleValidationErrors,
  requireAuth,
  checkAnalysisLimit,
  async (req, res) => {
    const {
      market,
      pair,
      direction,
      entry,
      exitPrice,
      stopLoss,
      takeProfit,
      size,
      timeframe,
      setup,
      analysisType,
      emotion,
      riskPercent,
      notes,
    } = req.body;
    const userId = req.user.id;
    const plan = req.plan || "free";

    const safePair = sanitizeString(pair);
    const safeMarket = sanitizeString(market || "");
    const safeTimeframe = sanitizeString(timeframe || "");
    const safeSetup = sanitizeString(setup || "");
    const safeAnalysisType = sanitizeString(analysisType || "");
    const safeEmotion = sanitizeString(emotion || "");
    const contextNotes = [
      safeMarket && `Marché: ${safeMarket}`,
      safeTimeframe && `Timeframe: ${safeTimeframe}`,
      safeSetup && `Setup: ${safeSetup}`,
      safeAnalysisType && `Type d'analyse: ${safeAnalysisType}`,
      safeEmotion && `Émotion pré-trade: ${safeEmotion}`,
      size && `Taille: ${size}`,
      exitPrice && `Prix de sortie: ${exitPrice}`,
      notes && sanitizeString(notes),
    ].filter(Boolean).join("\n");
    const safeNotes = sanitizeString(contextNotes);

    const risk = Math.abs(parseFloat(entry) - parseFloat(stopLoss));
    const reward = Math.abs(parseFloat(takeProfit) - parseFloat(entry));
    const rr = risk > 0 ? (reward / risk).toFixed(2) : "N/A";

    // Charge profil et historique en parallèle
    let profile = null;
    let recentTrades = [];
    try {
      [profile, recentTrades] = await Promise.all([
        getOrCreateProfile(userId),
        getRecentTradesForProfile(userId, 10),
      ]);
    } catch (err) {
      log("warn", "profile_load_error", { error: err.message, userId });
    }

    try {
      const prompt = buildEnrichedPrompt(
        safePair, direction, entry, stopLoss, takeProfit,
        rr, riskPercent, safeNotes, profile, recentTrades
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un coach de trading professionnel spécialisé en SMC, Forex et psychologie du trader.
Tu as accès à l'historique de ce trader. Utilise-le pour personnaliser ton analyse.
Retourne UNIQUEMENT un JSON valide, sans markdown, sans texte autour.`,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
      });

      const raw = completion.choices[0].message.content.trim();
      const parsed = JSON.parse(raw);

      // Détecte patterns et met à jour profil en arrière-plan (non bloquant)
      const patterns = detectPatterns(safeNotes, parsed);
      updateUserProfile(userId, {
        aiScore: parsed.score?.overall || 5,
        emotion: safeEmotion || null,
        patterns,
        pair: safePair,
      });

      trackEvent(userId, "trade_analyzed", {
        pair: safePair,
        score: parsed.score?.overall,
        rr,
        plan,
        has_history: (profile?.total_trades_analyzed || 0) > 0,
        has_mistakes: (parsed.mistakes?.length || 0) > 0,
      });

      log("info", "analysis_completed", { userId, pair: safePair, plan });
      res.json({ ...parsed, is_limited: false, plan });
    } catch (err) {
      log("error", "ai_analysis_error", { error: err.message, userId });
      captureBackendError(err, { route: "/api/analyzeTrade", userId, pair: safePair });
      res.status(500).json({ error: "Erreur lors de l'analyse IA." });
    }
  }
);

// ─── EMAIL ROUTES ─────────────────────────────────────────────────────────────

app.post("/send-welcome-email", requireAuth, async (req, res) => {
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(req.user.id);
    if (authUser?.user?.email) {
      const fullName = authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || "";
      const firstName = fullName.trim().split(/\s+/)[0] || undefined;
      await sendWelcomeEmail(req.user.id, authUser.user.email, firstName);
    }
    res.json({ success: true });
  } catch (err) {
    log("error", "welcome_email_error", { error: err.message, userId: req.user.id });
    captureBackendError(err, { route: "/send-welcome-email", userId: req.user.id });
    res.status(500).json({ error: "Erreur envoi email." });
  }
});

app.post("/track-activity", requireAuth, async (req, res) => {
  try {
    await supabase
      .from("user_settings")
      .update({ last_active_at: new Date().toISOString() })
      .eq("user_id", req.user.id);
    res.json({ success: true });
  } catch (err) {
    log("error", "track_activity_error", { error: err.message, userId: req.user.id });
    res.status(500).json({ error: "Erreur." });
  }
});

app.post("/mark-first-analysis", requireAuth, async (req, res) => {
  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("first_analysis_done")
      .eq("user_id", req.user.id)
      .single();

    const { error } = await supabase
      .from("user_settings")
      .update({ first_analysis_done: true })
      .eq("user_id", req.user.id);
    if (error) throw error;

    if (settings?.first_analysis_done !== true) {
      const { data: authUser } = await supabase.auth.admin.getUserById(req.user.id);
      if (authUser?.user?.email) {
        await sendFirstAnalysisCompletedEmail(req.user.id, authUser.user.email, {
          pair: req.body?.pair,
          score: req.body?.score,
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    log("error", "mark_first_analysis_error", { error: err.message, userId: req.user.id });
    res.status(500).json({ error: "Erreur." });
  }
});

// ─── PROFILE COACH IA ─────────────────────────────────────────────────────────

app.get("/api/profile", requireAuth, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.user.id);
    const { data: patterns } = await supabase
      .from("trade_patterns")
      .select("patterns, ai_score, emotion, pair, detected_at")
      .eq("user_id", req.user.id)
      .order("detected_at", { ascending: false })
      .limit(20);

    res.json({ profile, patterns: patterns || [] });
  } catch (err) {
    log("error", "get_profile_error", { error: err.message, userId: req.user.id });
    captureBackendError(err, { route: "/api/profile", userId: req.user.id });
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

app.post("/admin/test-email", requireAuth, requireAdmin, testEmailValidation, handleValidationErrors, async (req, res) => {
  if (process.env.DISABLE_EMAIL_TEST_ENDPOINT === "true") {
    return res.status(403).json({ error: "Endpoint de test email désactivé." });
  }

  try {
    const to = sanitizeString(req.body.to || req.user.email);
    const emailType = sanitizeString(req.body.emailType);
    const payload = req.body.payload && typeof req.body.payload === "object" ? req.body.payload : {};

    const result = await sendTestEmail({
      to,
      userId: req.user.id,
      emailType,
      payload,
    });

    if (!result) return res.status(500).json({ error: "Email test non envoyé." });

    log("info", "admin_test_email_sent", { userId: req.user.id, emailType, to });
    res.json({ success: true, emailType, to });
  } catch (err) {
    log("error", "admin_test_email_error", { error: err.message, userId: req.user.id });
    captureBackendError(err, { route: "/admin/test-email", userId: req.user.id });
    res.status(500).json({ error: "Erreur envoi email test." });
  }
});

app.get("/admin/feedback", requireAuth, requireAdmin, async (req, res) => {
  const { from, to, plan, limit = 50 } = req.query;
  try {
    let query = supabase
      .from("analysis_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);
    if (plan) query = query.eq("plan", plan);

    const { data, error } = await query;
    if (error) throw error;

    const total = data.length;
    const positive = data.filter((f) => f.rating === "positive").length;
    const negative = data.filter((f) => f.rating === "negative").length;
    const withComment = data.filter((f) => f.what_was_useful || f.what_was_missing || f.suggestions).length;

    res.json({
      stats: {
        total,
        positive,
        negative,
        satisfaction_rate: total > 0 ? ((positive / total) * 100).toFixed(1) : 0,
        feedback_with_comment: withComment,
        comment_rate: total > 0 ? ((withComment / total) * 100).toFixed(1) : 0,
      },
      feedbacks: data,
    });
  } catch (err) {
    log("error", "admin_feedback_error", { error: err.message });
    res.status(500).json({ error: "Erreur." });
  }
});

// ─── 404 & ERROR HANDLER ──────────────────────────────────────────────────────

app.use(Sentry.expressErrorHandler());

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

app.use((err, req, res, next) => {
  log("error", "unhandled_error", { error: err.message });
  res.status(500).json({ error: "Erreur interne du serveur." });
});

// ─── START ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  log("info", "server_started", { port: PORT, env: process.env.NODE_ENV || "development" });
});

// ─── CRON JOBS ────────────────────────────────────────────────────────────────

const cronJobsEnabled = process.env.ENABLE_CRON_JOBS === "true";

if (cronJobsEnabled) {
  cron.schedule("0 9 * * *", async () => {
    await runOnboardingSequence();
  }, { timezone: "Europe/Paris" });

  cron.schedule("0 10 * * *", async () => {
    await runRetentionCampaign();
  }, { timezone: "Europe/Paris" });

  log("info", "cron_jobs_started", { jobs: ["onboarding_sequence", "retention_campaign"] });
} else {
  log("info", "cron_jobs_disabled", { reason: "ENABLE_CRON_JOBS is not true" });
}

// ─── SHUTDOWN HOOKS ───────────────────────────────────────────────────────────

async function shutdownPostHog() {
  if (posthogClient) {
    try {
      await posthogClient.shutdown();
      console.log("[PostHog] Flushed and shutdown");
    } catch (err) {
      console.error("[PostHog] Shutdown error:", err.message);
    }
  }
}

process.on("SIGINT", async () => {
  await shutdownPostHog();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdownPostHog();
  process.exit(0);
});
