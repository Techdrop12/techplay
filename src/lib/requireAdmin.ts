import { NextResponse } from 'next/server'

import { getSession, isAdmin } from '@/lib/auth'

export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdmin()
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function getSessionOr401() {
  const session = await getSession()
  if (!session?.user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  }
  const ok = await isAdmin()
  if (!ok) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), session: null }
  }
  return { response: null, session }
}
