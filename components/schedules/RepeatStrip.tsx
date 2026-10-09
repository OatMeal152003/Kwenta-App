"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { monthKeyNow } from "@/lib/dates";
import { formatPHPCompact } from "@/lib/money";

/** Heads-up strip when a repeat posts within the next 7 days. */
export default function RepeatStrip() {
  const schedules = useLiveQuery(() => db.schedules.filter((s) => s.deletedAt === null && !s.endMonth).toArray());
  const cats = useLiveQuery(() => db.categories.toArray());
  if (!schedules || schedules.length === 0) return null;

  const [y, m] = monthKeyNow().split("-").map(Number);
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const today = Number(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }).split("-")[2]);
  const upcoming = schedules
    .map((s) => ({ s, day: Math.min(s.dayOfMonth, dim), cat: cats?.find((c) => c.id === s.categoryId) }))
    .filter(({ day }) => day >= today && day - today <= 7)
    .sort((a, b) => a.day - b.day);
  if (upcoming.length === 0) return null;

  const first = upcoming[0];
  return (
    <div className="card mt-4 !bg-primary/5">
      <p className="text-slate-500">
        <strong className="text-ink">{first.cat?.name ?? first.s.type} posts in {first.day - today === 0 ? "today" : `${first.day - today} day${first.day - today === 1 ? "" : "s"}`}</strong>
        {" · "}{formatPHPCompact(first.s.amountCentavos)}
        {upcoming.length > 1 && ` (+${upcoming.length - 1} more this week)`}
      </p>
    </div>
  );
}
