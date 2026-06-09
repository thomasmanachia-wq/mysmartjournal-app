import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.back}>
        <ArrowLeft size={14} /> Retour
      </button>

      <div style={styles.header}>
        <Lock size={28} color="#3B82F6" />
        <h1 style={styles.title}>Politique de Confidentialité</h1>
        <p style={styles.date}>Dernière mise à jour : Mai 2025</p>
      </div>

      <div style={styles.content}>
        <Section title="1. Données collectées">
          <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
          <ul>
            <li><strong>Données de compte :</strong> email, mot de passe (chiffré)</li>
            <li><strong>Données de trading :</strong> trades, notes, analyses que vous saisissez</li>
            <li><strong>Données de paiement :</strong> gérées exclusivement par Stripe (nous ne stockons pas vos données bancaires)</li>
            <li><strong>Données d'utilisation :</strong> nombre d'analyses effectuées</li>
          </ul>
        </Section>

        <Section title="2. Utilisation des données">
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Fournir les fonctionnalités de MySmartJournal</li>
            <li>Générer des analyses IA personnalisées</li>
            <li>Gérer votre abonnement</li>
            <li>Améliorer nos services (données anonymisées uniquement)</li>
          </ul>
          <p><strong>Nous ne vendons jamais vos données à des tiers.</strong></p>
        </Section>

        <Section title="3. Stockage et sécurité">
          <p>Vos données sont stockées de manière sécurisée via Supabase (infrastructure PostgreSQL). Nous appliquons :</p>
          <ul>
            <li>Chiffrement des données en transit (HTTPS/TLS)</li>
            <li>Row Level Security (RLS) — chaque utilisateur n'accède qu'à ses propres données</li>
            <li>Authentification sécurisée via Supabase Auth</li>
          </ul>
        </Section>

        <Section title="4. Services tiers">
          <ul>
            <li><strong>Supabase :</strong> base de données et authentification</li>
            <li><strong>Stripe :</strong> traitement des paiements</li>
            <li><strong>OpenAI :</strong> analyses IA (vos données de trade sont envoyées pour analyse)</li>
          </ul>
        </Section>

        <Section title="5. Vos droits (RGPD)">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger vos données</li>
            <li><strong>Droit à l'effacement :</strong> supprimer votre compte et toutes vos données</li>
            <li><strong>Droit à la portabilité :</strong> exporter vos données</li>
          </ul>
          <p>Pour exercer ces droits : support@mysmartjournal.com</p>
        </Section>

        <Section title="6. Cookies">
          <p>Nous utilisons uniquement des cookies techniques nécessaires au fonctionnement du service (session d'authentification). Aucun cookie publicitaire ou de tracking.</p>
        </Section>

        <Section title="7. Contact DPO">
          <p>Délégué à la Protection des Données : dpo@mysmartjournal.com</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
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
  content: { display: "flex", flexDirection: "column" },
  section: { padding: "20px 0", borderBottom: "1px solid #1E2D45" },
  sectionTitle: { fontSize: "1rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 10px 0" },
  sectionContent: { color: "#94A3B8", fontSize: "0.875rem", lineHeight: "1.7" },
};