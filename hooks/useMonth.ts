"use client";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { monthKeyNow } from "@/lib/dates";

export function useMonth() {
  const [month, setMonth] = useState(monthKeyNow());
  const txs = useLiveQuery(
    () => db.transactions.filter((t) => t.deletedAt === null && t.month === month).toArray(),
    [month]
  );
  const income = (txs ?? []).filter((t) => t.type === "income").reduce((s, t) => s + t.amountCentavos, 0);
  const spent = (txs ?? []).filter((t) => t.type === "expense").reduce((s, t) => s + t.amountCentavos, 0);
  return { month, setMonth, txs: txs ?? [], income, spent, net: income - spent };
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
