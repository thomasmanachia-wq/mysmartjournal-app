import 'dotenv/config';
import { Resend } from "resend";
import { templates } from "./templates.js";
import { EMAIL_CATEGORIES, EMAILS, getEmailMeta } from "./emailConfig.js";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FROM = EMAILS.from;

// ─── SEND HELPER ──────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, userId, emailType, force = false }) {
  try {
    const meta = getEmailMeta(emailType);
    const isTransactional = meta.category === EMAIL_CATEGORIES.TRANSACTIONAL;

    // Vérifie les préférences de l'utilisateur
    if (userId && !force) {
      let { data: settings, error: settingsError } = await supabase
        .from("user_settings")
        .select("email_notifications, email_frequency")
        .eq("user_id", userId)
        .single();

      if (settingsError) {
        const fallback = await supabase
          .from("user_settings")
          .select("email_notifications")
          .eq("user_id", userId)
          .single();
        settings = fallback.data;
      }

      if (!isTransactional && settings?.email_notifications === false) {
        console.log(`[Email] Skipped (opted out): ${emailType} → ${to}`);
        return null;
      }

      if (!isTransactional && settings?.email_frequency === "none") {
        console.log(`[Email] Skipped (frequency none): ${emailType} → ${to}`);
        return null;
      }

      if (meta.category === EMAIL_CATEGORIES.MARKETING && settings?.email_frequency === "minimal") {
        console.log(`[Email] Skipped (minimal frequency): ${emailType} → ${to}`);
        return null;
      }
    }

    const { data, error } = await resend.emails.send({
      from: `MySmartJournal <${FROM}>`,
      to,
      subject,
      html,
    });

    if (error) throw error;

    // Log dans Supabase
    if (userId) {
      await supabase.from("email_logs").insert([{
        user_id: userId,
        email_type: emailType,
        sent_at: new Date().toISOString(),
      }]);
    }

    console.log(`[Email] Sent: ${emailType} (${meta.category}) → ${to}`);
    return data;
  } catch (err) {
    console.error(`[Email] Error sending ${emailType} to ${to}:`, err.message);
    return null;
  }
}

// ─── EMAIL FUNCTIONS ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(userId, email, firstName) {
  const { subject, html } = templates.welcome({ firstName });
  return sendEmail({ to: email, subject, html, userId, emailType: "welcome" });
}

export async function sendFirstAnalysisCompletedEmail(userId, email, { pair, score } = {}) {
  const { subject, html } = templates.firstAnalysisCompleted({ pair, score });
  return sendEmail({ to: email, subject, html, userId, emailType: "first_analysis_completed" });
}

export async function sendPremiumActivatedEmail(userId, email) {
  const { subject, html } = templates.premiumActivated({ email });
  return sendEmail({ to: email, subject, html, userId, emailType: "premium_activated" });
}

export async function sendPaymentFailedEmail(userId, email) {
  const { subject, html } = templates.paymentFailed({ email });
  return sendEmail({ to: email, subject, html, userId, emailType: "payment_failed" });
}

export async function sendOnboardingDay1(userId, email) {
  const { subject, html } = templates.onboardingDay1();
  return sendEmail({ to: email, subject, html, userId, emailType: "onboarding_day1" });
}

export async function sendOnboardingDay3(userId, email) {
  const { subject, html } = templates.onboardingDay3();
  return sendEmail({ to: email, subject, html, userId, emailType: "onboarding_day3" });
}

export async function sendOnboardingDay5(userId, email, hasAnalysis) {
  const { subject, html } = templates.onboardingDay5({ hasAnalysis });
  return sendEmail({ to: email, subject, html, userId, emailType: "onboarding_day5" });
}

export async function sendOnboardingDay7(userId, email, payload = {}) {
  const { subject, html } = templates.onboardingDay7(payload);
  return sendEmail({ to: email, subject, html, userId, emailType: "onboarding_day7" });
}

export async function sendRetentionInactiveEmail(userId, email, daysSinceLogin, tradesCount) {
  const { subject, html } = templates.retentionInactive({ daysSinceLogin, tradesCount });
  return sendEmail({ to: email, subject, html, userId, emailType: "retention_inactive" });
}

export async function sendRetentionNoAnalysisEmail(userId, email) {
  const { subject, html } = templates.retentionNoAnalysis();
  return sendEmail({ to: email, subject, html, userId, emailType: "retention_no_analysis" });
}

export const TEST_EMAIL_TYPES = [
  "welcome",
  "first_analysis_completed",
  "premium_activated",
  "payment_failed",
  "onboarding_day1",
  "onboarding_day3",
  "onboarding_day5",
  "onboarding_day7",
  "retention_inactive",
  "retention_no_analysis",
];

export async function sendTestEmail({ to, userId, emailType, payload = {} }) {
  const previewData = {
    firstName: payload.firstName || "Thomas",
    pair: payload.pair || "XAUUSD",
    score: payload.score || 8,
    hasAnalysis: payload.hasAnalysis ?? true,
    tradesCount: payload.tradesCount ?? 7,
    firstFocus: payload.firstFocus || "discipline",
    daysSinceLogin: payload.daysSinceLogin ?? 7,
  };

  const renderers = {
    welcome: () => templates.welcome({ firstName: previewData.firstName }),
    first_analysis_completed: () => templates.firstAnalysisCompleted({
      pair: previewData.pair,
      score: previewData.score,
    }),
    premium_activated: () => templates.premiumActivated(),
    payment_failed: () => templates.paymentFailed(),
    onboarding_day1: () => templates.onboardingDay1(),
    onboarding_day3: () => templates.onboardingDay3(),
    onboarding_day5: () => templates.onboardingDay5({ hasAnalysis: previewData.hasAnalysis }),
    onboarding_day7: () => templates.onboardingDay7({
      tradesCount: previewData.tradesCount,
      firstFocus: previewData.firstFocus,
    }),
    retention_inactive: () => templates.retentionInactive({
      daysSinceLogin: previewData.daysSinceLogin,
      tradesCount: previewData.tradesCount,
    }),
    retention_no_analysis: () => templates.retentionNoAnalysis(),
  };

  if (!renderers[emailType]) {
    throw new Error(`Template email inconnu: ${emailType}`);
  }

  const { subject, html } = renderers[emailType]();
  return sendEmail({
    to,
    subject: `[Test] ${subject}`,
    html,
    userId,
    emailType: `test_${emailType}`,
    force: true,
  });
}

// ─── HELPERS VÉRIFICATION ─────────────────────────────────────────────────────

async function wasEmailSentRecently(userId, emailType, withinDays = 7) {
  const since = new Date();
  since.setDate(since.getDate() - withinDays);

  const { data } = await supabase
    .from("email_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("email_type", emailType)
    .gte("sent_at", since.toISOString())
    .limit(1);

  return data && data.length > 0;
}

// ─── CRON JOBS ────────────────────────────────────────────────────────────────

export async function runOnboardingSequence() {
  console.log("[Cron] Running onboarding sequence...");

  const now = new Date();

  // Récupère les users qui n'ont pas complété la séquence
  const { data: users } = await supabase
    .from("user_settings")
    .select("user_id, onboarding_email_day, email_notifications")
    .eq("email_notifications", true)
    .lt("onboarding_email_day", 7);

  if (!users?.length) return;

  for (const user of users) {
    const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
    if (!authUser?.user?.email) continue;

    const email = authUser.user.email;
    const createdAt = new Date(authUser.user.created_at);
    const daysSinceSignup = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    // Jour 1
    if (daysSinceSignup >= 1 && user.onboarding_email_day < 1) {
      await sendOnboardingDay1(user.user_id, email);
      await supabase.from("user_settings").update({ onboarding_email_day: 1 }).eq("user_id", user.user_id);
    }

    // Jour 3
    if (daysSinceSignup >= 3 && user.onboarding_email_day < 3) {
      await sendOnboardingDay3(user.user_id, email);
      await supabase.from("user_settings").update({ onboarding_email_day: 3 }).eq("user_id", user.user_id);
    }

    // Jour 5
    if (daysSinceSignup >= 5 && user.onboarding_email_day < 5) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("first_analysis_done")
        .eq("user_id", user.user_id)
        .single();

      await sendOnboardingDay5(user.user_id, email, settings?.first_analysis_done === true);
      await supabase.from("user_settings").update({ onboarding_email_day: 5 }).eq("user_id", user.user_id);
    }

    // Jour 7
    if (daysSinceSignup >= 7 && user.onboarding_email_day < 7) {
      const { count } = await supabase
        .from("trades")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.user_id);

      const { data: settings } = await supabase
        .from("user_settings")
        .select("domaine_de_focus")
        .eq("user_id", user.user_id)
        .single();

      await sendOnboardingDay7(user.user_id, email, {
        tradesCount: count || 0,
        firstFocus: settings?.domaine_de_focus || "discipline",
      });
      await supabase.from("user_settings").update({ onboarding_email_day: 7 }).eq("user_id", user.user_id);
    }
  }

  console.log(`[Cron] Onboarding sequence processed ${users.length} users`);
}

export async function runRetentionCampaign() {
  console.log("[Cron] Running retention campaign...");

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Users inactifs depuis 3+ jours
  const { data: inactiveUsers } = await supabase
    .from("user_settings")
    .select("user_id, last_active_at, email_notifications")
    .eq("email_notifications", true)
    .lt("last_active_at", threeDaysAgo.toISOString());

  if (inactiveUsers?.length) {
    for (const user of inactiveUsers) {
      const alreadySent = await wasEmailSentRecently(user.user_id, "retention_inactive", 7);
      if (alreadySent) continue;

      const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
      if (!authUser?.user?.email) continue;

      const daysSince = Math.floor((new Date() - new Date(user.last_active_at)) / (1000 * 60 * 60 * 24));

      const { count } = await supabase
        .from("trades")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.user_id);

      await sendRetentionInactiveEmail(user.user_id, authUser.user.email, daysSince, count || 0);
    }
  }

  // Users sans analyse IA depuis leur inscription
  const { data: noAnalysisUsers } = await supabase
    .from("user_settings")
    .select("user_id, first_analysis_done, email_notifications")
    .eq("email_notifications", true)
    .eq("first_analysis_done", false);

  if (noAnalysisUsers?.length) {
    for (const user of noAnalysisUsers) {
      const alreadySent = await wasEmailSentRecently(user.user_id, "retention_no_analysis", 5);
      if (alreadySent) continue;

      const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
      if (!authUser?.user?.email) continue;

      const createdAt = new Date(authUser.user.created_at);
      const daysSinceSignup = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));

      if (daysSinceSignup >= 2) {
        await sendRetentionNoAnalysisEmail(user.user_id, authUser.user.email);
      }
    }
  }

  console.log("[Cron] Retention campaign done");
}
