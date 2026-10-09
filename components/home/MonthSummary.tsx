"use client";
import { formatPHP } from "@/lib/money";
import { useCountUp } from "@/hooks/useCountUp";

/** Balance hero: solid teal per palette rules (white text passes contrast). */
export default function MonthSummary({ month, income, spent, net, onPrev, onNext }: {
  month: string; income: number; spent: number; net: number;
  onPrev: () => void; onNext: () => void;
}) {
  const aNet = useCountUp(net);
  const aIncome = useCountUp(income);
  const aSpent = useCountUp(spent);
  return (
    <div className="mt-4 rounded-[24px] bg-primary p-5 text-white shadow-lg shadow-primary/25">
      <div className="flex items-center justify-between">
        <button onClick={onPrev} aria-label="Previous month" className="rounded-full bg-white/15 px-3 py-1 text-lg leading-none">‹</button>
        <h2 className="font-heading text-sm font-semibold tracking-wide opacity-90">{month}</h2>
        <button onClick={onNext} aria-label="Next month" className="rounded-full bg-white/15 px-3 py-1 text-lg leading-none">›</button>
      </div>
      <p className="mt-3 text-sm opacity-80">Balance this month</p>
      <p className="font-heading text-4xl font-extrabold tabular-nums">{formatPHP(aNet)}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[16px] bg-white/15 p-3">
          <p className="text-xs opacity-80">Income</p>
          <p className="font-bold tabular-nums">{formatPHP(aIncome)}</p>
        </div>
        <div className="rounded-[16px] bg-white/15 p-3">
          <p className="text-xs opacity-80">Spent</p>
          <p className="font-bold tabular-nums">{formatPHP(aSpent)}</p>
        </div>
      </div>
    </div>
  );
}
