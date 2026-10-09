/**
 * Single source of truth for money math.
 * Store everything as integer centavos. Never use floats for storage.
 */

export function toCentavos(input: string | number): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) throw new Error("Invalid amount");
    return Math.round(input * 100);
  }
  let s = input.trim().replace(/[₱\s,]/g, "");
  if (s === "") throw new Error("Empty amount");
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) throw new Error(`Invalid amount: ${input}`);
  const sign = m[1] === "-" ? -1 : 1;
  const pesos = parseInt(m[2], 10);
  const cents = parseInt((m[3] ?? "0").padEnd(2, "0"), 10);
  return sign * (pesos * 100 + cents);
}

export function fromCentavos(centavos: number): number {
  if (!Number.isInteger(centavos)) throw new Error("centavos must be integer");
  return centavos / 100;
}

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPHP(centavos: number): string {
  if (!Number.isInteger(centavos)) throw new Error("centavos must be integer");
  return phpFormatter.format(centavos / 100);
}

const phpWhole = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Rows like the mockups: "₱5,000" when whole, "₱1,234.50" otherwise. */
export function formatPHPCompact(centavos: number): string {
  if (!Number.isInteger(centavos)) throw new Error("centavos must be integer");
  return centavos % 100 === 0 ? phpWhole.format(centavos / 100) : phpFormatter.format(centavos / 100);
}
export function formatInput(centavos: number): string {
  const sign = centavos < 0 ? "-" : "";
  const abs = Math.abs(centavos);
  const pesos = Math.floor(abs / 100);
  const cents = String(abs % 100).padStart(2, "0");
  return `${sign}${pesos}.${cents}`;
}
