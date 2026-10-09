import Dexie, { type Table } from "dexie";
import { v4 as uuid } from "uuid";
import { nowISO, timestampForDate } from "@/lib/dates";

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type WalletKind = "cash" | "gcash" | "maya" | "bank" | "custom";
export interface Wallet extends BaseRecord {
  name: string;
  kind: WalletKind;
  icon: string;
  color: string;
  sortOrder: number;
}

export type CategoryKind = "income" | "expense" | "both";
export interface Category extends BaseRecord {
  name: string;
  kind: CategoryKind;
  icon: string;
  color: string;
  sortOrder: number;
}

export type TxType = "income" | "expense";
export interface Transaction extends BaseRecord {
  type: TxType;
  amountCentavos: number; // integer > 0
  categoryId: string;
  walletId: string;
  note: string;
  date: string; // YYYY-MM-DD (Manila)
  timestamp: number;
  month: string; // YYYY-MM
  currency: string; // default PHP
}

export interface Budget extends BaseRecord {
  categoryId: string;
  month: string; // YYYY-MM
  limitCentavos: number;
}

export type DebtDirection = "oweMe" | "iOwe";
export interface Debt extends BaseRecord {
  direction: DebtDirection;
  person: string;
  amountCentavos: number;
  date: string;
  dueDate: string | null;
  isPaid: boolean;
  paidAt: string | null;
  note: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Schedule extends BaseRecord {
  type: TxType;
  amountCentavos: number;
  categoryId: string;
  walletId: string;
  note: string;
  frequency: "monthly";
  dayOfMonth: number; // 1-31, clamped to month length when posting
  startMonth: string; // YYYY-MM
  endMonth: string | null; // paused/ended; null = active
  lastPostedMonth: string | null;
}

class KwentaDB extends Dexie {
  wallets!: Table<Wallet, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  debts!: Table<Debt, string>;
  schedules!: Table<Schedule, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("kwenta");
    this.version(1).stores({
      wallets: "id, kind, sortOrder, updatedAt, deletedAt",
      categories: "id, kind, sortOrder, updatedAt, deletedAt",
      transactions:
        "id, type, date, timestamp, month, walletId, categoryId, [walletId+date], [categoryId+date], deletedAt, updatedAt",
      budgets: "id, [categoryId+month], month, updatedAt, deletedAt",
      debts: "id, direction, isPaid, date, updatedAt, deletedAt",
      settings: "key",
    });
    // v2 adds recurring schedules; v1 data untouched.
    this.version(2).stores({
      schedules: "id, frequency, lastPostedMonth, endMonth, updatedAt, deletedAt",
    });
  }
}

export const db = new KwentaDB();

export function newBase(): BaseRecord {
  const now = nowISO();
  return { id: uuid(), createdAt: now, updatedAt: now, deletedAt: null };
}

export async function addTransaction(input: {
  type: TxType;
  amountCentavos: number;
  categoryId: string;
  walletId: string;
  note?: string;
  date: string;
  currency?: string;
}): Promise<string> {
  if (!Number.isInteger(input.amountCentavos) || input.amountCentavos <= 0)
    throw new Error("amountCentavos must be a positive integer");
  const base = newBase();
  const tx: Transaction = {
    ...base,
    type: input.type,
    amountCentavos: input.amountCentavos,
    categoryId: input.categoryId,
    walletId: input.walletId,
    note: input.note ?? "",
    date: input.date,
    timestamp: timestampForDate(input.date),
    month: input.date.slice(0, 7),
    currency: input.currency ?? "PHP",
  };
  await db.transactions.add(tx);
  return tx.id;
}

export async function softDeleteTransaction(id: string): Promise<void> {
  await db.transactions.update(id, { deletedAt: nowISO(), updatedAt: nowISO() });
}

export async function restoreTransaction(id: string): Promise<void> {
  await db.transactions.update(id, { deletedAt: null, updatedAt: nowISO() });
}

/** Derived balance: income - expense for a wallet, excluding soft-deleted. */
export async function walletBalance(walletId: string): Promise<number> {
  const txs = await db.transactions
    .where("walletId")
    .equals(walletId)
    .filter((t) => t.deletedAt === null)
    .toArray();
  return txs.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amountCentavos : -t.amountCentavos),
    0
  );
}
