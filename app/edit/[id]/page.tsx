"use client";
import { use } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/db";
import TxForm from "@/components/tx/TxForm";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tx = useLiveQuery(() => db.transactions.get(id), [id]);
  if (tx === undefined) return <main className="mx-auto max-w-md p-4"><p className="text-sm">Loading…</p></main>;
  if (!tx) return <main className="mx-auto max-w-md p-4"><p className="text-sm">Not found.</p><Link href="/" className="text-primary">← Home</Link></main>;
  return (
    <main className="mx-auto max-w-md pb-24">
      <div className="p-4 pb-0"><Link href="/" className="text-sm font-semibold text-primary">← Cancel</Link></div>
      <TxForm
        editId={tx.id}
        initial={{ type: tx.type, amountCentavos: tx.amountCentavos, categoryId: tx.categoryId, walletId: tx.walletId, note: tx.note, date: tx.date }}
      />
    </main>
  );
}
