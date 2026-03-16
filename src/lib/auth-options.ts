// src/lib/auth-options.ts
// ✅ NextAuth options (Credentials) ultra robustes :
// - vérif bcrypt, rate-limit léger, rôle, JWT, pages custom, cookies secure
// - fallback ADMIN_* via env pour un compte admin local

import CredentialsProvider from 'next-auth/providers/credentials';

import { verifyPassword } from './bcrypt';

import type { NextAuthOptions, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

import { serverEnv } from '@/env.server';

const ADMIN_EMAIL = serverEnv.ADMIN_EMAIL || 'admin@techplay.local';
const ADMIN_HASH = serverEnv.ADMIN_PASSWORD_HASH;
const AUTH_SECRET = serverEnv.NEXTAUTH_SECRET || serverEnv.AUTH_SECRET || 'change-me';

type AppRole = 'admin' | 'user';

type AppUser = User & {
  id: string;
  role: AppRole;
};

type RequestLike = {
  headers?: Record<string, string | string[] | undefined>;
};

const attempts = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 10;

function throttled(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.ts > WINDOW_MS) {
    attempts.set(key, { count: 1, ts: now });
    return false;
  }

  entry.count++;
  entry.ts = now;
  return entry.count > MAX_TRIES;
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function getRequestIp(req?: RequestLike): string {
  const xfwd = firstHeaderValue(req?.headers?.['x-forwarded-for']);
  const xreal = firstHeaderValue(req?.headers?.['x-real-ip']);
  return xfwd || xreal || 'unknown';
}

function getUserRole(user: User | undefined): AppRole {
  if (!user) return 'user';
  const maybe = user as Partial<AppUser>;
  return maybe.role === 'admin' ? 'admin' : 'user';
}

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },

  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
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
        const ip = getRequestIp(req as RequestLike);

        if (!credentials?.email || !credentials?.password) return null;
        if (throttled(ip)) return null;

        const userRecord =
          credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && ADMIN_HASH
            ? {
                id: 'admin-1',
                email: ADMIN_EMAIL,
                passwordHash: ADMIN_HASH,
                role: 'admin' as const,
              }
            : null;

        if (!userRecord) return null;

        const ok = await verifyPassword(credentials.password, userRecord.passwordHash);
        if (!ok) return null;

        const user: AppUser = {
          id: userRecord.id,
          email: userRecord.email,
          name: 'Admin',
          role: userRecord.role,
        };

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const nextToken = token as JWT & { userId?: string; role?: AppRole; email?: string };

      if (user) {
        nextToken.userId = typeof user.id === 'string' ? user.id : undefined;
        nextToken.role = getUserRole(user);
        if (user.email) nextToken.email = user.email;
      }

      return nextToken;
    },

    async session({ session, token }) {
      const nextSession = session as Session & {
        user?: Session['user'] & { id?: string; role?: AppRole };
      };
      const nextToken = token as JWT & { userId?: string; role?: AppRole; email?: string };

      if (nextSession.user) {
        nextSession.user.id = nextToken.userId;
        nextSession.user.role = nextToken.role || 'user';
        // Load latest name from DB when available (for profile updates)
        const email = nextToken.email ?? session?.user?.email;
        if (email && typeof email === 'string') {
          try {
            const { getUserByEmail } = await import('@/lib/db/users');
            const dbUser = (await getUserByEmail(email)) as { name?: string } | null;
            if (dbUser?.name != null) nextSession.user.name = dbUser.name;
          } catch {
            // ignore
          }
        }
      }

      return nextSession;
    },
  },

  debug: process.env.NODE_ENV !== 'production',
};
