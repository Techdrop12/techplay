import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { createUser, getUserByEmail } from '@/lib/db/users';
import { createRateLimiter, ipFromRequest } from '@/lib/rateLimit';

const registerLimiter = createRateLimiter({ id: 'register', limit: 5, intervalMs: 60_000 });

export async function POST(req: NextRequest) {
  const ip = ipFromRequest(req);
  const rl = registerLimiter.check(ip);
  if (!rl.ok) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429, headers: registerLimiter.headers(rl) });
  }
  try {
    const { name, email, password } = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const emailClean = email?.trim().toLowerCase();
    const nameClean = name?.trim();
    const passwordClean = password?.trim();

    if (!emailClean || !passwordClean) {
      return NextResponse.json({ error: 'email_required' }, { status: 400 });
    }
    if (passwordClean.length < 8) {
      return NextResponse.json({ error: 'weak_password' }, { status: 400 });
    }

    const existing = await getUserByEmail(emailClean);
    if (existing) {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    }

    const hash = await bcrypt.hash(passwordClean, 12);
    await createUser({ name: nameClean, email: emailClean, password: hash });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
