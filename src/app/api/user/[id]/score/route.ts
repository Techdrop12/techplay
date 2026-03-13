import { NextResponse } from 'next/server'

import { getUserScore } from '@/lib/gamification'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const score = getUserScore(id)
  return NextResponse.json({ score })
}
