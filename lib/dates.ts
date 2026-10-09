/** Manila-safe date helpers. All month grouping uses Asia/Manila. */
const MANILA = "Asia/Manila";

function manilaParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, day] = fmt.format(d).split("-");
  return { y, m, day };
}

export function todayInManila(): string {
  const p = manilaParts(new Date());
  return `${p.y}-${p.m}-${p.day}`;
}

export function monthKeyFromDate(dateYYYYMMDD: string): string {
  return dateYYYYMMDD.slice(0, 7); // YYYY-MM
}

export function monthKeyNow(): string {
  return todayInManila().slice(0, 7);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function timestampForDate(dateYYYYMMDD: string): number {
  // Noon Manila to avoid DST/offset edge cases (PH has no DST, but safe).
  return new Date(`${dateYYYYMMDD}T12:00:00+08:00`).getTime();
}

/** "Today" | "Yesterday" | "Oct 2" for Manila dates. */
export function relativeDay(dateYYYYMMDD: string): string {
  const today = todayInManila();
  if (dateYYYYMMDD === today) return "Today";
  const parts = manilaParts(new Date(Date.now() - 86400000));
  const yesterday = `${parts.y}-${parts.m}-${parts.day}`;
  if (dateYYYYMMDD === yesterday) return "Yesterday";
  const [yy, mm, dd] = dateYYYYMMDD.split("-").map(Number);
  return new Date(Date.UTC(yy, mm - 1, dd)).toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "UTC" });
}
