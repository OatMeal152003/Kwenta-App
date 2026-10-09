import { db, newBase } from "@/lib/db";
import { nowISO } from "@/lib/dates";
import { postDueSchedules } from "@/lib/recurring";
import { LEGACY_ICON_MAP } from "@/components/icons";

const now = () => nowISO();

/** One-time migration: emoji icons → SVG icon keys. */
async function migrateLegacyIcons(): Promise<void> {
  const t = now();
  for (const w of await db.wallets.toArray()) {
    const mapped = LEGACY_ICON_MAP[w.icon];
    if (mapped) await db.wallets.update(w.id, { icon: mapped, updatedAt: t });
  }
  for (const c of await db.categories.toArray()) {
    const mapped = LEGACY_ICON_MAP[c.icon];
    if (mapped) await db.categories.update(c.id, { icon: mapped, updatedAt: t });
  }
}

/** Collapse duplicate wallets/categories (same name), keeping the earliest.
 *  Transactions pointing at removed dupes are re-pointed at the survivor. */
async function dedupeDefaults(): Promise<void> {
  const t = now();
  const wallets = await db.wallets.filter((w) => w.deletedAt === null).toArray();
  const seenW = new Map<string, string>();
  for (const w of wallets.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const key = w.name.trim().toLowerCase();
    const keep = seenW.get(key);
    if (!keep) {
      seenW.set(key, w.id);
    } else {
      await db.transactions.where("walletId").equals(w.id).modify({ walletId: keep, updatedAt: t });
      await db.wallets.update(w.id, { deletedAt: t, updatedAt: t });
    }
  }
  const cats = await db.categories.filter((c) => c.deletedAt === null).toArray();
  const seenC = new Map<string, string>();
  for (const c of cats.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const key = `${c.name.trim().toLowerCase()}|${c.kind}`;
    const keep = seenC.get(key);
    if (!keep) {
      seenC.set(key, c.id);
    } else {
      await db.transactions.where("categoryId").equals(c.id).modify({ categoryId: keep, updatedAt: t });
      await db.categories.update(c.id, { deletedAt: t, updatedAt: t });
    }
  }
}

// Guard against concurrent runs (e.g. dev double-render) seeding twice.
let seeding: Promise<void> | null = null;

export function ensureDefaults(): Promise<void> {
  if (!seeding) seeding = runEnsureDefaults().finally(() => { seeding = null; });
  return seeding;
}

async function runEnsureDefaults(): Promise<void> {
  await migrateLegacyIcons();
  await dedupeDefaults();
  await postDueSchedules();
  const wCount = await db.wallets.filter((w) => w.deletedAt === null).count();
  const cCount = await db.categories.filter((c) => c.deletedAt === null).count();
  if (wCount === 0) {
    const t = now();
    await db.wallets.bulkAdd([
      { id: crypto.randomUUID?.() ?? newBase().id, createdAt: t, updatedAt: t, deletedAt: null, name: "Cash", kind: "cash", icon: "banknote", color: "#0F766E", sortOrder: 0 },
      { id: crypto.randomUUID?.() ?? newBase().id, createdAt: t, updatedAt: t, deletedAt: null, name: "GCash", kind: "gcash", icon: "gcash", color: "#007DFF", sortOrder: 1 },
      { id: crypto.randomUUID?.() ?? newBase().id, createdAt: t, updatedAt: t, deletedAt: null, name: "Maya", kind: "maya", icon: "maya", color: "#00A651", sortOrder: 2 },
      { id: crypto.randomUUID?.() ?? newBase().id, createdAt: t, updatedAt: t, deletedAt: null, name: "Bank", kind: "bank", icon: "landmark", color: "#7C3AED", sortOrder: 3 },
    ]);
  }
  if (cCount === 0) {
    const t = now();
    const expense: Array<[string, string, string]> = [
      ["Food", "food", "#F26B5B"],
      ["Transport/Fare", "transport", "#F59E0B"],
      ["Load", "signal", "#0EA5E9"],
      ["Bills", "receipt", "#64748B"],
      ["School", "book", "#8B5CF6"],
      ["Padala", "send", "#EC4899"],
      ["Shopping", "bag", "#F5B83D"],
      ["Health", "health", "#22C55E"],
      ["Others", "dots", "#94A3B8"],
    ];
    const income: Array<[string, string, string]> = [
      ["Allowance", "gift", "#22C55E"],
      ["Salary", "briefcase", "#15803D"],
      ["Other Income", "plus-circle", "#0F766E"],
    ];
    await db.categories.bulkAdd([
      ...expense.map(([name, icon, color], i) => ({
        id: crypto.randomUUID?.() ?? newBase().id,
        createdAt: t, updatedAt: t, deletedAt: null,
        name, kind: "expense" as const, icon, color, sortOrder: i,
      })),
      ...income.map(([name, icon, color], i) => ({
        id: crypto.randomUUID?.() ?? newBase().id,
        createdAt: t, updatedAt: t, deletedAt: null,
        name, kind: "income" as const, icon, color, sortOrder: 100 + i,
      })),
    ]);
  }
}

export async function isDemoLoaded(): Promise<boolean> {
  const s = await db.settings.get("demoLoaded");
  return s?.value === "1";
}

export async function loadDemoData(): Promise<void> {
  await ensureDefaults();
  if (await isDemoLoaded()) return;
  const wallets = await db.wallets.toArray();
  const cats = await db.categories.toArray();
  const findW = (n: string) => wallets.find((w) => w.name === n)?.id ?? wallets[0].id;
  const findC = (n: string) => cats.find((c) => c.name === n)?.id ?? cats[0].id;
  const t = now();
  const demo = [
    { type: "income", amountCentavos: 500000, categoryId: findC("Allowance"), walletId: findW("GCash"), note: "Weekly allowance", date: "2026-09-28" },
    { type: "expense", amountCentavos: 18550, categoryId: findC("Food"), walletId: findW("Cash"), note: "Jollibee", date: "2026-09-29" },
    { type: "expense", amountCentavos: 5000, categoryId: findC("Transport/Fare"), walletId: findW("Cash"), note: "Jeep", date: "2026-09-30" },
    { type: "expense", amountCentavos: 15000, categoryId: findC("Load"), walletId: findW("GCash"), note: "Data promo", date: "2026-10-01" },
    { type: "income", amountCentavos: 1200000, categoryId: findC("Salary"), walletId: findW("Bank"), note: "Payout", date: "2026-10-03" },
    { type: "expense", amountCentavos: 85000, categoryId: findC("Bills"), walletId: findW("GCash"), note: "Meralco", date: "2026-10-04" },
    { type: "expense", amountCentavos: 25000, categoryId: findC("School"), walletId: findW("Cash"), note: "Print", date: "2026-10-05" },
    { type: "expense", amountCentavos: 32000, categoryId: findC("Food"), walletId: findW("Maya"), note: "Groceries", date: "2026-10-06" },
  ] as const;
  const { timestampForDate } = await import("@/lib/dates");
  await db.transactions.bulkAdd(
    demo.map((d) => ({
      id: crypto.randomUUID?.() ?? newBase().id,
      createdAt: t, updatedAt: t, deletedAt: null,
      currency: "PHP",
      timestamp: timestampForDate(d.date),
      month: d.date.slice(0, 7),
      ...d,
    }))
  );
  await db.settings.put({ key: "demoLoaded", value: "1" });
}

export async function clearDemoData(): Promise<void> {
  await db.transactions.clear();
  await db.budgets.clear();
  await db.debts.clear();
  await db.settings.put({ key: "demoLoaded", value: "0" });
}
