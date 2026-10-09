"use client";
import { useEffect } from "react";
import { getThemePref, resolveTheme, applyTheme } from "@/lib/theme";

/** Applies the stored theme on boot and follows the OS in system mode. */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let alive = true;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = async () => {
      const pref = await getThemePref().catch(() => "system" as const);
      if (alive) applyTheme(resolveTheme(pref, mq.matches));
    };
    sync();
    mq.addEventListener("change", sync);
    return () => { alive = false; mq.removeEventListener("change", sync); };
  }, []);
  return <>{children}</>;
}
