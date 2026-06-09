import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function TradingDisclaimer() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.back}>
        <ArrowLeft size={14} /> Retour
      </button>

      <div style={styles.header}>
        <AlertTriangle size={32} color="#F59E0B" />
        <h1 style={styles.title}>Avertissement sur les Risques de Trading</h1>
        <p style={styles.date}>Trading Risk Disclaimer</p>
      </div>

      <div style={styles.mainDisclaimer}>
        <p style={styles.mainText}>
          <strong>THIS TOOL DOES NOT PROVIDE FINANCIAL ADVICE.</strong>
        </p>
        <p style={styles.mainText}>
          MySmartJournal est un outil de journalisation personnel. Toutes les informations, analyses et contenus fournis sont à titre <strong>éducatif et informatif uniquement</strong>.
        </p>
      </div>

      <div style={styles.content}>
        <RiskSection title="Risques du Trading">
          <p>Le trading de devises (Forex), d'actions, de contrats à terme, d'options, de crypto-monnaies et d'autres instruments financiers comporte des risques substantiels :</p>
          <ul>
            <li>Vous pouvez perdre tout ou partie de votre capital investi</li>
            <li>Le trading avec effet de levier amplifie les gains ET les pertes</li>
            <li>Les performances passées ne garantissent pas les résultats futurs</li>
            <li>Les marchés financiers peuvent évoluer de manière imprévisible</li>
          </ul>
        </RiskSection>

        <RiskSection title="Limitations de l'IA">
          <p>Les analyses générées par intelligence artificielle dans MySmartJournal :</p>
          <ul>
            <li>Sont basées sur des modèles statistiques et ne constituent pas des conseils professionnels</li>
            <li>Ne tiennent pas compte de votre situation financière personnelle</li>
            <li>Peuvent être incorrectes ou incomplètes</li>
            <li>Ne doivent jamais être utilisées comme seule base de décision de trading</li>
          </ul>
        </RiskSection>

        <RiskSection title="Pas de conseil financier">
          <p>MySmartJournal n'est pas :</p>
          <ul>
            <li>Un conseiller en investissements financiers agréé</li>
            <li>Un gestionnaire de portefeuille</li>
            <li>Un prestataire de services d'investissement</li>
          </ul>
          <p>Si vous avez besoin de conseils financiers, consultez un professionnel agréé et réglementé.</p>
        </RiskSection>

        <RiskSection title="Responsabilité">
          <p>En utilisant MySmartJournal, vous reconnaissez et acceptez que :</p>
          <ul>
            <li>Vous tradez à vos propres risques</li>
            <li>MySmartJournal ne peut être tenu responsable de vos pertes financières</li>
            <li>Vous avez lu et compris cet avertissement</li>
            <li>Vous n'utilisez ce service que si vous comprenez les risques du trading</li>
          </ul>
        </RiskSection>
      </div>
    </div>
  );
}

function RiskSection({ title, children }) {
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
  mainDisclaimer: { backgroundColor: "#451A0322", border: "1px solid #F59E0B44", borderRadius: "10px", padding: "24px", marginBottom: "28px", textAlign: "center" },
  mainText: { color: "#F59E0B", fontSize: "1rem", lineHeight: "1.7", margin: "0 0 8px 0" },
  content: { display: "flex", flexDirection: "column" },
  section: { padding: "20px 0", borderBottom: "1px solid #1E2D45" },
  sectionTitle: { fontSize: "1rem", fontWeight: "700", color: "#E8EDF5", margin: "0 0 10px 0" },
  sectionContent: { color: "#94A3B8", fontSize: "0.875rem", lineHeight: "1.7" },
};