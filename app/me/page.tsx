"use client";
import { useState } from "react";
import Link from "next/link";
import WalletManager from "@/components/wallets/WalletManager";
import CategoryManager from "@/components/cats/CategoryManager";
import SchedulesManager from "@/components/schedules/SchedulesManager";
import CsvButtons from "@/components/settings/CsvButtons";
import PinLock from "@/components/settings/PinLock";
import AppearanceCard from "@/components/settings/AppearanceCard";
import ProfileCard from "@/components/settings/ProfileCard";
import { Icon } from "@/components/icons";
import { loadDemoData, clearDemoData } from "@/lib/seed";

export default function MePage() {
  const [msg, setMsg] = useState("");
  return (
    <main className="page-enter mx-auto w-full min-w-0 max-w-md overflow-x-clip p-4 pb-28">
      <h1 className="font-heading text-3xl font-extrabold text-ink">Me</h1>
      <p className="text-slate-500">Wallets, categories, and backup live here.</p>
      <Link href="/debts" className="card mt-4 flex items-center justify-between font-semibold">
        <span className="flex items-center gap-2"><Icon name="card" size={18} /> Utang tracker</span><span className="text-primary">Open →</span>
      </Link>
      <ProfileCard />
      <WalletManager />
      <CategoryManager />
      <SchedulesManager />
      <AppearanceCard />
      <CsvButtons />
      <PinLock />
      <div className="card mt-4 min-w-0 overflow-x-clip">
        <h2 className="font-heading font-semibold">Demo</h2>
        <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row">
          <button className="flex-1 rounded-[16px] bg-accent px-4 py-2.5 font-bold text-ink" onClick={() => loadDemoData().then(() => setMsg("Demo loaded"))}>Load demo data</button>
          <button className="flex-1 rounded-[16px] border border-slate-200 px-4 py-2.5 font-bold text-ink dark:border-white/15" onClick={() => clearDemoData().then(() => setMsg("Demo cleared"))}>Clear demo</button>
        </div>
        {msg && <p className="mt-1 text-sm opacity-70">{msg}</p>}
      </div>
    </main>
  );
}
