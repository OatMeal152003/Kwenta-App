"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ensureDefaults } from "@/lib/seed";
import { formatPHPCompact } from "@/lib/money";
import { relativeDay } from "@/lib/dates";
import { useMonth, shiftMonth } from "@/hooks/useMonth";
import MonthSummary from "@/components/home/MonthSummary";
import BudgetStrip from "@/components/home/BudgetStrip";
import RepeatStrip from "@/components/schedules/RepeatStrip";
import { useRecentTransactions } from "@/hooks/useLive";
import { getProfileName } from "@/lib/profile";
import { Chip } from "@/components/ui";

export default function Home() {
  const recent = useRecentTransactions(6);
  const { month, setMonth, income, spent, net } = useMonth();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const load = () => getProfileName().then(setProfileName).catch(() => {});
    load();
    window.addEventListener("kwenta-profile", load);
    return () => window.removeEventListener("kwenta-profile", load);
  }, []);
  const cats = useLiveQuery(() => db.categories.filter((c) => c.deletedAt === null).toArray());
  const catMap = useMemo(() => new Map((cats ?? []).map((c) => [c.id, c])), [cats]);

  useEffect(() => { ensureDefaults().catch(() => {}); }, []);

  return (
    <main className="page-enter mx-auto max-w-md p-4 pb-28">
      <div className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-lg text-slate-500">
            Kumusta{profileName ? `, ${profileName}` : ""}!
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M22 36V26a3 3 0 016 0v8V24a3 3 0 016 0v10V23a3 3 0 016 0v11l4-5a3 3 0 015 4l-9 11a9 9 0 01-7 4h-3a9 9 0 01-8-5z" fill="#F5B83D" /></svg>
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-ink">Your month so far</h1>
        </div>
        <Image src="/brand/kwenta-icon.svg" alt="Kwenta" width={52} height={52} className="rounded-[14px] shadow" priority />
      </div>

      <MonthSummary
        month={month}
        income={income}
        spent={spent}
        net={net}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
      />
      <BudgetStrip month={month} />
      <RepeatStrip />

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-extrabold text-ink">Recent</h2>
        <Link href="/stats" className="font-semibold text-primary">See all</Link>
      </div>
      <div className="mt-2">
        {recent === undefined && (
          <div className="space-y-2.5 py-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-[52px] w-[52px] !rounded-[16px]" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
                <div className="skeleton h-6 w-20" />
              </div>
            ))}
          </div>
        )}
        {(recent ?? []).map((t, i) => {
          const c = catMap.get(t.categoryId);
          const expense = t.type === "expense";
          return (
            <Link key={t.id} href={`/edit/${t.id}`} className="rise-in flex items-center gap-3 py-2.5 transition-transform active:scale-[0.98]" style={{ "--d": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties} aria-label={`Edit ${t.note || c?.name || t.type}`}>
              <Chip icon={c?.icon ?? "dots"} color={c?.color ?? "#94A3B8"} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-bold text-ink">{t.note || c?.name || t.type}</span>
                <span className="block text-base text-slate-500">{c?.name ?? t.type} · {relativeDay(t.date)}</span>
              </span>
              <span className={`text-xl font-bold tabular-nums ${expense ? "text-expensetext" : "text-incometext"}`}>
                {expense ? "−" : "+"}{formatPHPCompact(t.amountCentavos)}
              </span>
            </Link>
          );
        })}
        {recent?.length === 0 && (
          <p className="py-4 text-center text-slate-500">
            No transactions yet. Tap <Link href="/add" className="font-semibold text-primary">+</Link> to add your first one.
          </p>
        )}
      </div>
    </main>
  );
}
