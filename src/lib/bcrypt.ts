// src/lib/bcrypt.ts
// ✅ Enveloppe bcryptjs : coût configurable, helpers rehash & constant-time.

import bcrypt from "bcryptjs";

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Permet de savoir si un hash doit être recalculé (si tu augmentes ROUNDS). */
export function needsRehash(hash: string): boolean {
  const m = hash.match(/^\$2[abxy]?\$(\d{2})\$/);
  if (!m) return true;
  const rounds = Number(m[1]);
  return rounds < ROUNDS;
}
