"use client";
import { useRef, useState } from "react";
import { exportCSV, importCSV } from "@/lib/csv";

export default function CsvButtons() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  async function onExport() {
    const text = await exportCSV();
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kwenta-backup-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Exported ✓");
  }

  async function onFile(f: File) {
    try {
      const text = await f.text();
      const r = await importCSV(text);
      setMsg(`Imported ${r.imported}, skipped ${r.skipped}`);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Import failed");
    }
  }

  return (
    <div className="card mt-4">
      <h2 className="font-heading font-semibold">Backup (CSV)</h2>
      <div className="mt-2 flex gap-2">
        <button onClick={onExport} className="flex-1 rounded-[16px] bg-primary px-4 py-2.5 font-bold text-white">Export</button>
        <button onClick={() => fileRef.current?.click()} className="flex-1 rounded-[16px] border border-slate-200 px-4 py-2.5 font-bold text-ink dark:border-white/15">Import</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" aria-label="Import CSV file"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </div>
      {msg && <p className="mt-1 text-sm opacity-70">{msg}</p>}
    </div>
  );
}
