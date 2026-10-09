"use client";
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { db, type Transaction } from "@/lib/db";
import { monthKeyNow, todayInManila } from "@/lib/dates";
import { formatPHP, formatPHPCompact } from "@/lib/money";
import { shiftMonth } from "@/hooks/useMonth";
import { useCountUp } from "@/hooks/useCountUp";
import { MonthPill, PageHeader, Chip } from "@/components/ui";
import { relativeDay } from "@/lib/dates";

function manilaKey(offsetDays: number): { key: string; dow: string } {
  const now = new Date(Date.now() + offsetDays * 86400000);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-");
  const dow = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", weekday: "narrow" }).format(now);
  return { key: `${parts[0]}-${parts[1]}-${parts[2]}`, dow };
}

export default function StatsPage() {
  const [month, setMonth] = useState(monthKeyNow());
  const txs = useLiveQuery(() => db.transactions.filter((t) => t.deletedAt === null && t.month === month).toArray(), [month]);
  const cats = useLiveQuery(() => db.categories.filter((c) => c.deletedAt === null).toArray());
  const catMap = useMemo(() => new Map((cats ?? []).map((c) => [c.id, c])), [cats]);

  const expenses = useMemo(() => (txs ?? []).filter((t) => t.type === "expense"), [txs]);
  const total = expenses.reduce((s, t) => s + t.amountCentavos, 0);
  const aTotal = useCountUp(total);

  const donut = useMemo(() => {
    const by = new Map<string, number>();
    expenses.forEach((t) => by.set(t.categoryId, (by.get(t.categoryId) ?? 0) + t.amountCentavos));
    return [...by.entries()].map(([id, value]) => ({
      name: catMap.get(id)?.name ?? "Others",
      color: catMap.get(id)?.color ?? "#94A3B8",
      value,
    })).sort((a, b) => b.value - a.value);
  }, [expenses, catMap]);

  const week = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => manilaKey(i - 6));
    const byDay = new Map<string, number>();
    (txs ?? []).filter((t) => t.type === "expense").forEach((t) => byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amountCentavos));
    const max = Math.max(1, ...days.map((d) => byDay.get(d.key) ?? 0));
    return days.map((d) => ({ ...d, value: byDay.get(d.key) ?? 0, max, today: d.key === todayInManila() }));
  }, [txs]);

  const dayGroups = useMemo(() => {
    const g = new Map<string, Transaction[]>();
    (txs ?? []).forEach((t: Transaction) => {
      const arr = g.get(t.date) ?? [];
      arr.push(t);
      g.set(t.date, arr);
    });
    return [...g.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [txs]);

  return (
    <main className="page-enter mx-auto max-w-md p-4 pb-28">
      <PageHeader
        title="Stats"
        right={<MonthPill month={month} onPrev={() => setMonth(shiftMonth(month, -1))} onNext={() => setMonth(shiftMonth(month, 1))} />}
      />

      <div className="relative mx-auto mt-2 h-60 w-60" role="img" aria-label={`Spent ${formatPHP(total)} this month`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={donut} dataKey="value" nameKey="name" innerRadius={68} outerRadius={100} paddingAngle={3} strokeWidth={0} startAngle={90} endAngle={-270}>
              {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base text-slate-500">Spent</span>
          <span className="font-heading text-3xl font-extrabold text-ink tabular-nums">{formatPHPCompact(aTotal)}</span>
        </div>
      </div>
      {donut.length === 0 && <p className="text-center text-slate-500">No expenses this month yet.</p>}

      <ul className="mt-4 space-y-3">
        {donut.map((d, i) => (
          <li key={d.name} className="rise-in flex items-center gap-3" style={{ "--d": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}>
            <span className="h-5 w-5 rounded-md" style={{ background: d.color }} />
            <span className="flex-1 text-xl font-bold text-ink">{d.name}</span>
            <span className="text-lg text-slate-500 tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>
            <span className="w-24 text-right text-xl font-bold text-ink tabular-nums">{formatPHPCompact(d.value)}</span>
          </li>
        ))}
      </ul>

      <div className="card mt-6">
        <h2 className="font-heading text-xl font-extrabold text-ink">Last 7 days</h2>
        <div className="mt-3 flex h-36 items-end justify-between gap-2" role="img" aria-label="Spending per day, last 7 days">
          {week.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`w-full rounded-t-xl rounded-b-md transition-[height] duration-700 ease-out ${d.today ? "bg-accent" : "bg-primary"}`}
                style={{ height: `${Math.max(8, (d.value / d.max) * 100)}%` }}
                title={`${d.key}: ${formatPHP(d.value)}`}
              />
              <span className={`text-sm font-semibold ${d.today ? "text-ink" : "text-slate-500"}`}>{d.dow}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4">
        <h2 className="font-heading text-xl font-extrabold text-ink">By day</h2>
        {dayGroups.length === 0 && <p className="text-slate-500">No transactions this month.</p>}
        {dayGroups.map(([date, list]: [string, Transaction[]], gi: number) => (
          <div key={date} className="rise-in mt-3" style={{ "--d": `${Math.min(gi, 6) * 50}ms` } as React.CSSProperties}>
            <p className="text-sm font-bold text-slate-500">{relativeDay(date)}</p>
            {list.sort((a, b) => b.timestamp - a.timestamp).map((t) => {
              const c = catMap.get(t.categoryId);
              const expense = t.type === "expense";
              return (
                <div key={t.id} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-white/5">
                  <Chip icon={c?.icon ?? "dots"} color={c?.color ?? "#94A3B8"} size={44} glyph={20} />
                  <span className="flex-1 truncate font-semibold text-ink">{t.note || c?.name || t.type}</span>
                  <span className={`font-bold tabular-nums ${expense ? "text-expensetext" : "text-incometext"}`}>
                    {expense ? "−" : "+"}{formatPHPCompact(t.amountCentavos)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
