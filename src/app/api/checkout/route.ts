import { NextResponse } from 'next/server'
// import Stripe from 'stripe' // à intégrer selon clé privée

export async function POST(request: Request) {
  const data = await request.json()

  // Simule un checkout (intégrer Stripe ici)
  return NextResponse.json({ sessionId: 'test_checkout_session_id' })
}
