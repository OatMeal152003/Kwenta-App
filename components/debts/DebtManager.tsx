"use client";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, newBase, type DebtDirection } from "@/lib/db";
import { toCentavos, formatPHPCompact } from "@/lib/money";
import { todayInManila, nowISO, relativeDay } from "@/lib/dates";
import { Avatar, OutlineButton, Segmented } from "@/components/ui";
import { useCountUp } from "@/hooks/useCountUp";
import { Icon } from "@/components/icons";

export default function DebtManager() {
  const debts = useLiveQuery(() => db.debts.filter((d) => d.deletedAt === null).sortBy("date"));
  const [formOpen, setFormOpen] = useState(false);
  const [direction, setDirection] = useState<DebtDirection>("oweMe");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayInManila());
  const [due, setDue] = useState("");
  const [error, setError] = useState("");

  async function add() {
    setError("");
    try {
      if (!person.trim()) throw new Error("Add a name first");
      const cents = toCentavos(amount);
      if (cents <= 0) throw new Error("Amount must be greater than ₱0");
      const base = newBase();
      await db.debts.add({
        ...base, direction, person: person.trim(), amountCentavos: cents,
        date, dueDate: due || null, isPaid: false, paidAt: null, note: "",
      });
      setPerson(""); setAmount(""); setDue(""); setFormOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  }

  const open = (debts ?? []).filter((d) => !d.isPaid);
  const oweMeList = open.filter((d) => d.direction === "oweMe");
  const iOweList = open.filter((d) => d.direction === "iOwe");
  const oweMe = oweMeList.reduce((s, d) => s + d.amountCentavos, 0);
  const iOwe = iOweList.reduce((s, d) => s + d.amountCentavos, 0);
  const aOweMe = useCountUp(oweMe);
  const aIOwe = useCountUp(iOwe);

  const row = (id: string, p: string, sub: string, cents: number, i: number) => (
    <div key={id} className="rise-in flex items-center gap-3 py-3" style={{ "--d": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}>
      <Avatar name={p} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xl font-bold text-ink">{p}</span>
        <span className="block truncate text-base text-slate-500">{sub}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <strong className="text-xl tabular-nums text-ink">{formatPHPCompact(cents)}</strong>
        <button
          aria-label={`Mark ${p} as paid`}
          onClick={() => db.debts.update(id, { isPaid: true, paidAt: nowISO(), updatedAt: nowISO() })}
          className="rounded-full border-[1.5px] border-primary px-4 py-1.5 text-base font-bold text-primary transition-colors active:bg-primary/10"
        >
          Mark paid
        </button>
      </span>
    </div>
  );

  return (
    <div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[24px] bg-primary p-4 text-white">
          <p className="text-lg opacity-90">Owed to you</p>
          <p className="font-heading text-3xl font-extrabold tabular-nums">{formatPHPCompact(aOweMe)}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-carddark">
          <p className="text-lg text-slate-500">You owe</p>
          <p className="font-heading text-3xl font-extrabold tabular-nums text-ink">{formatPHPCompact(aIOwe)}</p>
        </div>
      </div>

      <h2 className="mt-6 font-heading text-2xl font-extrabold text-ink">Owed to you</h2>
      <div>
        {oweMeList.map((d, i) => row(d.id, d.person, `${d.note ? d.note + " · " : ""}${relativeDay(d.date)}`, d.amountCentavos, i))}
        {oweMeList.length === 0 && <p className="py-2 text-slate-500">Nothing owed to you right now.</p>}
      </div>

      <h2 className="mt-4 font-heading text-2xl font-extrabold text-ink">You owe</h2>
      <div>
        {iOweList.map((d, i) => row(d.id, d.person, `${d.note ? d.note + " · " : ""}${d.dueDate ? "Due " + relativeDay(d.dueDate) : relativeDay(d.date)}`, d.amountCentavos, i))}
        {iOweList.length === 0 && <p className="py-2 text-slate-500">You owe nothing. Nice.</p>}
      </div>

      <div className="mt-4">
        {formOpen ? (
          <div className="card">
            <h3 className="font-heading text-xl font-extrabold text-ink">New utang</h3>
            <div className="mt-2">
              <Segmented
                label="Direction"
                value={direction}
                onChange={setDirection}
                options={[{ value: "oweMe", label: "Owes me" }, { value: "iOwe", label: "I owe" }]}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Who?" aria-label="Person name" className="rounded-[16px] border border-slate-200 p-3 dark:border-white/10" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="₱ amount" inputMode="decimal" aria-label="Debt amount" className="rounded-[16px] border border-slate-200 p-3 tabular-nums dark:border-white/10" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="rounded-[16px] border border-slate-200 p-3 text-slate-500 dark:border-white/10">
                <span className="block text-xs">Date</span>
                <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="w-full bg-transparent font-semibold text-ink outline-none" />
              </label>
              <label className="rounded-[16px] border border-slate-200 p-3 text-slate-500 dark:border-white/10">
                <span className="block text-xs">Due (optional)</span>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-full bg-transparent font-semibold text-ink outline-none" />
              </label>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={add} className="flex-1 rounded-full bg-primary py-3 font-heading font-bold text-white">Save</button>
              <button onClick={() => setFormOpen(false)} aria-label="Cancel" className="rounded-full border border-slate-200 px-5 text-slate-500"><Icon name="x" size={20} /></button>
            </div>
            {error && <p role="alert" className="mt-1 font-semibold text-expensetext">{error}</p>}
          </div>
        ) : (
          <OutlineButton label="Add utang" onClick={() => setFormOpen(true)}>Add utang</OutlineButton>
        )}
      </div>
    </div>
  );
}
