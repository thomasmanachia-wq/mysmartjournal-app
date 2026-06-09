<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the MySmartJournal Node.js backend (`server.js`). The `posthog-node` SDK was installed and initialized with exception autocapture enabled. Nine server-side events were instrumented across all critical business routes — covering the full premium upgrade flow (checkout → webhook confirmation), subscription cancellations, AI trade analyses (both free-limited and premium), and the daily analysis limit gate. Exception capture was added to every error handler and error path. Graceful shutdown hooks (`SIGINT`/`SIGTERM`) ensure no events are lost on server restart. The PostHog CORS allowed headers were updated to accept `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` for future client-server user correlation.

| Event | Description | File |
|-------|-------------|------|
| `checkout_session_created` | User successfully initiated a Stripe checkout session to upgrade to Premium | `server.js` |
| `checkout_session_creation_failed` | Exception captured when checkout session creation fails (via `captureException`) | `server.js` |
| `subscription_upgraded` | Stripe webhook confirmed user upgraded to Premium (`checkout.session.completed`) | `server.js` |
| `subscription_cancelled_by_webhook` | Stripe webhook confirmed subscription deleted (`customer.subscription.deleted`) | `server.js` |
| `payment_failed` | Stripe webhook reported an invoice payment failure | `server.js` |
| `subscription_cancelled_by_user` | User manually cancelled their subscription | `server.js` |
| `trade_analyzed` | Premium AI trade analysis completed successfully | `server.js` |
| `trade_analysis_free_limited` | Free user received limited analysis response (upgrade prompt shown) | `server.js` |
| `analysis_limit_reached` | User hit their daily AI analysis limit (free: 3/day, premium: 50/day) | `server.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/681465)
- [Subscription Upgrade Funnel](/insights/ORjhP2RY) — Conversion rate from checkout initiated to premium confirmed
- [Daily Trade Analyses (Premium)](/insights/2XPREMd8) — Premium AI analysis usage over time
- [Subscription Cancellations](/insights/NfHLoTVp) — User & webhook cancellations and payment failures (weekly, 90 days)
- [Free vs Premium Analysis Usage](/insights/GnxL0Ien) — Side-by-side free/premium analysis volume (upgrade pressure signal)
- [Analysis Limit Reached (Upgrade Signal)](/insights/4aX6qL8M) — Unique users hitting daily limits — your best upgrade candidates

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_node/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
