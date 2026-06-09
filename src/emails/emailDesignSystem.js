import { EMAIL_CATEGORIES, PRODUCT, URLS, EMAILS, getUnsubscribeUrl } from "./emailConfig.js";

const tokens = {
  pageBg: "#F8FAFC",
  card: "#FFFFFF",
  cardAlt: "#F1F5F9",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  text: "#0F172A",
  muted: "#475569",
  subtle: "#64748B",
  faint: "#94A3B8",
  blue: "#2563EB",
  blueDark: "#1D4ED8",
  blueSoft: "#EFF6FF",
  green: "#059669",
  amber: "#B45309",
  red: "#DC2626",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeRichText(value) {
  return String(value ?? "")
    .replace(/color:\s*#E8EDF5/gi, `color:${tokens.text}`)
    .replace(/color:\s*#94A3B8/gi, `color:${tokens.muted}`)
    .replace(/color:\s*#6B7FA3/gi, `color:${tokens.subtle}`);
}

function css(styles) {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${value}`)
    .join(";");
}

export function heading(text, { eyebrow } = {}) {
  return `
    ${eyebrow ? `<p style="${css(styles.eyebrow)}">${escapeHtml(eyebrow)}</p>` : ""}
    <h1 class="msj-title" style="${css(styles.h1)}">${escapeHtml(text)}</h1>
  `;
}

export function paragraph(text, options = {}) {
  return `<p style="${css({ ...styles.p, ...(options.style || {}) })}">${normalizeRichText(text)}</p>`;
}

export function card(content, options = {}) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="msj-card" style="${css({ ...styles.card, ...(options.style || {}) })}">
      <tr>
        <td class="msj-card-cell" style="${css(styles.cardCell)}">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

export function button({ label, href, variant = "primary" }) {
  const isSecondary = variant === "secondary";
  const buttonStyles = isSecondary
    ? { ...styles.button, ...styles.buttonSecondary }
    : styles.button;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="${css(styles.buttonTable)}">
      <tr>
        <td class="msj-button-cell" style="${css(buttonStyles)}">
          <a class="msj-button-link" href="${escapeHtml(href)}" style="${css(isSecondary ? styles.buttonSecondaryLink : styles.buttonLink)}">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function secondaryLink({ label, href }) {
  return `
    <a href="${escapeHtml(href)}" style="${css(styles.secondaryLink)}">
      ${escapeHtml(label)}
    </a>
  `;
}

export function list(items) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${css(styles.list)}">
      ${items.map((item) => `
        <tr>
          <td width="24" valign="top" style="${css(styles.listIconCell)}">
            <span style="${css(styles.check)}">✓</span>
          </td>
          <td style="${css(styles.listText)}">${normalizeRichText(item)}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

export function notice(content, variant = "info") {
  const palette = variant === "warning"
    ? { color: tokens.amber, bg: "#FFFBEB", border: "#FDE68A" }
    : variant === "danger"
      ? { color: tokens.red, bg: "#FEF2F2", border: "#FECACA" }
      : { color: tokens.blueDark, bg: tokens.blueSoft, border: "#BFDBFE" };

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${css({ ...styles.notice, backgroundColor: palette.bg, borderColor: palette.border })}">
      <tr>
        <td style="${css(styles.noticeCell)}">
          <p style="${css({ ...styles.noticeText, color: palette.color })}">${normalizeRichText(content)}</p>
        </td>
      </tr>
    </table>
  `;
}

export function metricGrid(metrics) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${css(styles.metricTable)}">
      <tr>
        ${metrics.map((metric) => `
          <td class="msj-metric-cell" style="${css(styles.metricCell)}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${css(styles.metricBox)}">
              <tr>
                <td>
                  <p style="${css(styles.metricValue)}">${escapeHtml(metric.value)}</p>
                  <p style="${css(styles.metricLabel)}">${escapeHtml(metric.label)}</p>
                </td>
              </tr>
            </table>
          </td>
        `).join("")}
      </tr>
    </table>
  `;
}

export function keyValueRows(rows) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${css(styles.kvWrap)}">
      ${rows.map((row) => `
        <tr>
          <td style="${css(styles.kvLabel)}">${escapeHtml(row.label)}</td>
          <td align="right" style="${css(styles.kvValue)}">${escapeHtml(row.value)}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

export function renderEmailLayout({
  preheader,
  content,
  category = EMAIL_CATEGORIES.LIFECYCLE,
  locale = "fr",
}) {
  const isTransactional = category === EMAIL_CATEGORIES.TRANSACTIONAL;
  const unsubscribeUrl = getUnsubscribeUrl();
  const preferenceLabel = isTransactional
    ? locale === "en" ? "Account preferences" : "Préférences du compte"
    : locale === "en" ? "Email preferences" : "Préférences email";

  return `
<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(PRODUCT.name)}</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 640px) {
      .msj-shell { padding: 22px 14px !important; }
      .msj-container { width: 100% !important; }
      .msj-logo-text { font-size: 16px !important; }
      .msj-card-cell { padding: 26px 22px !important; }
      .msj-title { font-size: 25px !important; line-height: 1.2 !important; }
      .msj-button-cell { display: block !important; width: 100% !important; }
      .msj-button-link { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
      .msj-metric-cell { display: block !important; width: 100% !important; padding-right: 0 !important; padding-bottom: 10px !important; }
      .msj-footer-links a { display: inline-block !important; margin: 4px 3px !important; }
    }
  </style>
</head>
<body style="${css(styles.body)}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${css(styles.page)}">
    <tr>
      <td align="center" class="msj-shell" style="${css(styles.shell)}">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="msj-container" style="${css(styles.container)}">
          <tr>
            <td style="${css(styles.headerCell)}">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="34" height="34" align="center" valign="middle" style="${css(styles.logoMark)}">M</td>
                  <td style="${css(styles.logoTextCell)}">
                    <p class="msj-logo-text" style="${css(styles.product)}">${escapeHtml(PRODUCT.name)}</p>
                    <p style="${css(styles.tagline)}">${escapeHtml(PRODUCT.tagline[locale] || PRODUCT.tagline.fr)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="${css(styles.footer)}">
              <p style="${css(styles.footerText)}">${escapeHtml(PRODUCT.disclaimer[locale] || PRODUCT.disclaimer.fr)}</p>
              <p class="msj-footer-links" style="${css(styles.footerLinks)}">
                <a href="${escapeHtml(URLS.supportMailto)}" style="${css(styles.footerLink)}">Support</a>
                <span style="${css(styles.footerDot)}">·</span>
                <a href="${escapeHtml(unsubscribeUrl)}" style="${css(styles.footerLink)}">${escapeHtml(preferenceLabel)}</a>
                <span style="${css(styles.footerDot)}">·</span>
                <a href="${escapeHtml(URLS.privacy)}" style="${css(styles.footerLink)}">Confidentialité</a>
                <span style="${css(styles.footerDot)}">·</span>
                <a href="${escapeHtml(URLS.terms)}" style="${css(styles.footerLink)}">Mentions légales</a>
              </p>
              <p style="${css(styles.footerBrand)}">© ${new Date().getFullYear()} ${escapeHtml(PRODUCT.name)} · ${escapeHtml(EMAILS.support)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: tokens.pageBg,
    color: tokens.text,
    fontFamily: "-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Arial,sans-serif",
  },
  page: {
    width: "100%",
    backgroundColor: tokens.pageBg,
  },
  shell: {
    padding: "36px 18px",
  },
  container: {
    width: "600px",
    maxWidth: "600px",
  },
  headerCell: {
    padding: "0 0 18px 0",
  },
  logoMark: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    backgroundColor: tokens.blue,
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: 800,
    lineHeight: "34px",
    textAlign: "center",
  },
  logoTextCell: {
    paddingLeft: "11px",
  },
  product: {
    margin: "0 0 1px 0",
    color: tokens.blue,
    fontSize: "17px",
    lineHeight: 1.2,
    fontWeight: 800,
  },
  tagline: {
    margin: 0,
    color: tokens.subtle,
    fontSize: "12px",
    lineHeight: 1.35,
  },
  card: {
    backgroundColor: tokens.card,
    border: `1px solid ${tokens.border}`,
    borderRadius: "18px",
    margin: "0 0 16px 0",
    boxShadow: "0 14px 34px rgba(15,23,42,0.07)",
    overflow: "hidden",
  },
  cardCell: {
    padding: "34px 36px",
  },
  eyebrow: {
    margin: "0 0 10px 0",
    color: tokens.blue,
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.11em",
    lineHeight: 1.35,
    textTransform: "uppercase",
  },
  h1: {
    margin: "0 0 14px 0",
    color: tokens.text,
    fontSize: "30px",
    lineHeight: 1.15,
    fontWeight: 760,
  },
  p: {
    margin: "0 0 16px 0",
    color: tokens.muted,
    fontSize: "16px",
    lineHeight: 1.65,
    fontWeight: 450,
  },
  buttonTable: {
    margin: "24px 0 0 0",
  },
  button: {
    backgroundColor: tokens.blue,
    borderRadius: "10px",
    boxShadow: "0 8px 18px rgba(37,99,235,0.18)",
  },
  buttonLink: {
    color: "#FFFFFF",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: 1,
    padding: "15px 22px",
    textDecoration: "none",
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    border: `1px solid ${tokens.borderStrong}`,
    boxShadow: "none",
  },
  buttonSecondaryLink: {
    color: tokens.text,
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: 1,
    padding: "14px 21px",
    textDecoration: "none",
  },
  secondaryLink: {
    color: tokens.blue,
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
  },
  list: {
    margin: "18px 0 2px 0",
  },
  listIconCell: {
    padding: "0 8px 10px 0",
  },
  check: {
    color: tokens.blue,
    display: "inline-block",
    fontSize: "13px",
    fontWeight: 800,
    lineHeight: "20px",
  },
  listText: {
    color: tokens.muted,
    fontSize: "15px",
    lineHeight: 1.55,
    paddingBottom: "10px",
  },
  notice: {
    backgroundColor: tokens.blueSoft,
    border: "1px solid #BFDBFE",
    borderRadius: "14px",
    margin: "0 0 16px 0",
  },
  noticeCell: {
    padding: "16px 18px",
  },
  noticeText: {
    margin: 0,
    color: tokens.blueDark,
    fontSize: "14px",
    lineHeight: 1.55,
    fontWeight: 600,
  },
  metricTable: {
    margin: "18px 0 6px 0",
  },
  metricCell: {
    padding: "0 10px 10px 0",
  },
  metricBox: {
    backgroundColor: tokens.cardAlt,
    border: `1px solid ${tokens.border}`,
    borderRadius: "14px",
  },
  metricValue: {
    margin: "0",
    padding: "16px 16px 3px 16px",
    color: tokens.text,
    fontSize: "20px",
    lineHeight: 1.25,
    fontWeight: 780,
  },
  metricLabel: {
    margin: "0",
    padding: "0 16px 16px 16px",
    color: tokens.subtle,
    fontSize: "12px",
    lineHeight: 1.35,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  kvWrap: {
    borderTop: `1px solid ${tokens.border}`,
    margin: "18px 0 0 0",
  },
  kvLabel: {
    borderBottom: `1px solid ${tokens.border}`,
    color: tokens.subtle,
    fontSize: "14px",
    lineHeight: 1.45,
    padding: "13px 0",
  },
  kvValue: {
    borderBottom: `1px solid ${tokens.border}`,
    color: tokens.text,
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.45,
    padding: "13px 0",
  },
  footer: {
    padding: "13px 8px 0 8px",
    textAlign: "center",
  },
  footerText: {
    margin: "0 0 10px 0",
    color: tokens.subtle,
    fontSize: "12px",
    lineHeight: 1.55,
  },
  footerLinks: {
    margin: "0 0 10px 0",
    color: tokens.faint,
    fontSize: "12px",
    lineHeight: 1.55,
  },
  footerLink: {
    color: tokens.subtle,
    fontSize: "12px",
    fontWeight: 650,
    textDecoration: "none",
  },
  footerDot: {
    color: tokens.faint,
    padding: "0 5px",
  },
  footerBrand: {
    margin: 0,
    color: tokens.faint,
    fontSize: "11px",
    lineHeight: 1.5,
  },
};
