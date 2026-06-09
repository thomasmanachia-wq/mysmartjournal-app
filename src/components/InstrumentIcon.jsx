const FLAG_MAP = {
  EUR: "eu",
  USD: "us",
  GBP: "gb",
  JPY: "jp",
  CHF: "ch",
  AUD: "au",
  CAD: "ca",
  NZD: "nz",
};

const CRYPTO_META = {
  BTC: { label: "₿", bg: "#F7931A", fg: "#FFFFFF" },
  ETH: { label: "Ξ", bg: "#627EEA", fg: "#FFFFFF" },
  SOL: { label: "S", bg: "#14F195", fg: "#08111F" },
  XRP: { label: "X", bg: "#23292F", fg: "#FFFFFF" },
  BNB: { label: "B", bg: "#F3BA2F", fg: "#111827" },
  ADA: { label: "A", bg: "#246BFE", fg: "#FFFFFF" },
};

const INDEX_META = {
  US30: { label: "US", bg: "#1E3A8A" },
  NAS100: { label: "NDX", bg: "#2563EB" },
  SPX500: { label: "SPX", bg: "#0F766E" },
  DAX40: { label: "DE", bg: "#111827" },
  GER40: { label: "DE", bg: "#111827" },
  CAC40: { label: "FR", bg: "#1D4ED8" },
  UK100: { label: "UK", bg: "#4338CA" },
  JPN225: { label: "JP", bg: "#991B1B" },
};

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getBaseAsset(clean) {
  return clean.replace(/USD$|USDT$|EUR$|GBP$|JPY$/g, "");
}

function getForexParts(clean) {
  const base = clean.slice(0, 3);
  const quote = clean.slice(3, 6);
  if (FLAG_MAP[base] && FLAG_MAP[quote]) return { base, quote };
  return null;
}

function isGold(clean) {
  return clean.includes("XAU") || clean.includes("GOLD");
}

function isSilver(clean) {
  return clean.includes("XAG") || clean.includes("SILVER");
}

function isOil(clean) {
  return clean.includes("WTI") || clean.includes("BRENT") || clean.includes("OIL");
}

function getRootStyle(size) {
  return {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: Math.max(7, Math.round(size * 0.23)),
    overflow: "hidden",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 6px 18px rgba(0,0,0,0.18)",
    flexShrink: 0,
  };
}

function CommodityBars({ color = "#FFFFFF" }) {
  return (
    <>
      <span style={{
        position: "absolute",
        width: "44%",
        height: "14%",
        borderRadius: "999px 999px 4px 4px",
        backgroundColor: color,
        top: "24%",
        left: "34%",
        transform: "skewX(-28deg)",
      }} />
      <span style={{
        position: "absolute",
        width: "43%",
        height: "14%",
        borderRadius: "999px 999px 4px 4px",
        backgroundColor: color,
        bottom: "31%",
        left: "16%",
        transform: "skewX(-28deg)",
      }} />
      <span style={{
        position: "absolute",
        width: "43%",
        height: "14%",
        borderRadius: "999px 999px 4px 4px",
        backgroundColor: color,
        bottom: "31%",
        right: "12%",
        transform: "skewX(-28deg)",
      }} />
    </>
  );
}

function CommodityIcon({ type, size }) {
  const config = {
    gold: { bg: "#D9A000", fg: "#FFFFFF" },
    silver: { bg: "#AAB3C2", fg: "#FFFFFF" },
    oil: { bg: "#111827", fg: "#F59E0B" },
  }[type];

  if (type === "oil") {
    return (
      <span style={{ ...getRootStyle(size), backgroundColor: config.bg }}>
        <span style={{ color: config.fg, fontSize: size * 0.3, fontWeight: 800, letterSpacing: "-0.04em" }}>OIL</span>
      </span>
    );
  }

  return (
    <span style={{ ...getRootStyle(size), backgroundColor: config.bg }}>
      <CommodityBars color={config.fg} />
    </span>
  );
}

function ForexIcon({ base, quote, size }) {
  const flagSize = Math.round(size * 0.64);
  return (
    <span style={{ position: "relative", width: size, height: Math.round(size * 0.7), minWidth: size, display: "inline-block", flexShrink: 0 }}>
      <img
        src={`https://flagcdn.com/w40/${FLAG_MAP[base]}.png`}
        alt={base}
        style={{
          width: flagSize,
          height: flagSize,
          borderRadius: "50%",
          objectFit: "cover",
          position: "absolute",
          left: 0,
          top: 0,
          border: "1.5px solid #0D1421",
        }}
      />
      <img
        src={`https://flagcdn.com/w40/${FLAG_MAP[quote]}.png`}
        alt={quote}
        style={{
          width: flagSize,
          height: flagSize,
          borderRadius: "50%",
          objectFit: "cover",
          position: "absolute",
          right: 0,
          top: 0,
          border: "1.5px solid #0D1421",
        }}
      />
    </span>
  );
}

function LetterIcon({ label, bg = "#1E3A5F", fg = "#93C5FD", size }) {
  return (
    <span style={{ ...getRootStyle(size), backgroundColor: bg }}>
      <span style={{ color: fg, fontSize: Math.max(9, size * 0.32), fontWeight: 800, letterSpacing: "-0.04em" }}>
        {label}
      </span>
    </span>
  );
}

export default function InstrumentIcon({ symbol, size = 32 }) {
  const clean = normalizeSymbol(symbol);
  if (!clean) return <LetterIcon label="--" size={size} />;

  if (isGold(clean)) return <CommodityIcon type="gold" size={size} />;
  if (isSilver(clean)) return <CommodityIcon type="silver" size={size} />;
  if (isOil(clean)) return <CommodityIcon type="oil" size={size} />;

  const forexParts = getForexParts(clean);
  if (forexParts) return <ForexIcon {...forexParts} size={size} />;

  const baseAsset = getBaseAsset(clean);
  const crypto = CRYPTO_META[baseAsset];
  if (crypto) return <LetterIcon label={crypto.label} bg={crypto.bg} fg={crypto.fg} size={size} />;

  const index = INDEX_META[clean] || INDEX_META[baseAsset];
  if (index) return <LetterIcon label={index.label} bg={index.bg} fg="#FFFFFF" size={size} />;

  return <LetterIcon label={clean.slice(0, 3)} size={size} />;
}
