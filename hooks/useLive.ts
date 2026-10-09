"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useWallets() {
  return useLiveQuery(() => db.wallets.filter((w) => w.deletedAt === null).sortBy("sortOrder"));
}

export function useCategories(kind?: "income" | "expense") {
  return useLiveQuery(async () => {
    let col = db.categories.filter((c) => c.deletedAt === null);
    if (kind) col = col.filter((c) => c.kind === kind || c.kind === "both");
    return col.sortBy("sortOrder");
  }, [kind]);
}

export function useRecentTransactions(limit = 10) {
  return useLiveQuery(() =>
    db.transactions
      .filter((t) => t.deletedAt === null)
      .toArray()
      .then((a) => a.sort((x, y) => y.timestamp - x.timestamp).slice(0, limit))
  );
}
