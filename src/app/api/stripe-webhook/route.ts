import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  await req.text()
  return NextResponse.json({ received: true }, { status: 200 })
}