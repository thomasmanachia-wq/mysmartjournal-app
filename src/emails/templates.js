import { URLS } from "./emailConfig.js";
import {
  renderEmailLayout,
  card,
  heading,
  paragraph,
  button,
  list,
  notice,
  metricGrid,
  keyValueRows,
} from "./emailDesignSystem.js";

function render({ preheader, content, category, locale = "en" }) {
  return renderEmailLayout({ preheader, content, category, locale });
}

export const templates = {
  welcome: ({ firstName } = {}) => ({
    subject: "Welcome to MySmartJournal",
    html: render({
      preheader: "Your AI trade performance coach is ready to calibrate.",
      content: `
        ${card(`
          ${heading(`Welcome${firstName ? `, ${firstName}` : ""}`, { eyebrow: "Getting Started" })}
          ${paragraph("MySmartJournal is built to help you master your trading execution: risk parameters, discipline, psychological state, and consistency.")}
          ${paragraph("Your first step is simple: log a clean trade, then let the AI generate an institutional-grade diagnostic.")}
          ${button({ label: "Audit Your First Trade", href: URLS.analyse })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">What your AI Coach helps you build</strong>")}
          ${list([
            "A structured, institutional log of your trades.",
            "Instant feedback detecting recurring behavioral leaks.",
            "Concrete action plans tailored to your setup rules.",
          ])}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  firstAnalysisCompleted: ({ pair, score } = {}) => ({
    subject: "Your First AI Trade Audit is Ready",
    html: render({
      preheader: "A clear benchmark to optimize your next execution.",
      content: `
        ${card(`
          ${heading("Your First Diagnostic is Ready", { eyebrow: "AI Audit" })}
          ${paragraph("You now have an objective baseline. The goal isn't to judge a single trade in isolation, but to identify what to repeat and what leaks to eliminate immediately.")}
          ${pair || score ? metricGrid([
            ...(pair ? [{ value: pair, label: "Asset / Pair" }] : []),
            ...(score ? [{ value: `${score}/10`, label: "AI Score" }] : []),
            { value: "1", label: "Audits" },
          ]) : ""}
          ${paragraph("Review your Action Plan carefully: this is where audit feedback translates into tangible execution gains.")}
          ${button({ label: "View Trading Journal", href: URLS.journal })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">Pre-flight checklist before your next trade</strong>")}
          ${paragraph("What specific criteria must be verified before pulling the trigger? If you cannot formulate your entry thesis in one clear sentence, the trade is not worth taking.")}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  premiumActivated: () => ({
    subject: "Pro Plan Activated — Full Access Unlocked",
    html: render({
      preheader: "Your MySmartJournal Pro membership is now active.",
      content: `
        ${card(`
          ${heading("Your Pro Workspace is Active", { eyebrow: "Subscription" })}
          ${paragraph("Your Pro membership has been confirmed. You can now audit trades with maximum depth, institutional rubrics, and high-volume limits.")}
          ${list([
            "In-depth AI audits with institutional SMC/Prop-Firm rubrics.",
            "Optional psychological reflection prompts.",
            "Full multi-step action plans after every trade.",
            "Priority developer support.",
          ])}
          ${button({ label: "Audit a Trade", href: URLS.analyse, variant: "success" })}
        `)}
        ${notice("All audits are strictly educational: they structure your decision-making without providing financial advice.", "info")}
      `,
      category: "transactional",
    }),
  }),

  paymentFailed: () => ({
    subject: "Action Required — Payment Failed",
    html: render({
      preheader: "Your latest subscription payment could not be processed.",
      content: `
        ${card(`
          ${heading("Payment Processing Issue", { eyebrow: "Billing" })}
          ${paragraph("Stripe notified us that your recent Pro renewal payment could not be processed. Your access is not immediately revoked — Stripe will retry automatically according to billing policies.")}
          ${paragraph("To avoid any service interruption, please update your payment method in your billing portal.")}
          ${button({ label: "Manage Billing", href: URLS.billing, variant: "danger" })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">Common causes</strong>")}
          ${list([
            "Expired or replaced credit card.",
            "3D Secure bank authentication required.",
            "Daily limit reached or insufficient funds.",
          ])}
        `)}
      `,
      category: "transactional",
    }),
  }),

  onboardingDay1: () => ({
    subject: "Your Journal Delivers Value from Trade #1",
    html: render({
      preheader: "A simple habit to gain total clarity on your execution.",
      content: `
        ${card(`
          ${heading("Start with One Clean Trade", { eyebrow: "Day 1" })}
          ${paragraph("A trading journal doesn't need to be overwhelming to be effective. It just needs to capture what drove your decision: setup context, risk parameters, pre-trade emotions, and execution quality.")}
          ${paragraph("Your immediate goal is to establish a reliable baseline. Consistency emerges from routine and comparative review.")}
          ${button({ label: "Log a Trade", href: URLS.analyse })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">Execution rule</strong>")}
          ${paragraph("Before entering a position, make sure you can articulate your edge in a single sentence. If it sounds convoluted, your execution will likely follow suit.")}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  onboardingDay3: () => ({
    subject: "What Pre-Trade Emotions Reveal About Your Execution",
    html: render({
      preheader: "An essential psychological insight for your next trade.",
      content: `
        ${card(`
          ${heading("Audit Your Psychological State", { eyebrow: "Day 3" })}
          ${paragraph("Flawless technical setups often fall apart due to compromised execution: FOMO, anxiety, rushing entries, or revenge trading after a loss.")}
          ${paragraph("Tracking your pre-trade state isn't about self-judgment. It's about spotting conditions where your decision-making becomes volatile.")}
          ${button({ label: "Audit a Trade", href: URLS.analyse })}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  onboardingDay5: ({ hasAnalysis }) => ({
    subject: hasAnalysis ? "Turn AI Feedback into an Actionable Game Plan" : "Log Your First Trade to Establish Your Baseline",
    html: render({
      preheader: "Every audit should refine your next execution.",
      content: `
        ${card(`
          ${heading(hasAnalysis ? "Move from Analysis to Action" : "Establish Your Baseline", { eyebrow: "Progression" })}
          ${paragraph(hasAnalysis
            ? "You've audited your execution. The most impactful step now is selecting one specific correction to apply on your very next trade."
            : "If you haven't run an AI audit yet, start with a recent trade. The objective is clarity, not perfection."
          )}
          ${list([
            "Isolate your top behavioral leak.",
            "Define a clear, non-negotiable execution rule.",
            "Compare your next trade against this rule.",
          ])}
          ${button({ label: hasAnalysis ? "Review Account Settings" : "Audit a Trade", href: hasAnalysis ? URLS.billing : URLS.analyse, variant: hasAnalysis ? "warning" : "primary" })}
        `)}
      `,
      category: "marketing",
    }),
  }),

  onboardingDay7: ({ tradesCount = 0, firstFocus = "discipline" } = {}) => ({
    subject: "Your 7-Day Performance Review",
    html: render({
      preheader: "One week is enough to spot execution patterns.",
      content: `
        ${card(`
          ${heading("Hard Data Beats Gut Feelings", { eyebrow: "Day 7" })}
          ${paragraph("After a week of journaling, the goal is recognizing the exact conditions behind your best and worst trades.")}
          ${metricGrid([
            { value: String(tradesCount), label: "Logged Trades" },
            { value: firstFocus, label: "Priority Focus" },
            { value: "7d", label: "Window" },
          ])}
          ${paragraph("This week, focus on one key rule: wait for full confirmation, respect invalidation, or eliminate impulse entries.")}
          ${button({ label: "Open Dashboard", href: URLS.dashboard })}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  retentionInactive: ({ daysSinceLogin, tradesCount }) => ({
    subject: "Pick Up Where You Left Off in Your Journal",
    html: render({
      preheader: "A few minutes are all it takes to bring your record up to date.",
      content: `
        ${card(`
          ${heading("Consistency Breeds Edge", { eyebrow: "Review" })}
          ${paragraph(`You haven't opened MySmartJournal in <strong style="color:#E8EDF5;">${daysSinceLogin} days</strong>. Getting back on track doesn't require catching up on everything: start with your most recent trade.`)}
          ${tradesCount > 0 ? keyValueRows([{ label: "Logged Trades", value: String(tradesCount) }]) : ""}
          ${button({ label: "Resume Journaling", href: URLS.journal })}
        `)}
      `,
      category: "marketing",
    }),
  }),

  retentionNoAnalysis: () => ({
    subject: "AI Diagnostics Bring Instant Clarity to Your Edge",
    html: render({
      preheader: "Use AI audits as a diagnostic tool, not an opinion.",
      content: `
        ${card(`
          ${heading("Run an Audit on a Real Trade", { eyebrow: "AI Coach" })}
          ${paragraph("AI audits deliver maximum value on concrete trade parameters: entry, stop, take profit, market context, and emotions. They highlight what to repeat and what to cut.")}
          ${paragraph("Even a single audit can uncover a crucial leak to fix before your next session.")}
          ${button({ label: "Audit a Trade", href: URLS.analyse })}
        `)}
      `,
      category: "marketing",
    }),
  }),
};
