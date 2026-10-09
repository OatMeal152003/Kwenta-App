import { db } from "@/lib/db";

const ITER = 100_000;

function b64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function unb64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(0 + i);
  return out;
}

async function derive(pin: string, saltB64: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const saltBytes = unb64(saltB64);
  const saltBuf: ArrayBuffer = saltBytes.buffer.slice(saltBytes.byteOffset, saltBytes.byteOffset + saltBytes.byteLength) as ArrayBuffer;
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuf, iterations: ITER },
    key,
    256
  );
  return b64(bits);
}

export async function hasPin(): Promise<boolean> {
  return (await db.settings.get("pinHash"))?.value != null;
}

export async function setPin(pin: string): Promise<void> {
  if (!/^\d{4,8}$/.test(pin)) throw new Error("PIN must be 4–8 digits");
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltB64 = b64(salt.buffer as ArrayBuffer);
  const hash = await derive(pin, saltB64);
  await db.settings.put({ key: "pinSalt", value: saltB64 });
  await db.settings.put({ key: "pinHash", value: hash });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const [salt, stored] = await Promise.all([db.settings.get("pinSalt"), db.settings.get("pinHash")]);
  if (!salt || !stored) return false;
  return (await derive(pin, salt.value)) === stored.value;
}

export async function clearPin(): Promise<void> {
  await db.settings.delete("pinHash");
  await db.settings.delete("pinSalt");
}
