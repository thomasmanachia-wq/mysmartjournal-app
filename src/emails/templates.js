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

function render({ preheader, content, category, locale = "fr" }) {
  return renderEmailLayout({ preheader, content, category, locale });
}

export const templates = {
  welcome: ({ firstName } = {}) => ({
    subject: "Bienvenue dans MySmartJournal",
    html: render({
      preheader: "Votre coach de progression est prêt à être configuré.",
      content: `
        ${card(`
          ${heading(`Bienvenue${firstName ? `, ${firstName}` : ""}`, { eyebrow: "Démarrage" })}
          ${paragraph("MySmartJournal est conçu pour vous aider à mieux lire vos décisions de trading : exécution, discipline, contexte et progression.")}
          ${paragraph("La première étape utile est simple : renseigner un trade proprement, puis laisser l'IA vous retourner un diagnostic exploitable.")}
          ${button({ label: "Analyser un premier trade", href: URLS.analyse })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">Ce que le coach va construire avec vous</strong>")}
          ${list([
            "Un historique structuré de vos trades.",
            "Des retours sur vos erreurs récurrentes.",
            "Des axes de progression orientés discipline, exécution et réflexion.",
          ])}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  firstAnalysisCompleted: ({ pair, score } = {}) => ({
    subject: "Votre première analyse IA est prête",
    html: render({
      preheader: "Un premier point de repère pour améliorer votre prochain trade.",
      content: `
        ${card(`
          ${heading("Votre premier diagnostic est prêt", { eyebrow: "Analyse IA" })}
          ${paragraph("Vous avez maintenant un premier point de repère. L'objectif n'est pas de juger un trade isolé, mais d'identifier ce qui mérite d'être répété ou corrigé dès la prochaine exécution.")}
          ${pair || score ? metricGrid([
            ...(pair ? [{ value: pair, label: "Instrument" }] : []),
            ...(score ? [{ value: `${score}/10`, label: "Score IA" }] : []),
            { value: "1", label: "Analyse" },
          ]) : ""}
          ${paragraph("Relisez surtout le plan d'action : c'est la partie qui transforme l'analyse en progression concrète.")}
          ${button({ label: "Voir mon journal", href: URLS.journal })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">Question utile avant le prochain trade</strong>")}
          ${paragraph("Quelle condition précise doit être validée avant votre prochaine entrée ? Si la réponse n'est pas claire, le trade mérite probablement d'attendre.")}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  premiumActivated: () => ({
    subject: "Premium activé — votre accès est prêt",
    html: render({
      preheader: "Votre accès Premium MySmartJournal est maintenant actif.",
      content: `
        ${card(`
          ${heading("Votre espace Premium est actif", { eyebrow: "Abonnement" })}
          ${paragraph("Votre accès Premium est confirmé. Vous pouvez continuer à analyser vos trades avec davantage de profondeur et un quota Premium pensé pour un usage intensif.")}
          ${list([
            "Analyses IA étendues pour approfondir vos décisions.",
            "Questions de réflexion pour renforcer la discipline.",
            "Plans d'action plus complets après chaque trade.",
            "Accès prioritaire au support.",
          ])}
          ${button({ label: "Lancer une analyse", href: URLS.analyse, variant: "success" })}
        `)}
        ${notice("Les analyses restent éducatives : elles vous aident à structurer votre réflexion, sans fournir de conseil financier.", "info")}
      `,
      category: "transactional",
    }),
  }),

  paymentFailed: () => ({
    subject: "Action requise — paiement non validé",
    html: render({
      preheader: "Votre dernier paiement Premium n'a pas pu être traité.",
      content: `
        ${card(`
          ${heading("Paiement non validé", { eyebrow: "Facturation" })}
          ${paragraph("Stripe nous a indiqué que le dernier paiement de votre abonnement Premium n'a pas pu être traité. Votre accès n'est pas rétrogradé immédiatement : Stripe peut retenter le paiement selon la configuration de facturation.")}
          ${paragraph("Pour éviter une interruption future, vérifiez votre moyen de paiement depuis votre espace de facturation.")}
          ${button({ label: "Ouvrir la facturation", href: URLS.billing, variant: "danger" })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">À vérifier en priorité</strong>")}
          ${list([
            "Carte expirée ou remplacée.",
            "Authentification bancaire demandée.",
            "Limite de paiement ou fonds indisponibles.",
          ])}
        `)}
      `,
      category: "transactional",
    }),
  }),

  onboardingDay1: () => ({
    subject: "Votre journal devient utile dès le premier trade",
    html: render({
      preheader: "Une habitude simple pour rendre vos décisions plus lisibles.",
      content: `
        ${card(`
          ${heading("Commencez par un trade propre", { eyebrow: "Jour 1" })}
          ${paragraph("Un journal de trading n'a pas besoin d'être long pour être utile. Il doit surtout capturer les éléments qui expliquent votre décision : contexte, niveau de risque, émotion, exécution.")}
          ${paragraph("Le premier objectif est de créer une trace fiable. La progression viendra ensuite de la répétition et de la comparaison.")}
          ${button({ label: "Loguer un trade", href: URLS.analyse })}
        `)}
        ${card(`
          ${paragraph("<strong style=\"color:#E8EDF5;\">Repère simple</strong>")}
          ${paragraph("Avant d'entrer en position, essayez de pouvoir formuler votre raison d'entrée en une phrase. Si elle est confuse, votre exécution le sera souvent aussi.")}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  onboardingDay3: () => ({
    subject: "Ce que vos émotions disent de votre exécution",
    html: render({
      preheader: "Un point de lecture utile pour vos prochains trades.",
      content: `
        ${card(`
          ${heading("Observez le contexte mental", { eyebrow: "Jour 3" })}
          ${paragraph("Une bonne analyse technique peut être dégradée par une mauvaise condition d'exécution : précipitation, frustration, peur de rater le mouvement, envie de se refaire.")}
          ${paragraph("Noter l'émotion pré-trade ne sert pas à se juger. Cela sert à repérer les situations où votre prise de décision devient moins stable.")}
          ${button({ label: "Analyser un trade", href: URLS.analyse })}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  onboardingDay5: ({ hasAnalysis }) => ({
    subject: hasAnalysis ? "Transformez l'analyse en plan d'action" : "Votre première analyse peut servir de point de départ",
    html: render({
      preheader: "Une analyse utile doit améliorer la prochaine exécution.",
      content: `
        ${card(`
          ${heading(hasAnalysis ? "Passez de l'observation à l'action" : "Créez un premier point de repère", { eyebrow: "Progression" })}
          ${paragraph(hasAnalysis
            ? "Vous avez déjà généré une analyse. Le plus important maintenant est de choisir une correction simple à appliquer sur le prochain trade."
            : "Si vous n'avez pas encore testé l'analyse IA, commencez avec un trade récent. L'objectif est d'obtenir un diagnostic clair, pas parfait."
          )}
          ${list([
            "Identifier une erreur prioritaire.",
            "Définir une règle d'exécution simple.",
            "Comparer le prochain trade avec cette règle.",
          ])}
          ${button({ label: hasAnalysis ? "Revoir mes paramètres" : "Lancer une analyse", href: hasAnalysis ? URLS.billing : URLS.analyse, variant: hasAnalysis ? "warning" : "primary" })}
        `)}
      `,
      category: "marketing",
    }),
  }),

  onboardingDay7: ({ tradesCount = 0, firstFocus = "discipline" } = {}) => ({
    subject: "Votre premier bilan de progression",
    html: render({
      preheader: "Une semaine suffit pour commencer à observer vos patterns.",
      content: `
        ${card(`
          ${heading("Un premier bilan vaut mieux qu'une impression", { eyebrow: "Jour 7" })}
          ${paragraph("Après quelques jours, l'objectif n'est pas encore d'avoir beaucoup de données. L'objectif est de commencer à reconnaître vos conditions de bonne et de mauvaise exécution.")}
          ${metricGrid([
            { value: String(tradesCount), label: "Trades suivis" },
            { value: firstFocus, label: "Axe à observer" },
            { value: "7j", label: "Fenêtre" },
          ])}
          ${paragraph("Cette semaine, choisissez un seul point à surveiller : attendre le setup complet, respecter le risque, ou éviter les entrées impulsives.")}
          ${button({ label: "Ouvrir mon dashboard", href: URLS.dashboard })}
        `)}
      `,
      category: "lifecycle",
    }),
  }),

  retentionInactive: ({ daysSinceLogin, tradesCount }) => ({
    subject: "Reprendre le fil de votre journal",
    html: render({
      preheader: "Quelques minutes suffisent pour remettre votre historique à jour.",
      content: `
        ${card(`
          ${heading("Votre journal gagne en précision avec la régularité", { eyebrow: "Suivi" })}
          ${paragraph(`Vous n'avez pas ouvert MySmartJournal depuis <strong style="color:#E8EDF5;">${daysSinceLogin} jours</strong>. Revenir au journal ne demande pas de tout rattraper : commencez par le dernier trade dont vous vous souvenez clairement.`)}
          ${tradesCount > 0 ? keyValueRows([{ label: "Trades déjà suivis", value: String(tradesCount) }]) : ""}
          ${button({ label: "Reprendre mon journal", href: URLS.journal })}
        `)}
      `,
      category: "marketing",
    }),
  }),

  retentionNoAnalysis: () => ({
    subject: "Un diagnostic IA peut clarifier votre prochain axe de travail",
    html: render({
      preheader: "Utilisez l'analyse IA comme point de départ, pas comme verdict.",
      content: `
        ${card(`
          ${heading("Essayez une analyse sur un trade réel", { eyebrow: "Coach IA" })}
          ${paragraph("L'analyse IA est plus utile lorsqu'elle part d'un trade concret : entrée, stop, cible, contexte et émotion. Elle vous aide ensuite à isoler ce qui doit être répété ou corrigé.")}
          ${paragraph("Même une seule analyse peut révéler une règle simple à appliquer au prochain trade.")}
          ${button({ label: "Analyser un trade", href: URLS.analyse })}
        `)}
      `,
      category: "marketing",
    }),
  }),
};
