// src/lib/auth-options.ts
// ✅ NextAuth options (Credentials) ultra robustes :
// - vérif bcrypt, rate-limit léger, rôle, JWT, pages custom, cookies secure
// - fallback ADMIN_* via env pour un compte admin local

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyPassword } from './bcrypt'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@techplay.local'
const ADMIN_HASH  = process.env.ADMIN_PASSWORD_HASH // bcrypt hash conseillé
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'change-me'

/** Rate-limit mémoire (simple et suffisant en dev/Vercel mono-instance) */
const attempts = new Map<string, { count: number; ts: number }>()
const WINDOW_MS = 10 * 60 * 1000 // 10 min
const MAX_TRIES = 10

function throttled(key: string) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.ts > WINDOW_MS) {
    attempts.set(key, { count: 1, ts: now })
    return false
  }
  entry.count++
  entry.ts = now
  return entry.count > MAX_TRIES
}

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },

  // Cookies sécurisés (même en dev si HTTPS)
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        const ip =
          (req as any)?.headers?.['x-forwarded-for'] ||
          (req as any)?.headers?.['x-real-ip'] ||
          'unknown'

        if (!credentials?.email || !credentials?.password) return null
        if (throttled(String(ip))) return null

        // ⚙️ Exemple – remplace par ta lookup DB (getUserByEmail)
        // Ici on supporte un compte ADMIN_* via env pour bootstrap
        const userRecord =
          credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && ADMIN_HASH
            ? { id: 'admin-1', email: ADMIN_EMAIL, passwordHash: ADMIN_HASH, role: 'admin' as const }
            : null

        if (!userRecord) return null

        const ok = await verifyPassword(credentials.password, userRecord.passwordHash)
        if (!ok) return null

        return { id: userRecord.id, email: userRecord.email, name: 'Admin', role: userRecord.role }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id
        token.role = (user as any).role ?? 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        ;(session.user as any).id = token.userId as string | undefined
        ;(session.user as any).role = (token.role as string) || 'user'
      }
      return session
    },
  },

  // Active des logs utiles en dev
  debug: process.env.NODE_ENV !== 'production',
}
