import { db } from "@/lib/db";

export async function getProfileName(): Promise<string | null> {
  const v = (await db.settings.get("profileName"))?.value?.trim();
  return v ? v : null;
}

export async function setProfileName(name: string): Promise<void> {
  const clean = name.trim().slice(0, 30);
  if (!clean) throw new Error("Tell us your name first");
  await db.settings.put({ key: "profileName", value: clean });
}
