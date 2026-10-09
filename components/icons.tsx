import type { JSX } from "react";

/**
 * Single SVG icon set — no emoji anywhere in the UI.
 * Unknown names fall back to rendering the raw string (legacy safety).
 */
const PATHS: Record<string, JSX.Element> = {
  home: (<><path d="M4 11l8-7 8 7" /><path d="M6 9.5V20h5v-6h2v6h5V9.5" /></>),
  chart: (<><path d="M4 20h16" /><path d="M7 20v-6" /><path d="M12 20V8" /><path d="M17 20v-9" /></>),
  target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></>),
  plus: (<><path d="M12 5v14M5 12h14" /></>),
  "plus-circle": (<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>),
  trash: (<><path d="M4 7h16" /><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" /><path d="M6.5 7l1 13h9l1-13" /><path d="M10 11v6M14 11v6" /></>),
  edit: (<><path d="M12 20h9" /><path d="M17 3a2.8 2.8 0 114 4L8 20l-5 1 1-5z" /></>),
  check: (<><path d="M4 12.5l5 5L20 6.5" /></>),
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>),
  "chev-left": (<><path d="M14 6l-6 6 6 6" /></>),
  "chev-right": (<><path d="M10 6l6 6-6 6" /></>),
  "arrow-left": (<><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>),
  download: (<><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></>),
  upload: (<><path d="M12 15V4" /><path d="M7 8l5-5 5 5" /><path d="M4 20h16" /></>),
  food: (<><path d="M4 18a8 8 0 0116 0" /><path d="M3 18h18" /><path d="M12 10V7" /><circle cx="12" cy="5.5" r="1" fill="currentColor" stroke="none" /></>),
  transport: (<><rect x="4" y="4" width="16" height="12" rx="2" /><path d="M4 10h16" /><circle cx="8" cy="19" r="1.5" /><circle cx="16" cy="19" r="1.5" /></>),
  signal: (<><path d="M5 20v-3" /><path d="M10 20v-7" /><path d="M15 20V9" /><path d="M20 20V5" /></>),
  receipt: (<><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5L10 21l-2-1.5L6 21z" /><path d="M9 8h6M9 12h6" /></>),
  book: (<><path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" /></>),
  send: (<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></>),
  bag: (<><path d="M5.5 8h13l-1 12h-11z" /><path d="M9 8V6a3 3 0 016 0v2" /></>),
  health: (<><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8.5v7M8.5 12h7" /></>),
  dots: (<><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" /></>),
  gift: (<><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8" /><path d="M12 8v12" /><path d="M12 8c-4 0-5-2-4.5-3.5C8 3 10 4 12 8z" /><path d="M12 8c4 0 5-2 4.5-3.5C16 3 14 4 12 8z" /></>),
  briefcase: (<><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2" /><path d="M3 13h18" /></>),
  trend: (<><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>),
  banknote: (<><rect x="3" y="7" width="18" height="10" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6.5 10.5h.01M17.5 13.5h.01" /></>),
  smartphone: (<><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18.5h2" /></>),
  card: (<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></>),
  landmark: (<><path d="M3 9.5h18" /><path d="M5 9.5V7l7-4 7 4v2.5" /><path d="M6.5 9.5V18M10.2 9.5V18M13.8 9.5V18M17.5 9.5V18" /><path d="M4 20.5h16" /></>),
  wallet: (<><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M14 11h6v5h-6a2.5 2.5 0 010-5z" /><circle cx="17.5" cy="13.5" r="1" fill="currentColor" stroke="none" /></>),
  coffee: (<><path d="M4 9h12v7a4 4 0 01-4 4H8a4 4 0 01-4-4z" /><path d="M16 10h2a2.5 2.5 0 010 5h-2" /><path d="M8 3.5V5M12 3.5V5" /></>),
  game: (<><rect x="3" y="8" width="18" height="9" rx="4" /><path d="M8 11v3M6.5 12.5h3" /><circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="17.5" cy="14" r="1" fill="currentColor" stroke="none" /></>),
  heart: (<><path d="M12 20s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z" /></>),
};

export function Icon({ name, size = 18, className, strokeWidth = 2 }: { name: string; size?: number; className?: string; strokeWidth?: number }) {
  const badge = BRAND_BADGES[name];
  if (badge) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect width="24" height="24" rx="6" fill={badge.bg} />
        <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight={800} fill="#fff" fontFamily="Plus Jakarta Sans, Inter, sans-serif">{badge.label}</text>
      </svg>
    );
  }
  const paths = PATHS[name];
  if (!paths) return <span className={className}>{name}</span>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths}
    </svg>
  );
}

/** Brand badges (approximations, not official logos) for the two e-wallets. */
export const BRAND_BADGES: Record<string, { bg: string; label: string }> = {
  gcash: { bg: "#007DFF", label: "G" },
  maya: { bg: "#00A651", label: "M" },
};

export function isBrandBadge(name: string): boolean {
  return name in BRAND_BADGES;
}

export const CATEGORY_ICONS = [
  "food", "transport", "signal", "receipt", "book", "send", "bag",
  "health", "dots", "gift", "briefcase", "plus-circle", "coffee", "game",
];

export const WALLET_ICONS = ["banknote", "gcash", "maya", "landmark", "wallet", "card", "smartphone"];

/** Icon to use when a wallet kind has no explicit icon choice. */
export const WALLET_KIND_ICON: Record<string, string> = {
  cash: "banknote",
  gcash: "gcash",
  maya: "maya",
  bank: "landmark",
  custom: "wallet",
};

/** Emoji → icon-key migration for databases seeded before the icon set. */
export const LEGACY_ICON_MAP: Record<string, string> = {
  "💵": "banknote", "📱": "gcash", "💳": "maya", "🏦": "landmark",
  "👛": "wallet", "💰": "banknote",
  "🍔": "food", "🚌": "transport", "📶": "signal", "🧾": "receipt",
  "🎒": "book", "💸": "send", "🛍️": "bag", "🛍": "bag", "💊": "health",
  "⋯": "dots", "🎁": "gift", "💼": "briefcase", "➕": "plus-circle",
  "☕": "coffee", "🎮": "game",
  // Pre-badge generic glyphs migrate to their brand badge:
  "smartphone": "gcash", "card": "maya",
};
