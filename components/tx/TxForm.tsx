"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addTransaction, db, softDeleteTransaction, type TxType } from "@/lib/db";
import { createSchedule } from "@/lib/recurring";
import { toCentavos, formatInput } from "@/lib/money";
import { todayInManila, nowISO, relativeDay } from "@/lib/dates";
import { useWallets, useCategories } from "@/hooks/useLive";
import { Chip, Segmented } from "@/components/ui";
import { Icon } from "@/components/icons";

export interface TxInitial {
  type: TxType;
  amountCentavos: number;
  categoryId: string;
  walletId: string;
  note: string;
  date: string;
}

function splitAmount(raw: string): { pesos: string; cents: string } {
  const clean = raw.replace(/[₱\s,]/g, "");
  if (!clean) return { pesos: "0", cents: "00" };
  const [p, c] = clean.split(".");
  return { pesos: p === "" ? "0" : p || "0", cents: (c ?? "").padEnd(2, "0").slice(0, 2) };
}

export default function TxForm({ editId, initial }: { editId?: string; initial?: TxInitial }) {
  const router = useRouter();
  const wallets = useWallets();
  const [type, setType] = useState<TxType>(initial?.type ?? "expense");
  const categories = useCategories(type);
  const [amount, setAmount] = useState(initial ? formatInput(initial.amountCentavos) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [walletId, setWalletId] = useState(initial?.walletId ?? "");
  const [date, setDate] = useState(initial?.date ?? todayInManila());
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [repeatDay, setRepeatDay] = useState(() => Number((initial?.date ?? todayInManila()).slice(8, 10)));
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setType(initial.type); setAmount(formatInput(initial.amountCentavos));
      setCategoryId(initial.categoryId); setWalletId(initial.walletId);
      setDate(initial.date); setNote(initial.note);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const picked = useMemo(() => {
    try { return amount.trim() === "" ? 0 : toCentavos(amount); } catch { return 0; }
  }, [amount]);
  const parts = splitAmount(amount);

  async function onSave() {
    setError("");
    try {
      const cents = toCentavos(amount);
      if (cents <= 0) throw new Error("Enter an amount greater than ₱0");
      const cat = categoryId || categories?.[0]?.id;
      const wal = walletId || wallets?.[0]?.id;
      if (!cat) throw new Error("Pick a category");
      if (!wal) throw new Error("Pick a wallet");
      if (editId) {
        await db.transactions.update(editId, {
          type, amountCentavos: cents, categoryId: cat, walletId: wal,
          note, date, month: date.slice(0, 7), updatedAt: nowISO(),
        });
      } else if (repeat) {
        await createSchedule({
          type, amountCentavos: cents, categoryId: cat, walletId: wal,
          note, dayOfMonth: repeatDay, startMonth: date.slice(0, 7),
        });
      } else {
        await addTransaction({ type, amountCentavos: cents, categoryId: cat, walletId: wal, note, date });
      }
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  }

  async function onDelete() {
    if (!editId) return;
    if (!window.confirm("Delete this transaction?")) return;
    await softDeleteTransaction(editId);
    router.push("/");
  }

  const effWallet = walletId || wallets?.[0]?.id || "";

  return (
    <div className="page-enter mx-auto max-w-md p-4 pb-28">
      <div className="flex items-center">
        <Link href="/" aria-label="Close" className="rounded-full p-2 text-ink">
          <Icon name="x" size={26} strokeWidth={2.5} />
        </Link>
        <h1 className="flex-1 text-center font-heading text-2xl font-extrabold text-ink">
          {editId ? "Edit transaction" : "Add transaction"}
        </h1>
        <span className="w-10" />
      </div>

      <div className="mt-4">
        <Segmented
          label="Type"
          value={type}
          onChange={(t: TxType) => { setType(t); setCategoryId(""); }}
          options={[{ value: "expense", label: "Expense" }, { value: "income", label: "Income" }]}
        />
      </div>

      <p className="mt-6 text-center text-lg text-slate-500">Amount</p>
      <div className="relative mx-auto w-fit" aria-live="polite">
        <div className="text-center font-heading text-6xl font-extrabold tabular-nums" aria-hidden="true">
          <span className="text-ink">₱{Number(parts.pesos).toLocaleString("en-PH")}</span>
          <span className="text-slate-300">.{parts.cents}</span>
        </div>
        <input
          value={amount}
          onChange={(e) => { if (/^[₱\d\s.,]*$/.test(e.target.value)) setAmount(e.target.value); }}
          inputMode="decimal"
          aria-label="Amount in pesos"
          placeholder=""
          className="absolute inset-0 h-full w-full bg-transparent text-transparent caret-primary outline-none selection:bg-primary/20"
        />
      </div>
      {picked > 0 && <p className="mt-1 text-center text-sm text-slate-400">Tap the amount to edit</p>}

      <h2 className="mt-6 font-heading text-xl font-extrabold text-ink">Category</h2>
      <div className="mt-2 grid grid-cols-4 gap-2.5">
        {categories?.map((c, i) => {
          const selected = (categoryId || categories[0]?.id) === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              aria-pressed={selected}
              style={{ "--d": `${Math.min(i, 11) * 25}ms` } as React.CSSProperties}
              className={`rise-in flex flex-col items-center gap-1.5 rounded-[20px] border bg-white py-3 transition-all active:scale-95 dark:bg-carddark ${selected ? "border-primary border-2 bg-primary/5" : "border-slate-200 dark:border-white/10"}`}
            >
              <Chip icon={c.icon} color={c.color} size={48} glyph={22} />
              <span className="px-1 text-center text-[13px] font-semibold leading-tight text-ink">{c.name}</span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-6 font-heading text-xl font-extrabold text-ink">Wallet</h2>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Wallet">
        {wallets?.map((w) => {
          const selected = effWallet === w.id;
          return (
            <button
              key={w.id}
              role="radio"
              aria-checked={selected}
              onClick={() => setWalletId(w.id)}
              className={`shrink-0 rounded-full px-6 py-2.5 text-lg font-bold transition-all ${selected ? "bg-primary text-white shadow" : "border border-slate-200 bg-white text-ink dark:border-white/10 dark:bg-carddark"}`}
            >
              {w.name}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <button onClick={() => dateRef.current?.showPicker?.() ?? dateRef.current?.focus()} className="flex w-full items-center justify-between border-b border-slate-200 py-4 dark:border-white/10" aria-label="Change date">
          <span className="text-xl text-slate-500">Date</span>
          <span className="text-xl font-bold text-ink">{relativeDay(date)}</span>
        </button>
        <input ref={dateRef} type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="sr-only" tabIndex={-1} aria-hidden="true" />
        <div className="flex w-full items-center justify-between border-b border-slate-200 py-4 dark:border-white/10">
          <label htmlFor="note" className="text-xl text-slate-500">Note</label>
          <input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note"
            className="w-1/2 bg-transparent text-right text-xl font-bold text-ink outline-none placeholder:font-medium placeholder:text-slate-300"
          />
        </div>
      </div>

      {!editId && (
        <button
          onClick={() => setRepeat(!repeat)}
          role="switch"
          aria-checked={repeat}
          aria-label="Repeat monthly"
          className="mt-4 flex w-full items-center justify-between rounded-[20px] border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-carddark"
        >
          <span className="text-left">
            <span className="block text-lg font-bold text-ink">Repeat monthly</span>
            <span className="block text-sm text-slate-500">Salary, allowance, bills…</span>
          </span>
          <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${repeat ? "bg-primary" : "bg-slate-200"}`}>
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${repeat ? "left-7" : "left-1"}`} />
          </span>
        </button>
      )}
      {!editId && repeat && (
        <div className="mt-2 flex items-center justify-between rounded-[20px] border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-carddark">
          <span className="text-lg font-bold text-ink">Posts every</span>
          <span className="flex items-center gap-3">
            <button onClick={() => setRepeatDay(Math.max(1, repeatDay - 1))} aria-label="Earlier day" className="rounded-full bg-slate-100 px-3 py-1 text-xl font-bold text-ink">−</button>
            <span className="min-w-16 text-center text-lg font-bold tabular-nums text-ink">{repeatDay}{repeatDay === 1 ? "st" : repeatDay === 2 ? "nd" : repeatDay === 3 ? "rd" : "th"}</span>
            <button onClick={() => setRepeatDay(Math.min(31, repeatDay + 1))} aria-label="Later day" className="rounded-full bg-slate-100 px-3 py-1 text-xl font-bold text-ink">+</button>
          </span>
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-center font-semibold text-expensetext">{error}</p>}

      <button
        onClick={onSave}
        className="mt-8 w-full rounded-full bg-primary py-4 font-heading text-xl font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]"
      >
        {editId ? "Save changes" : type === "expense" ? "Save expense" : "Save income"}
      </button>
      {editId && (
        <button onClick={onDelete} className="mt-2 w-full rounded-full border-2 border-expensetext/60 py-3 font-heading text-lg font-bold text-expensetext">
          Delete transaction
        </button>
      )}
    </div>
  );
}
