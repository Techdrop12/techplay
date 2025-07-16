import { NextResponse } from 'next/server'
import { getUserScore } from '@/lib/gamification'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const score = getUserScore(params.id)
  return NextResponse.json({ score })
}
