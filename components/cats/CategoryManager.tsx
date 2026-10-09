"use client";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, newBase, type CategoryKind } from "@/lib/db";
import { nowISO } from "@/lib/dates";
import { Icon, CATEGORY_ICONS } from "@/components/icons";
import { Chip } from "@/components/ui";

const COLORS = ["#F26B5B", "#F59E0B", "#0EA5E9", "#64748B", "#8B5CF6", "#EC4899", "#F5B83D", "#22C55E", "#0F766E"];

export default function CategoryManager() {
  const cats = useLiveQuery(() => db.categories.filter((c) => c.deletedAt === null).sortBy("sortOrder"));
  const [name, setName] = useState("");
  const [kind, setKind] = useState<CategoryKind>("expense");
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [error, setError] = useState("");

  async function add() {
    setError("");
    const n = name.trim();
    if (!n) { setError("Name required"); return; }
    const base = newBase();
    await db.categories.add({
      ...base, name: n, kind, icon,
      color: COLORS[(cats?.length ?? 0) % COLORS.length],
      sortOrder: cats?.length ?? 0,
    });
    setName("");
  }

  const expense = (cats ?? []).filter((c) => c.kind === "expense" || c.kind === "both");
  const income = (cats ?? []).filter((c) => c.kind === "income" || c.kind === "both");

  const row = (id: string, ic: string, color: string, nm: string, i: number) => (
    <div key={id} className="rise-in flex items-center justify-between border-b py-1.5 text-sm last:border-0" style={{ "--d": `${Math.min(i, 10) * 30}ms` } as React.CSSProperties}>
      <span className="flex items-center gap-2.5">
        <Chip icon={ic} color={color} size={44} glyph={20} />
        <span className="text-base font-semibold text-ink">{nm}</span>
      </span>
      <button aria-label={`Delete ${nm}`} className="rounded p-2 opacity-60" onClick={() => db.categories.update(id, { deletedAt: nowISO(), updatedAt: nowISO() })}><Icon name="trash" size={17} /></button>
    </div>
  );

  return (
    <div className="card mt-4 min-w-0 overflow-x-clip">
      <h2 className="font-heading font-semibold">Categories</h2>
      <h3 className="mt-2 text-xs font-bold uppercase opacity-60">Expense</h3>
      {expense.map((c, i) => row(c.id, c.icon, c.color, c.name, i))}
      <h3 className="mt-3 text-xs font-bold uppercase opacity-60">Income</h3>
      {income.map((c, i) => row(c.id, c.icon, c.color, c.name, i))}

      <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" aria-label="New category name" className="w-full min-w-0 flex-1 rounded-[16px] border p-2" />
        <select value={kind} onChange={(e) => setKind(e.target.value as CategoryKind)} aria-label="Category kind" className="min-w-0 flex-1 rounded-[16px] border p-2 sm:w-auto sm:flex-none">
          <option value="expense">expense</option>
          <option value="income">income</option>
        </select>
      </div>
      <div className="mt-2 grid min-w-0 grid-cols-7 gap-1" role="radiogroup" aria-label="Category icon">
        {CATEGORY_ICONS.map((ic) => (
          <button key={ic} role="radio" aria-checked={icon === ic} aria-label={`Icon ${ic}`} onClick={() => setIcon(ic)}
            className={`min-w-0 rounded-[12px] border p-1.5 sm:p-2 ${icon === ic ? "border-primary ring-2 ring-primary" : "opacity-60"}`}>
            <Icon name={ic} size={18} />
          </button>
        ))}
      </div>
      <button onClick={add} className="mt-2 w-full rounded-[16px] bg-primary px-4 py-2 font-bold text-white">Add category</button>
      {error && <p role="alert" className="mt-1 text-sm text-expensetext">{error}</p>}
    </div>
  );
}
