"use client";
import { useEffect, useState } from "react";
import { getProfileName, setProfileName } from "@/lib/profile";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function ProfileCard() {
  const [name, setName] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => getProfileName().then(setName).catch(() => {});
    load();
    window.addEventListener("kwenta-profile", load);
    return () => window.removeEventListener("kwenta-profile", load);
  }, []);

  async function save() {
    setError("");
    try {
      await setProfileName(draft);
      const fresh = await getProfileName();
      setName(fresh);
      window.dispatchEvent(new Event("kwenta-profile"));
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid name");
    }
  }

  return (
    <div className="card mt-4 flex items-center gap-3">
      <Avatar name={name ?? "?"} size={52} />
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            maxLength={30}
            autoFocus
            aria-label="Your name"
            className="w-full rounded-[12px] border border-slate-200 bg-transparent p-2 text-lg font-bold text-ink outline-none focus:border-primary dark:border-white/10"
          />
        ) : (
          <>
            <p className="truncate font-heading text-xl font-extrabold text-ink">{name ?? "…"}</p>
            <p className="text-sm text-slate-500">Kumusta! This shows on Home.</p>
          </>
        )}
        {error && <p role="alert" className="text-sm font-semibold text-expensetext">{error}</p>}
      </div>
      {editing ? (
        <button onClick={save} aria-label="Save name" className="rounded-full bg-primary p-3 text-white"><Icon name="check" size={18} /></button>
      ) : (
        <button onClick={() => { setDraft(name ?? ""); setEditing(true); }} aria-label="Edit name" className="rounded-full bg-slate-100 p-3 text-ink dark:bg-white/10 dark:text-inkdark"><Icon name="edit" size={18} /></button>
      )}
    </div>
  );
}
