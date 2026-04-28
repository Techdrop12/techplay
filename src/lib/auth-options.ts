// src/lib/auth-options.ts
// ✅ NextAuth options (Credentials) ultra robustes :
// - vérif bcrypt, rate-limit léger, rôle, JWT, pages custom, cookies secure
// - fallback ADMIN_* via env pour un compte admin local

import CredentialsProvider from 'next-auth/providers/credentials';

import { verifyPassword } from './bcrypt';
import { warn } from './logger';

import type { NextAuthOptions, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

import { serverEnv } from '@/env.server';

const ADMIN_EMAIL = (serverEnv.ADMIN_EMAIL || 'admin@techplay.local').trim().toLowerCase();
const ADMIN_HASH = serverEnv.ADMIN_PASSWORD_HASH?.trim();
/** Dev uniquement : si pas de hash bcrypt, mot de passe en clair (jamais en prod). */
const ADMIN_PASSWORD_DEV = serverEnv.ADMIN_PASSWORD?.trim();
const AUTH_SECRET = serverEnv.NEXTAUTH_SECRET || serverEnv.AUTH_SECRET || 'change-me';

export type AppRole = 'admin' | 'ops' | 'support' | 'content' | 'read_only' | 'user';

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
  const role = maybe.role;
  const allowed: AppRole[] = ['admin', 'ops', 'support', 'content', 'read_only', 'user'];
  if (role && allowed.includes(role as AppRole)) {
    return role as AppRole;
  }
  return 'user';
}

/** Cookies `__Secure-*` + `secure: true` ne fonctionnent pas en http://localhost. */
function shouldUseSecureAuthCookies(): boolean {
  if (process.env.VERCEL === '1') return true;
  const url = process.env.NEXTAUTH_URL || process.env.AUTH_URL || '';
  return typeof url === 'string' && url.startsWith('https://');
}

const secureCookies = shouldUseSecureAuthCookies();

async function authorizeAdminCredentials(
  credentials: Record<'email' | 'password', string> | undefined,
  req?: RequestLike
): Promise<AppUser | null> {
  const ip = getRequestIp(req);
  if (!credentials?.email || !credentials?.password) return null;
  if (throttled(`admin:${ip}`)) {
    warn('[auth] Admin login throttled', { ip });
    return null;
  }

  const email = credentials.email.trim().toLowerCase();
  if (email !== ADMIN_EMAIL) {
    warn('[auth] Admin login failed — unknown email', { ip, email });
    return null;
  }

  let passwordOk = false;

  if (ADMIN_HASH) {
    passwordOk = await verifyPassword(credentials.password, ADMIN_HASH);
  } else if (process.env.NODE_ENV !== 'production' && ADMIN_PASSWORD_DEV) {
    passwordOk = credentials.password === ADMIN_PASSWORD_DEV;
  } else {
    return null;
  }

  if (!passwordOk) {
    warn('[auth] Admin login failed — wrong password', { ip, email });
    return null;
  }

  const sessionEmail =
    (serverEnv.ADMIN_EMAIL && serverEnv.ADMIN_EMAIL.trim()) || 'admin@techplay.local';

  return {
    id: 'admin-1',
    email: sessionEmail,
    name: 'Admin',
    role: 'admin',
  };
}

async function authorizeCustomerCredentials(
  credentials: Record<'email' | 'password', string> | undefined,
  req?: RequestLike
): Promise<AppUser | null> {
  const ip = getRequestIp(req);
  if (!credentials?.email || !credentials?.password) return null;
  if (throttled(`cust:${ip}`)) {
    warn('[auth] Customer login throttled', { ip });
    return null;
  }

  const email = credentials.email.trim().toLowerCase();
  if (!email) return null;
  if (email === ADMIN_EMAIL) return null;

  const mongoUri = serverEnv.MONGODB_URI?.trim();
  if (!mongoUri) return null;

  try {
    const dbConnect = (await import('@/lib/dbConnect')).default;
    const User = (await import('@/models/User')).default;
    await dbConnect();
    const doc = await User.findOne({ email }).select('+password').lean();
    if (!doc) return null;

    const rec = doc as {
      password?: string;
      email: string;
      name?: string;
      _id: { toString(): string };
      isAdmin?: boolean;
    };

    if (!rec.password) return null;
    if (rec.isAdmin) return null;

    const ok = await verifyPassword(credentials.password, rec.password);
    if (!ok) {
      warn('[auth] Customer login failed — wrong password', { ip, email });
      return null;
    }

    return {
      id: rec._id.toString(),
      email: rec.email,
      name: rec.name ?? '',
      role: 'user',
    };
  } catch {
    return null;
  }
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
      name: secureCookies ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: secureCookies,
      },
    },
  },

  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Administration',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        return authorizeAdminCredentials(
          credentials as Record<'email' | 'password', string> | undefined,
          req as RequestLike
        );
      },
    }),
    CredentialsProvider({
      id: 'customer-credentials',
      name: 'Espace client',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        return authorizeCustomerCredentials(
          credentials as Record<'email' | 'password', string> | undefined,
          req as RequestLike
        );
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
