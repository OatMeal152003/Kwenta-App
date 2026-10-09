"use client";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, newBase, type WalletKind } from "@/lib/db";
import { nowISO } from "@/lib/dates";
import { formatPHP } from "@/lib/money";
import { Icon, WALLET_ICONS, WALLET_KIND_ICON } from "@/components/icons";
import { Chip } from "@/components/ui";

const KINDS: WalletKind[] = ["cash", "gcash", "maya", "bank", "custom"];
const COLORS = ["#0F766E", "#007DFF", "#00A651", "#7C3AED", "#F5B83D", "#F26B5B"];

export default function WalletManager() {
  const wallets = useLiveQuery(() => db.wallets.filter((w) => w.deletedAt === null).sortBy("sortOrder"));
  const txs = useLiveQuery(() => db.transactions.filter((t) => t.deletedAt === null).toArray());
  const [name, setName] = useState("");
  const [kind, setKind] = useState<WalletKind>("cash");
  const [icon, setIcon] = useState(WALLET_ICONS[0]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const balances = new Map<string, number>();
  (txs ?? []).forEach((t) => {
    balances.set(t.walletId, (balances.get(t.walletId) ?? 0) + (t.type === "income" ? t.amountCentavos : -t.amountCentavos));
  });

  async function add() {
    setError("");
    const n = name.trim();
    if (!n) { setError("Name required"); return; }
    const base = newBase();
    await db.wallets.add({
      ...base, name: n, kind,
      icon: icon || WALLET_KIND_ICON[kind] || "wallet",
      color: COLORS[(wallets?.length ?? 0) % COLORS.length],
      sortOrder: wallets?.length ?? 0,
    });
    setName("");
  }

  return (
    <div className="card mt-4 min-w-0 overflow-x-clip">
      <h2 className="font-heading font-semibold">Wallets</h2>
      {(wallets ?? []).map((w, i) => (
        <div key={w.id} className="rise-in flex items-center justify-between gap-2 border-b py-2 text-sm last:border-0" style={{ "--d": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}>
          <span className="flex items-center gap-2.5">
            <Chip icon={w.icon} color={w.color} size={44} glyph={20} />
            <span>
              {editing === w.id ? (
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded border px-2 py-1" aria-label="Wallet name" />
              ) : <strong className="text-base text-ink">{w.name}</strong>}
              <span className="block text-sm capitalize text-slate-500">{w.kind}</span>
            </span>
          </span>
          <span className="flex items-center gap-1">
            <strong>{formatPHP(balances.get(w.id) ?? 0)}</strong>
            {editing === w.id ? (
              <button aria-label="Save wallet name" className="rounded p-2 text-primary" onClick={() => {
                const n = editName.trim(); if (!n) return;
                db.wallets.update(w.id, { name: n, updatedAt: nowISO() }); setEditing(null);
              }}><Icon name="check" size={18} /></button>
            ) : (
              <button aria-label={`Rename ${w.name}`} className="rounded p-2 opacity-60" onClick={() => { setEditing(w.id); setEditName(w.name); }}><Icon name="edit" size={18} /></button>
            )}
            <button aria-label={`Delete ${w.name}`} className="rounded p-2 opacity-60" onClick={() => db.wallets.update(w.id, { deletedAt: nowISO(), updatedAt: nowISO() })}><Icon name="trash" size={18} /></button>
          </span>
        </div>
      )) ?? <p className="text-sm">Loading…</p>}

      <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New wallet (e.g. Seabank)" aria-label="New wallet name" className="w-full min-w-0 flex-1 rounded-[16px] border p-2" />
        <div className="flex min-w-0 gap-2">
          <select value={kind} onChange={(e) => { setKind(e.target.value as WalletKind); setIcon(WALLET_KIND_ICON[e.target.value] || "wallet"); }} aria-label="Wallet type" className="min-w-0 flex-1 rounded-[16px] border p-2 sm:flex-none">
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <button onClick={add} className="flex-1 rounded-[16px] bg-primary px-5 py-2.5 font-bold text-white sm:flex-none sm:shrink-0">Add</button>
        </div>
      </div>
      <div className="mt-2 flex min-w-0 flex-wrap gap-1" role="radiogroup" aria-label="Wallet icon">
        {WALLET_ICONS.map((ic) => (
          <button key={ic} role="radio" aria-checked={icon === ic} aria-label={`Icon ${ic}`} onClick={() => setIcon(ic)}
            className={`min-w-0 shrink-0 rounded-[12px] border p-2 ${icon === ic ? "border-primary ring-2 ring-primary" : "opacity-60"}`}>
            <Icon name={ic} size={18} />
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-expensetext">{error}</p>}
    </div>
  );
}
