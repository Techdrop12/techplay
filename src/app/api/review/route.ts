import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const data = await request.json()

  // TODO: validation & DB insertion
  return NextResponse.json({ success: true, message: 'Avis reçu' })
}
