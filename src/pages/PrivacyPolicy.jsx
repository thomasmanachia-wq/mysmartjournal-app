import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.back}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={styles.header}>
        <Lock size={28} color="#3B82F6" />
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.date}>Last updated: May 2025</p>
      </div>

      <div style={styles.content}>
        <Section title="1. Data Collected">
          <p>We only collect data strictly necessary to provide and operate the service:</p>
          <ul>
            <li><strong>Account data:</strong> email address, encrypted credentials</li>
            <li><strong>Trading data:</strong> logged trades, entry/exit prices, notes, setups, and reflections</li>
            <li><strong>Payment data:</strong> managed exclusively by Stripe (we never store banking or card details)</li>
            <li><strong>Usage data:</strong> audit counters, feature interaction telemetry</li>
          </ul>
        </Section>

        <Section title="2. Use of Data">
          <p>Your data is used exclusively to:</p>
          <ul>
            <li>Deliver core MySmartJournal logging and journal features</li>
            <li>Generate contextual AI trade audits and performance feedback</li>
            <li>Manage account access and subscription status</li>
            <li>Maintain platform reliability and security (anonymized telemetry only)</li>
          </ul>
          <p><strong>We never sell or rent your personal or trading data to third parties.</strong></p>
        </Section>

        <Section title="3. Storage and Security">
          <p>Your data is securely stored via Supabase on encrypted cloud infrastructure (PostgreSQL). We enforce:</p>
          <ul>
            <li>Encryption in transit via HTTPS / TLS 1.3</li>
            <li>Strict Row Level Security (RLS) — each trader can only read and write their own data</li>
            <li>Secure session token authentication via Supabase Auth</li>
          </ul>
        </Section>

        <Section title="4. Third-Party Services">
          <ul>
            <li><strong>Supabase:</strong> database hosting and authentication</li>
            <li><strong>Stripe:</strong> secure subscription and payment processing</li>
            <li><strong>AI Providers (OpenAI / Anthropic):</strong> contextual trade analysis processing</li>
          </ul>
        </Section>

        <Section title="5. Your Rights (GDPR & CCPA)">
          <p>In accordance with data protection regulations, you hold the following rights:</p>
          <ul>
            <li><strong>Right of access:</strong> request an export or copy of your personal data</li>
            <li><strong>Right to rectification:</strong> modify and correct your data at any time</li>
            <li><strong>Right to erasure:</strong> permanently delete your account and all associated trades</li>
            <li><strong>Right to portability:</strong> export your trade records</li>
          </ul>
          <p>To exercise any of these rights: support@mysmartjournal.com</p>
        </Section>

        <Section title="6. Cookies & Tracking">
          <p>We strictly use essential cookies required for session persistence and authentication. We do not use third-party tracking or advertising ad-tech cookies.</p>
        </Section>

        <Section title="7. Data Protection Officer">
          <p>Data Protection contact: dpo@mysmartjournal.com</p>
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