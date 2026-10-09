/** Pastel chip backgrounds + deep glyph tones derived from a base hex. */

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Soft tinted background for icon chips (mix with white). */
export function pastel(hex: string, amount = 0.16): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * (1 - amount), g + (255 - g) * (1 - amount), b + (255 - b) * (1 - amount));
}

/** Darkened tone for glyphs on pastel chips (keeps contrast). */
export function deep(hex: string, amount = 0.28): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** Deterministic pastel pair for avatar initials from a name. */
const AVATAR_BASES = ["#0F766E", "#7C3AED", "#F59E0B", "#0EA5E9", "#EC4899", "#B93A2B"];
export function avatarColors(name: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const base = AVATAR_BASES[h % AVATAR_BASES.length];
  return { bg: pastel(base, 0.2), fg: deep(base, 0.3) };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
