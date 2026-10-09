import { db } from "@/lib/db";

export type ThemePref = "light" | "dark" | "system";

/** Pure preference resolution — unit tested. */
export function resolveTheme(stored: string | null | undefined, systemDark: boolean): "light" | "dark" {
  if (stored === "light" || stored === "dark") return stored;
  return systemDark ? "dark" : "light";
}

export function applyTheme(mode: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export async function getThemePref(): Promise<ThemePref> {
  try {
    const ls = localStorage.getItem("kwenta-theme");
    if (ls === "light" || ls === "dark" || ls === "system") return ls;
  } catch { /* private mode */ }
  const v = (await db.settings.get("theme"))?.value;
  return v === "light" || v === "dark" ? v : "system";
}

export async function setThemePref(pref: ThemePref): Promise<void> {
  await db.settings.put({ key: "theme", value: pref });
  try { localStorage.setItem("kwenta-theme", pref); } catch { /* ignore */ }
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(resolveTheme(pref, systemDark));
}
