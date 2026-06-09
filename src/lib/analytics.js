import posthog from "posthog-js";

// ─── INIT ─────────────────────────────────────────────────────────────────────

export function initAnalytics() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://eu.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,        // Masque les inputs (sécurité)
      maskInputOptions: {
        password: true,
        email: false,
      },
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing(); // Pas de tracking en dev
    },
  });
}

// ─── IDENTIFICATION ───────────────────────────────────────────────────────────

export function identifyUser(userId, properties = {}) {
  if (!posthog.__loaded) return;
  posthog.identify(userId, {
    email: properties.email,
    plan: properties.plan || "free",
    created_at: properties.created_at,
    trading_level: properties.trading_level,
    main_market: properties.main_market,
  });
}

export function resetUser() {
  if (!posthog.__loaded) return;
  posthog.reset();
}

export function updateUserProperties(properties = {}) {
  if (!posthog.__loaded) return;
  posthog.people?.set(properties);
}

// ─── HELPER GÉNÉRIQUE ─────────────────────────────────────────────────────────

function track(event, properties = {}) {
  if (!posthog.__loaded) return;
  posthog.capture(event, {
    timestamp: new Date().toISOString(),
    ...properties,
  });
}

// ─── AUTH EVENTS ──────────────────────────────────────────────────────────────

export const analytics = {

  // Auth
  signupCompleted: (userId, email) => {
    track("signup_completed", { user_id: userId, email });
    identifyUser(userId, { email, plan: "free" });
  },

  loginCompleted: (userId, email, plan) => {
    track("login_completed", { user_id: userId, email, plan });
    identifyUser(userId, { email, plan });
  },

  logoutCompleted: () => {
    track("logout_completed");
    resetUser();
  },

  // Onboarding
  onboardingStarted: () => track("onboarding_started"),

  onboardingStepCompleted: (step, stepName) =>
    track("onboarding_step_completed", { step, step_name: stepName }),

  onboardingCompleted: (answers) =>
    track("onboarding_completed", {
      trading_level: answers.trading_level,
      style_de_trading: answers.style_de_trading,
      main_market: answers.main_market,
      main_objective: answers.main_objective,
    }),

  onboardingSkipped: (atStep) =>
    track("onboarding_skipped", { at_step: atStep }),

  sampleTradeAnalyzed: () =>
    track("sample_trade_analyzed"),

  // Product — Trades
  tradeCreated: (tradeData) =>
    track("trade_created", {
      pair: tradeData.pair,
      direction: tradeData.direction,
      result: tradeData.result,
      rr: tradeData.rr,
      has_setup: !!tradeData.setup,
      has_emotion: !!tradeData.emotion,
    }),

  tradeDeleted: () => track("trade_deleted"),

  tradeViewed: (pair) => track("trade_viewed", { pair }),

  // Product — Analyse IA
  analysisStarted: (pair, direction) =>
    track("analysis_started", { pair, direction }),

  analysisGenerated: (pair, score, plan, isLimited) =>
    track("analysis_generated", {
      pair,
      score,
      plan,
      is_limited: isLimited,
    }),

  analysisSaved: (pair, score) =>
    track("analysis_saved", { pair, score }),

  reflectionCompleted: (questionsCount) =>
    track("reflection_completed", { questions_count: questionsCount }),

  feedbackPositive: (pair, score) =>
    track("feedback_positive", { pair, score }),

  feedbackNegative: (pair, score) =>
    track("feedback_negative", { pair, score }),

  feedbackSubmitted: (pair, rating, score) =>
    track("feedback_submitted", { pair, rating, score }),

  // Business — Premium
  premiumClicked: (source) =>
    track("premium_clicked", { source }),

  checkoutStarted: () =>
    track("checkout_started"),

  premiumActivated: () => {
    track("premium_activated");
    updateUserProperties({ plan: "premium" });
  },

  subscriptionCancelled: () => {
    track("subscription_cancelled");
    updateUserProperties({ plan: "free" });
  },

  // Rétention
  appOpened: (plan) =>
    track("app_opened", { plan }),

  dashboardViewed: () =>
    track("dashboard_viewed"),

  journalViewed: (tradesCount) =>
    track("journal_viewed", { trades_count: tradesCount }),

  settingsViewed: (section) =>
    track("settings_viewed", { section }),

  // Erreurs
  errorOccurred: (errorType, message, context = {}) =>
    track("error_occurred", {
      error_type: errorType,
      message: message?.slice(0, 200),
      ...context,
    }),

  apiError: (endpoint, statusCode, message) =>
    track("api_error", {
      endpoint,
      status_code: statusCode,
      message: message?.slice(0, 200),
    }),

  aiError: (pair, errorMessage) =>
    track("ai_error", {
      pair,
      message: errorMessage?.slice(0, 200),
    }),
};