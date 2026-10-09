"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getProfileName, setProfileName } from "@/lib/profile";

/** Friendly waving hand mark for the welcome step. */
export function WaveHand({ size = 72 }: { size?: number }) {
  return (
    <span className="wave-hand" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" fill="#F5B83D" opacity="0.2" />
        <g className="wave-hand-palm" style={{ transformOrigin: "32px 44px" }}>
          <path d="M22 36V26a3 3 0 016 0v8V24a3 3 0 016 0v10V23a3 3 0 016 0v11l4-5a3 3 0 015 4l-9 11a9 9 0 01-7 4h-3a9 9 0 01-8-5z" fill="#0F766E" />
        </g>
      </svg>
    </span>
  );
}

/** Required-once welcome: asks for the user's name after the intro splash. */
export default function OnboardingName() {
  const [state, setState] = useState<"checking" | "ask" | "done">("checking");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for the intro splash to finish before asking.
    const t = setTimeout(async () => {
      const existing = await getProfileName().catch(() => null);
      setState(existing ? "done" : "ask");
    }, 1700);
    return () => clearTimeout(t);
  }, []);

  async function save() {
    setError("");
    try {
      await setProfileName(name);
      window.dispatchEvent(new Event("kwenta-profile"));
      setState("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid name");
    }
  }

  if (state !== "ask") return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Welcome to Kwenta" className="fixed inset-0 z-[55] flex items-center justify-center bg-bg p-6 dark:bg-bgdark">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto w-fit"><WaveHand /></div>
        <div className="mx-auto mt-4 w-fit">
          <Image src="/brand/kwenta-icon.svg" alt="" width={56} height={56} className="rounded-[16px] shadow-lg" priority />
        </div>
        <h1 className="font-heading mt-4 text-3xl font-extrabold text-ink">Kumusta!</h1>
        <p className="mt-1 text-lg text-slate-500">What should we call you?</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); }}
          placeholder="e.g. Juan"
          maxLength={30}
          autoFocus
          aria-label="Your name"
          className="mt-4 w-full rounded-[20px] border border-slate-200 bg-white p-4 text-center text-xl font-bold text-ink outline-none placeholder:font-medium placeholder:text-slate-300 focus:border-primary dark:border-white/10 dark:bg-carddark"
        />
        {error && <p role="alert" className="mt-2 font-semibold text-expensetext">{error}</p>}
        <button
          onClick={save}
          className="mt-4 w-full rounded-full bg-primary py-4 font-heading text-xl font-bold text-white shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]"
        >
          Start tracking
        </button>
      </div>
    </div>
  );
}
