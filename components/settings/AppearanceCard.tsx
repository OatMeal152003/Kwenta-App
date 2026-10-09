"use client";
import { useEffect, useState } from "react";
import { getThemePref, setThemePref, type ThemePref } from "@/lib/theme";
import { Segmented } from "@/components/ui";

export default function AppearanceCard() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => { getThemePref().then(setPref).catch(() => {}); }, []);

  async function pick(p: ThemePref) {
    setPref(p);
    await setThemePref(p).catch(() => {});
  }

  return (
    <div className="card mt-4">
      <h2 className="font-heading text-xl font-extrabold text-ink">Appearance</h2>
      <div className="mt-2">
        <Segmented
          label="Appearance"
          value={pref}
          onChange={pick}
          options={[{ value: "light", label: "Light" }, { value: "system", label: "System" }, { value: "dark", label: "Dark" }]}
        />
      </div>
      <p className="mt-1.5 text-sm text-slate-500">System follows your phone&apos;s setting.</p>
    </div>
  );
}
