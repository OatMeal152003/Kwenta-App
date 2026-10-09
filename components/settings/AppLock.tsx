"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { hasPin, verifyPin } from "@/lib/pin";

const MAX_ATTEMPTS = 5;

export default function AppLock({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const check = useCallback(async () => {
    if (await hasPin()) {
      if (sessionStorage.getItem("kwenta-unlocked") !== "1") setLocked(true);
    }
  }, []);

  useEffect(() => {
    check();
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [check]);

  async function unlock() {
    if (cooldown) return;
    if (await verifyPin(pin)) {
      sessionStorage.setItem("kwenta-unlocked", "1");
      setLocked(false); setPin(""); setAttempts(0); setError("");
    } else {
      const n = attempts + 1;
      setAttempts(n); setError("Wrong PIN");
      if (n >= MAX_ATTEMPTS) {
        setCooldown(true);
        setTimeout(() => { setCooldown(false); setAttempts(0); }, 30_000);
      }
    }
  }

  if (!locked) return <>{children}</>;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-4">
      <Image src="/brand/kwenta-icon.svg" alt="Kwenta" width={72} height={72} className="rounded-[20px] shadow-lg" priority />
      <h1 className="font-heading mt-3 text-xl font-bold">Kwenta is locked</h1>
      <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" maxLength={8} placeholder="••••" aria-label="Enter PIN" className="mt-4 w-40 rounded-[16px] border p-3 text-center text-2xl tracking-widest" />
      <button onClick={unlock} disabled={cooldown} className="mt-3 rounded-[16px] bg-primary px-8 py-2 font-bold text-white disabled:opacity-50">
        {cooldown ? "Wait 30s…" : "Unlock"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-expensetext">{error} ({attempts}/{MAX_ATTEMPTS})</p>}
    </main>
  );
}
