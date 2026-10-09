"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { setScheduleActive } from "@/lib/recurring";
import { formatPHPCompact } from "@/lib/money";
import { nowISO } from "@/lib/dates";
import { Chip } from "@/components/ui";

const ORD = (d: number) => `${d}${d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}`;

export default function SchedulesManager() {
  const schedules = useLiveQuery(() => db.schedules.filter((s) => s.deletedAt === null).toArray());
  const cats = useLiveQuery(() => db.categories.toArray());
  const catMap = new Map((cats ?? []).map((c) => [c.id, c]));
  if (!schedules || schedules.length === 0) return null;

  return (
    <div className="card mt-4 min-w-0 overflow-x-clip">
      <h2 className="font-heading text-xl font-extrabold text-ink">Monthly repeats</h2>
      {schedules.map((s, i) => {
        const c = catMap.get(s.categoryId);
        const active = !s.endMonth;
        return (
          <div key={s.id} className="rise-in flex items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-white/5" style={{ "--d": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}>
            <Chip icon={c?.icon ?? "dots"} color={c?.color ?? "#94A3B8"} size={44} glyph={20} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-ink">{s.note || c?.name || s.type} · {formatPHPCompact(s.amountCentavos)}</span>
              <span className="block text-sm text-slate-500">Every {ORD(s.dayOfMonth)}{active ? "" : " · paused"}</span>
            </span>
            <button
              onClick={() => setScheduleActive(s.id, !active)}
              aria-label={active ? `Pause repeat for ${s.note || c?.name}` : `Resume repeat for ${s.note || c?.name}`}
              className={`shrink-0 rounded-full border-[1.5px] px-4 py-1.5 font-bold ${active ? "border-primary text-primary" : "border-slate-300 text-slate-500"}`}
            >
              {active ? "Pause" : "Resume"}
            </button>
            <button
              aria-label="Delete repeat"
              onClick={() => { if (window.confirm("Delete this repeat? Posted entries stay.")) db.schedules.update(s.id, { deletedAt: nowISO(), updatedAt: nowISO() }); }}
              className="shrink-0 rounded p-1.5 text-slate-400"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
