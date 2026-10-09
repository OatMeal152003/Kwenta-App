"use client";
import { useEffect, useState } from "react";
import { hasPin, setPin, clearPin } from "@/lib/pin";

export default function PinLock() {
  const [enabled, setEnabled] = useState(false);
  const [pin, setPinInput] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { hasPin().then(setEnabled); }, []);

  async function save() {
    try { await setPin(pin); setEnabled(true); setPinInput(""); setMsg("PIN set ✓"); sessionStorage.setItem("kwenta-unlocked", "1"); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="card mt-4">
      <h2 className="font-heading font-semibold">PIN lock (optional)</h2>
      <p className="text-sm opacity-70">{enabled ? "PIN is on for this device." : "Set a 4–8 digit PIN. Stored hashed on-device."}</p>
      <input value={pin} onChange={(e) => setPinInput(e.target.value)} inputMode="numeric" maxLength={8} placeholder="••••" aria-label="Set PIN" className="mt-2 w-full rounded-[16px] border border-slate-200 p-3 text-center text-xl tracking-widest dark:border-white/10" />
      <div className="mt-2 flex gap-2">
        <button onClick={save} className="flex-1 rounded-[16px] bg-primary px-4 py-2.5 font-bold text-white">Set PIN</button>
        {enabled && <button onClick={() => clearPin().then(() => { setEnabled(false); setMsg("PIN removed"); sessionStorage.removeItem("kwenta-unlocked"); })} className="flex-1 rounded-[16px] border border-slate-200 px-4 py-2.5 font-bold text-ink dark:border-white/15">Remove</button>}
      </div>
      {msg && <p className="mt-1 text-sm opacity-70">{msg}</p>}
    </div>
  );
}
