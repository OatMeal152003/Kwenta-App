"use client";
import { useState } from "react";
import BudgetManager from "@/components/budgets/BudgetManager";
import { monthKeyNow } from "@/lib/dates";
import { shiftMonth } from "@/hooks/useMonth";
import { PageHeader, MonthPill } from "@/components/ui";

export default function BudgetsPage() {
  const [month, setMonth] = useState(monthKeyNow());
  return (
    <main className="page-enter mx-auto max-w-md p-4 pb-28">
      <PageHeader
        title="Budgets"
        right={<MonthPill month={month} onPrev={() => setMonth(shiftMonth(month, -1))} onNext={() => setMonth(shiftMonth(month, 1))} />}
      />
      <BudgetManager month={month} />
    </main>
  );
}
