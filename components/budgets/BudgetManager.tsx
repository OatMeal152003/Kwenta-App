"use client";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, newBase } from "@/lib/db";
import { toCentavos, formatPHP, formatPHPCompact } from "@/lib/money";
import { nowISO } from "@/lib/dates";
import { Chip, OutlineButton } from "@/components/ui";
import { useCountUp } from "@/hooks/useCountUp";
import { Icon } from "@/components/icons";

export default function BudgetManager({ month }: { month: string }) {
  const cats = useLiveQuery(() => db.categories.filter((c) => (c.deletedAt === null && (c.kind === "expense" || c.kind === "both"))).sortBy("sortOrder"));
  const budgets = useLiveQuery(() => db.budgets.filter((b) => b.month === month && b.deletedAt === null).toArray(), [month]);
  const txs = useLiveQuery(() => db.transactions.filter((t) => t.month === month && t.type === "expense" && t.deletedAt === null).toArray(), [month]);
  const [open, setOpen] = useState(false);
  const [catId, setCatId] = useState("");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");

  const spentBy = new Map<string, number>();
  (txs ?? []).forEach((t) => spentBy.set(t.categoryId, (spentBy.get(t.categoryId) ?? 0) + t.amountCentavos));
  const list = (budgets ?? []).map((b) => ({ b, cat: cats?.find((c) => c.id === b.categoryId), spent: spentBy.get(b.categoryId) ?? 0 }))
    .sort((a, b2) => b2.spent - a.spent);

  const totalSpent = list.reduce((s, r) => s + r.spent, 0);
  const aTotalSpent = useCountUp(totalSpent);
  const totalLimit = list.reduce((s, r) => s + r.b.limitCentavos, 0);
  const overOnes = list.filter((r) => r.spent > r.b.limitCentavos);

  async function save() {
    setError("");
    try {
      const c = catId || cats?.[0]?.id;
      if (!c) throw new Error("Pick a category");
      const cents = toCentavos(limit);
      if (cents <= 0) throw new Error("Limit must be greater than ₱0");
      const existing = (budgets ?? []).find((x) => x.categoryId === c);
      if (existing) {
        await db.budgets.update(existing.id, { limitCentavos: cents, updatedAt: nowISO() });
      } else {
        const base = newBase();
        await db.budgets.add({ ...base, categoryId: c, month, limitCentavos: cents });
      }
      setLimit(""); setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  }

  return (
    <div>
      <div className="card mt-4">
        <p className="text-xl text-slate-500">Total spent</p>
        <p className="font-heading text-4xl font-extrabold text-ink tabular-nums">
          {formatPHPCompact(aTotalSpent)} <span className="text-2xl font-bold text-slate-400">of {formatPHPCompact(totalLimit)}</span>
        </p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200/70" role="progressbar"
          aria-valuenow={totalLimit ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full bar-fill ${totalSpent > totalLimit && totalLimit > 0 ? "bg-expense" : "bg-primary"}`}
            style={{ width: `${totalLimit ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0}%` }} />
        </div>
        <p className="mt-3 text-lg text-slate-500">
          {list.length === 0
            ? "Set your first monthly limit below."
            : overOnes.length === 0
              ? "You're under budget overall. Keep it up!"
              : `You're under budget overall. Only ${overOnes.map((r) => r.cat?.name ?? "a category").join(", ")} went over.`}
        </p>
      </div>

      {list.length > 0 && (
        <div className="card mt-4 !p-5">
          {list.map(({ b, cat, spent }, i) => {
            const over = spent > b.limitCentavos;
            const pct = b.limitCentavos > 0 ? Math.min(100, Math.round((spent / b.limitCentavos) * 100)) : 0;
            return (
              <div key={b.id} className="rise-in flex gap-3 border-b border-slate-100 py-4 last:border-0 last:pb-0 first:pt-0 dark:border-white/5" style={{ "--d": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}>
                <Chip icon={cat?.icon ?? "dots"} color={cat?.color ?? "#94A3B8"} size={56} glyph={26} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xl font-bold text-ink">{cat?.name ?? "Category"}</span>
                    <span className="shrink-0 text-lg tabular-nums text-slate-500">
                      <strong className="text-ink">{formatPHPCompact(spent)}</strong> / {formatPHPCompact(b.limitCentavos)}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200/70" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${cat?.name} budget`}>
                    <div className={`h-full rounded-full bar-fill ${over ? "bg-expense" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    {over
                      ? <span className="font-bold text-expensetext">{formatPHP(spent - b.limitCentavos)} over budget</span>
                      : <span className="text-slate-500">{formatPHP(b.limitCentavos - spent)} left</span>}
                    <button aria-label={`Remove budget for ${cat?.name}`} className="rounded p-1.5 text-slate-400" onClick={() => db.budgets.update(b.id, { deletedAt: nowISO(), updatedAt: nowISO() })}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {open ? (
          <div className="card">
            <h2 className="font-heading text-xl font-extrabold text-ink">New budget · {month}</h2>
            <div className="mt-2 flex gap-2">
              <select value={catId} onChange={(e) => setCatId(e.target.value)} aria-label="Budget category" className="min-w-0 flex-1 rounded-[16px] border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-carddark">
                {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="₱ limit" inputMode="decimal" aria-label="Budget limit in pesos" className="w-32 rounded-[16px] border border-slate-200 p-3 tabular-nums dark:border-white/10" />
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={save} className="flex-1 rounded-full bg-primary py-3 font-heading font-bold text-white">Save</button>
              <button onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-5 font-semibold text-slate-500">Cancel</button>
            </div>
            {error && <p role="alert" className="mt-1 font-semibold text-expensetext">{error}</p>}
          </div>
        ) : (
          <OutlineButton label="Add budget" onClick={() => setOpen(true)}>Add budget</OutlineButton>
        )}
      </div>
    </div>
  );
}
