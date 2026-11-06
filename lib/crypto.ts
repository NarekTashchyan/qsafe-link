// Real cryptography with the browser's Web Crypto API.
import type { Bit } from "./bb84";

/** Privacy amplification: compress the corrected key bits into one 256-bit key with SHA-256. */
export async function deriveKeyBytes(bits: Bit[]): Promise<Uint8Array> {
  const packed = new Uint8Array(Math.ceil(bits.length / 8));
  bits.forEach((b, i) => {
    if (b) packed[i >> 3] |= 128 >> (i & 7);
  });
  // public random seed, shared over the authenticated channel
  const seed = crypto.getRandomValues(new Uint8Array(16));
  const data = new Uint8Array(seed.length + packed.length);
  data.set(seed);
  data.set(packed, seed.length);
  const digest = await crypto.subtle.digest("SHA-256", data as BufferSource);
  return new Uint8Array(digest);
}

export function importAesKey(raw: Uint8Array, usage: "encrypt" | "decrypt"): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, [usage]);
}

export interface Sealed {
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

export async function encryptText(key: CryptoKey, text: string): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(text);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, plain as BufferSource);
  return { iv, ciphertext: new Uint8Array(ct) };
}

/** Returns the text, or null when the message was changed (AES-GCM authentication fails). */
export async function decryptText(key: CryptoKey, sealed: Sealed): Promise<string | null> {
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: sealed.iv as BufferSource }, key, sealed.ciphertext as BufferSource);
    return new TextDecoder().decode(pt);
  } catch {
    return null;
  }
}

export const toHex = (u8: Uint8Array): string =>
  Array.from(u8, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .replace(/(.{8})/g, "$1 ")
    .trim();

export const toBase64 = (u8: Uint8Array): string => {
  let s = "";
  u8.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
