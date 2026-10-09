"use client";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatPHPCompact } from "@/lib/money";

/** First budget of the month, styled like the mockup budget card. */
export default function BudgetStrip({ month }: { month: string }) {
  const budgets = useLiveQuery(() => db.budgets.filter((b) => b.month === month && b.deletedAt === null).toArray(), [month]);
  const txs = useLiveQuery(() => db.transactions.filter((t) => t.month === month && t.type === "expense" && t.deletedAt === null).toArray(), [month]);
  const cats = useLiveQuery(() => db.categories.filter((c) => c.deletedAt === null).toArray());

  if (!budgets || budgets.length === 0) {
    return (
      <div className="card mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-extrabold text-ink">Budget</h2>
          <Link href="/budgets" className="font-semibold text-primary">Set budget →</Link>
        </div>
        <p className="mt-1 text-slate-500">You&apos;re under budget this week — set a monthly limit to track here.</p>
      </div>
    );
  }
  const b = [...budgets].sort((x, y) => x.createdAt.localeCompare(y.createdAt))[0];
  const cat = cats?.find((c) => c.id === b.categoryId);
  const spent = (txs ?? []).filter((t) => t.categoryId === b.categoryId).reduce((s, t) => s + t.amountCentavos, 0);
  const pct = b.limitCentavos > 0 ? Math.min(100, Math.round((spent / b.limitCentavos) * 100)) : 0;
  const over = spent > b.limitCentavos;

  return (
    <div className="card mt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-extrabold text-ink">{cat?.name ?? "Budget"} budget</h2>
        <span className="shrink-0 text-lg tabular-nums text-slate-500">
          <strong className="text-ink">{formatPHPCompact(spent)}</strong> of {formatPHPCompact(b.limitCentavos)}
        </span>
      </div>
      <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-200/70" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full bar-fill ${over ? "bg-expense" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-2.5 text-lg ${over ? "font-bold text-expensetext" : "text-slate-500"}`}>
        {over ? "Over budget — consider pausing non-essentials." : "You're under budget this week. Keep it up!"}
      </p>
    </div>
  );
}
