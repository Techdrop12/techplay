// src/lib/auth.ts
// ✅ Helpers NextAuth SSR-safe : getSession, requireSession, isAdmin, getUserId.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options"; // doit exister dans ton projet

export type SessionLike = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "admin" | "user" | string;
  } | null;
  expires?: string;
} | null;

export async function getSession(): Promise<SessionLike> {
  return getServerSession(authOptions);
}

export async function requireSession(): Promise<NonNullable<SessionLike>> {
  const session = await getSession();
  if (!session || !session.user?.email) {
    // Tu peux throw un error spécifique ou rediriger côté route.
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return (session?.user?.role ?? "user") === "admin";
}

export async function getUserId(): Promise<string | undefined> {
  const session = await getSession();
  return session?.user?.id || undefined;
}
