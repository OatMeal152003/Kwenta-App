"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

/** Branded loading intro: Kwenta icon + wordmark, fades out after launch. */
export default function IntroSplash() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showFor = reduced ? 0 : 1400;
    const t1 = setTimeout(() => (reduced ? setGone(true) : setLeaving(true)), showFor);
    const t2 = setTimeout(() => setGone(true), showFor + 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-label="Loading Kwenta"
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-bg transition-opacity duration-500 dark:bg-bgdark ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="intro-pop">
        <Image src="/brand/kwenta-icon.svg" alt="" width={104} height={104} className="rounded-[28px] shadow-xl shadow-primary/25" priority />
      </div>
      <div className="intro-rise">
        <Image src="/brand/kwenta-wordmark.svg" alt="Kwenta" width={180} height={40} className="dark:brightness-0 dark:invert" priority />
      </div>
      <div className="intro-bar" aria-hidden="true"><span /></div>
    </div>
  );
}
