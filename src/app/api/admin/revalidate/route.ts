import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { serverEnv } from '@/env.server';
import { getErrorMessage } from '@/lib/errors';
import { verifySecret } from '@/lib/secureCompare';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const expected = serverEnv.ADMIN_REVALIDATE_TOKEN ?? process.env.ADMIN_REVALIDATE_TOKEN;

  if (!verifySecret(token, expected)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const tag = url.searchParams.get('tag');
  const path = url.searchParams.get('path');

  if (!tag && !path) {
    return NextResponse.json({ ok: false, error: 'missing tag or path' }, { status: 400 });
  }

  try {
    if (tag) revalidateTag(tag, 'max');
    if (path) revalidatePath(path);

    return NextResponse.json({ ok: true, tag, path });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) || 'error' },
      { status: 500 }
    );
  }
}
