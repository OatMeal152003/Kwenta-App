import { db, newBase, type Schedule } from "@/lib/db";
import { monthKeyNow, nowISO, timestampForDate } from "@/lib/dates";

export const MAX_CATCHUP_MONTHS = 12;

/** Days in a YYYY-MM month. */
export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Next month key after the given one. */
export function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1)); // m is 0-indexed next month
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Clamp a day-of-month to the month's real length. */
export function clampDay(month: string, day: number): number {
  return Math.min(Math.max(1, day), daysInMonth(month));
}

function postedDate(month: string, day: number): string {
  return `${month}-${String(clampDay(month, day)).padStart(2, "0")}`;
}

/**
 * Post all due schedule instances up to the current month.
 * Idempotent: re-runs only post months newer than lastPostedMonth.
 */
export async function postDueSchedules(nowMonth: string = monthKeyNow()): Promise<number> {
  const schedules = await db.schedules
    .filter((s) => s.deletedAt === null && s.frequency === "monthly")
    .toArray();
  let posted = 0;
  const t = nowISO();
  for (const s of schedules) {
    if (s.endMonth && s.endMonth < nowMonth) continue;
    let cursor = s.lastPostedMonth ? nextMonth(s.lastPostedMonth) : s.startMonth;
    let guard = 0;
    while (cursor <= nowMonth && guard < MAX_CATCHUP_MONTHS) {
      if (s.endMonth && cursor > s.endMonth) break;
      const date = postedDate(cursor, s.dayOfMonth);
      await db.transactions.add({
        ...newBase(),
        type: s.type,
        amountCentavos: s.amountCentavos,
        categoryId: s.categoryId,
        walletId: s.walletId,
        note: s.note,
        date,
        timestamp: timestampForDate(date),
        month: cursor,
        currency: "PHP",
      });
      posted++;
      s.lastPostedMonth = cursor;
      cursor = nextMonth(cursor);
      guard++;
    }
    await db.schedules.update(s.id, { lastPostedMonth: s.lastPostedMonth, updatedAt: t });
  }
  return posted;
}

export async function createSchedule(input: {
  type: Schedule["type"];
  amountCentavos: number;
  categoryId: string;
  walletId: string;
  note?: string;
  dayOfMonth: number;
  startMonth: string;
}): Promise<string> {
  if (!Number.isInteger(input.amountCentavos) || input.amountCentavos <= 0)
    throw new Error("amountCentavos must be a positive integer");
  if (!/^\d{4}-\d{2}$/.test(input.startMonth)) throw new Error("startMonth must be YYYY-MM");
  const day = Math.min(31, Math.max(1, Math.floor(input.dayOfMonth)));
  const s: Schedule = {
    ...newBase(),
    type: input.type,
    amountCentavos: input.amountCentavos,
    categoryId: input.categoryId,
    walletId: input.walletId,
    note: input.note ?? "",
    frequency: "monthly",
    dayOfMonth: day,
    startMonth: input.startMonth,
    endMonth: null,
    lastPostedMonth: null,
  };
  await db.schedules.add(s);
  await postDueSchedules();
  return s.id;
}

/** Pause (keeps history) or resume a schedule. */
export async function setScheduleActive(id: string, active: boolean, nowMonth: string = monthKeyNow()): Promise<void> {
  await db.schedules.update(id, {
    endMonth: active ? null : nowMonth,
    updatedAt: nowISO(),
  });
}
