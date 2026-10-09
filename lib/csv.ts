import { db, type Transaction } from "@/lib/db";
import { nowISO, timestampForDate } from "@/lib/dates";

const HEADER = "id,type,amountCentavos,categoryId,walletId,note,date,currency,createdAt,updatedAt,deletedAt";

function esc(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export async function exportCSV(): Promise<string> {
  const txs = await db.transactions.toArray();
  const rows = txs.map((t) =>
    [t.id, t.type, String(t.amountCentavos), t.categoryId, t.walletId, esc(t.note), t.date, t.currency, t.createdAt, t.updatedAt, t.deletedAt ?? ""].join(",")
  );
  return [HEADER, ...rows].join("\n");
}

export async function importCSV(text: string): Promise<{ imported: number; skipped: number }> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new Error("Empty file");
  const header = lines[0].trim();
  if (header !== HEADER) throw new Error("Bad CSV header. Export from Kwenta first.");
  let imported = 0, skipped = 0;
  for (const line of lines.slice(1)) {
    const [id, type, amountS, categoryId, walletId, note, date, currency, createdAt, updatedAt, deletedAt] = parseLine(line);
    if (!id || (type !== "income" && type !== "expense")) { skipped++; continue; }
    const amountCentavos = parseInt(amountS, 10);
    if (!Number.isInteger(amountCentavos) || amountCentavos <= 0) { skipped++; continue; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { skipped++; continue; }
    const exists = await db.transactions.get(id);
    const rec: Transaction = {
      id, type, amountCentavos, categoryId, walletId, note,
      date, timestamp: timestampForDate(date), month: date.slice(0, 7),
      currency: currency || "PHP",
      createdAt: createdAt || nowISO(), updatedAt: updatedAt || nowISO(),
      deletedAt: deletedAt || null,
    };
    if (exists) {
      if ((rec.updatedAt ?? "") > (exists.updatedAt ?? "")) { await db.transactions.put(rec); imported++; }
      else skipped++;
    } else {
      await db.transactions.add(rec); imported++;
    }
  }
  return { imported, skipped };
}
