import * as Sentry from "@sentry/react";

export function initMonitoring() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  if (import.meta.env.DEV) return; // Pas de monitoring en dev

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE || "production",
    release: "mysmartjournal@1.0.0",

    // Performance
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Filtre les erreurs inutiles
    beforeSend(event, hint) {
      const error = hint?.originalException;
      if (!error) return event;

      const msg = error?.message || "";

      // Ignore les erreurs non critiques
      const ignoredPatterns = [
        "ResizeObserver loop",
        "Non-Error promise rejection",
        "Loading chunk",
        "NetworkError",
        "AbortError",
        "ChunkLoadError",
      ];

      if (ignoredPatterns.some((p) => msg.includes(p))) return null;

      return event;
    },
  });
}

// ─── USER CONTEXT ─────────────────────────────────────────────────────────────

export function setSentryUser(userId, email, plan) {
  Sentry.setUser({ id: userId, email, plan });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

// ─── CAPTURE HELPERS ──────────────────────────────────────────────────────────

export function captureError(error, context = {}) {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
}

export function captureMessage(message, level = "info", context = {}) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureMessage(message);
  });
}

export function captureAPIError(endpoint, status, message, userId) {
  Sentry.withScope((scope) => {
    scope.setTag("type", "api_error");
    scope.setTag("endpoint", endpoint);
    scope.setExtra("status_code", status);
    scope.setExtra("message", message);
    scope.setExtra("user_id", userId);
    scope.setLevel("error");
    Sentry.captureMessage(`API Error: ${endpoint} → ${status}`);
  });
}

export function captureAIError(pair, errorMessage, userId) {
  Sentry.withScope((scope) => {
    scope.setTag("type", "ai_error");
    scope.setExtra("pair", pair);
    scope.setExtra("message", errorMessage);
    scope.setExtra("user_id", userId);
    scope.setLevel("error");
    Sentry.captureMessage(`AI Error for ${pair}`);
  });
}

export function captureStripeError(action, errorMessage, userId) {
  Sentry.withScope((scope) => {
    scope.setTag("type", "stripe_error");
    scope.setTag("action", action);
    scope.setExtra("message", errorMessage);
    scope.setExtra("user_id", userId);
    scope.setLevel("critical");
    Sentry.captureMessage(`Stripe Error: ${action}`);
  });
}

export { Sentry };