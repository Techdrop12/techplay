// src/app/api/user/[id]/score/route.ts
import { NextResponse } from 'next/server'
import { getUserScore } from '@/lib/gamification'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // getUserScore ne prend pas d'argument (il lit la session/DB en interne)
  const score = await getUserScore()

  // On renvoie aussi l'id de la route pour la clarté côté client
  return NextResponse.json({ userId: params.id, score })
}
