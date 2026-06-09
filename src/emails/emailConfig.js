export const EMAIL_CATEGORIES = {
  TRANSACTIONAL: "transactional",
  LIFECYCLE: "lifecycle",
  MARKETING: "marketing",
};

export const SUPPORTED_LOCALES = ["fr", "en"];

const DEFAULT_APP_URL = "https://mysmartjournal.com";

function cleanBaseUrl(url) {
  return String(url || DEFAULT_APP_URL).replace(/\/$/, "");
}

export const PRODUCT = {
  name: "MySmartJournal",
  tagline: {
    fr: "Coach de progression pour traders",
    en: "Progression coach for traders",
  },
  disclaimer: {
    fr: "MySmartJournal ne fournit pas de conseils financiers. Le trading comporte un risque de perte.",
    en: "MySmartJournal does not provide financial advice. Trading involves risk of loss.",
  },
};

export const EMAILS = {
  from: process.env.RESEND_FROM_EMAIL || "contact@mysmartjournal.org",
  support: process.env.SUPPORT_EMAIL || "support@mysmartjournal.org",
};

const APP_URL = cleanBaseUrl(process.env.MSJ_APP_URL || process.env.VITE_APP_URL);

export const URLS = {
  app: APP_URL,
  journal: `${APP_URL}/`,
  analyse: `${APP_URL}/analyse`,
  dashboard: `${APP_URL}/dashboard`,
  settings: `${APP_URL}/settings`,
  billing: `${APP_URL}/settings?section=facturation`,
  emailPreferences: `${APP_URL}/settings?section=app`,
  privacy: `${APP_URL}/privacy`,
  terms: `${APP_URL}/terms`,
  disclaimer: `${APP_URL}/disclaimer`,
  supportMailto: `mailto:${EMAILS.support}`,
};

export function getUnsubscribeUrl() {
  return URLS.emailPreferences;
}

export const EMAIL_TYPE_META = {
  welcome: { category: EMAIL_CATEGORIES.LIFECYCLE, locale: "fr" },
  first_analysis_completed: { category: EMAIL_CATEGORIES.LIFECYCLE, locale: "fr" },
  premium_activated: { category: EMAIL_CATEGORIES.TRANSACTIONAL, locale: "fr" },
  payment_failed: { category: EMAIL_CATEGORIES.TRANSACTIONAL, locale: "fr" },
  onboarding_day1: { category: EMAIL_CATEGORIES.LIFECYCLE, locale: "fr" },
  onboarding_day3: { category: EMAIL_CATEGORIES.LIFECYCLE, locale: "fr" },
  onboarding_day5: { category: EMAIL_CATEGORIES.MARKETING, locale: "fr" },
  onboarding_day7: { category: EMAIL_CATEGORIES.LIFECYCLE, locale: "fr" },
  retention_inactive: { category: EMAIL_CATEGORIES.MARKETING, locale: "fr" },
  retention_no_analysis: { category: EMAIL_CATEGORIES.MARKETING, locale: "fr" },
};

export function getEmailMeta(emailType) {
  return EMAIL_TYPE_META[emailType] || {
    category: EMAIL_CATEGORIES.LIFECYCLE,
    locale: "fr",
  };
}
