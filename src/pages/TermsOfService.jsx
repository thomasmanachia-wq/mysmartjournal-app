import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, FileText } from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.back}>
        <ArrowLeft size={14} /> Retour
      </button>

      <div style={styles.header}>
        <FileText size={28} color="#3B82F6" />
        <h1 style={styles.title}>Conditions Générales d'Utilisation</h1>
        <p style={styles.date}>Dernière mise à jour : Mai 2025</p>
      </div>

      <div style={styles.disclaimer}>
        <AlertTriangle size={16} color="#F59E0B" />
        <p style={styles.disclaimerText}>
          <strong>AVIS IMPORTANT :</strong> MySmartJournal est un outil de journalisation et d'analyse.
          Il ne constitue pas un conseil financier. Trading involves risk of loss.
        </p>
      </div>

      <div style={styles.content}>
        <Section title="1. Acceptation des conditions">
          <p>En accédant à MySmartJournal, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, n'utilisez pas ce service.</p>
        </Section>

        <Section title="2. Description du service">
          <p>MySmartJournal est une plateforme SaaS de journalisation de trades permettant aux traders d'enregistrer, analyser et suivre leurs performances de trading. Le service comprend :</p>
          <ul>
            <li>Un journal de trading personnel</li>
            <li>Des outils d'analyse de performance</li>
            <li>Des feedbacks générés par intelligence artificielle</li>
            <li>Un tableau de bord analytique</li>
          </ul>
        </Section>

        <Section title="3. Avertissement sur les risques financiers" highlight>
          <p><strong>⚠️ DISCLAIMER FINANCIER OBLIGATOIRE :</strong></p>
          <p>MySmartJournal <strong>ne fournit PAS de conseils financiers</strong>. Ce service est exclusivement un outil de journalisation et d'organisation personnelle.</p>
          <p>Les analyses générées par l'intelligence artificielle sont fournies à titre <strong>informatif uniquement</strong> et ne constituent en aucun cas :</p>
          <ul>
            <li>Des recommandations d'investissement</li>
            <li>Des conseils en investissements financiers</li>
            <li>Des signaux de trading</li>
            <li>Des garanties de performance</li>
          </ul>
          <p>Le trading de devises, d'actions, de cryptomonnaies et d'autres instruments financiers comporte des risques significatifs de perte en capital. Les performances passées ne présagent pas des performances futures.</p>
          <p><strong>"This tool does not provide financial advice. All trading involves risk of substantial loss."</strong></p>
        </Section>

        <Section title="4. Compte utilisateur">
          <p>Vous êtes responsable de la confidentialité de vos identifiants de connexion. Vous vous engagez à :</p>
          <ul>
            <li>Fournir des informations exactes lors de l'inscription</li>
            <li>Maintenir la sécurité de votre compte</li>
            <li>Notifier immédiatement tout accès non autorisé</li>
          </ul>
        </Section>

        <Section title="5. Abonnement et paiement">
          <p>MySmartJournal propose un plan gratuit avec fonctionnalités limitées et un plan Premium à 7.99€/mois. Les paiements sont traités de manière sécurisée via Stripe. L'abonnement est renouvelé automatiquement sauf annulation préalable depuis les paramètres.</p>
        </Section>

        <Section title="6. Propriété intellectuelle">
          <p>Tout le contenu de MySmartJournal (code, design, textes) est la propriété exclusive de MySmartJournal. Vos données de trading restent votre propriété.</p>
        </Section>

        <Section title="7. Limitation de responsabilité">
          <p>MySmartJournal ne peut être tenu responsable de toute perte financière résultant de l'utilisation de ce service. L'utilisation des analyses IA est entièrement à vos risques et périls.</p>
        </Section>

        <Section title="8. Résiliation">
          <p>Vous pouvez résilier votre compte à tout moment depuis les paramètres. En cas de violation des présentes conditions, nous nous réservons le droit de suspendre ou supprimer votre compte.</p>
        </Section>

        <Section title="9. Contact">
          <p>Pour toute question : support@mysmartjournal.com</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, highlight }) {
  return (
    <div style={{ ...styles.section, backgroundColor: highlight ? "#451A0311" : "transparent", borderColor: highlight ? "#F59E0B33" : "#1E2D45", borderWidth: highlight ? "1px" : "0 0 1px 0" }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionContent}>{children}</div>
    </div>
  );
}

const styles = {
  page: { padding: "36px 32px", maxWidth: "800px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  back: { display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", border: "1px solid #1E2D45", borderRadius: "7px", color: "#6B7FA3", fontSize: "0.78rem", padding: "6px 12px", cursor: "pointer", fontFamily: "'Inter', sans-serif", marginBottom: "28px" },
  header: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "28px", textAlign: "center" },
  title: { fontSize: "1.8rem", fontWeight: "700", color: "#E8EDF5", margin: 0 },
  date: { color: "#6B7FA3", fontSize: "0.85rem", margin: 0 },
  disclaimer: { display: "flex", gap: "12px", alignItems: "flex-start", backgroundColor: "#451A0322", border: "1px solid #F59E0B44", borderRadius: "10px", padding: "16px 20px", marginBottom: "28px" },
  disclaimerText: { color: "#F59E0B", fontSize: "0.875rem", lineHeight: "1.6", margin: 0 },
  content: { display: "flex", flexDirection: "column", gap: "0" },
  section: { padding: "20px 0", borderStyle: "solid" },
  sectionTitle: { fontSize: "1rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 10px 0" },
  sectionContent: { color: "#94A3B8", fontSize: "0.875rem", lineHeight: "1.7" },
};