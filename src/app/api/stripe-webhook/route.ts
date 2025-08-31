import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const payload = await req.text()
  // TODO: valider signature + traiter événement
  return NextResponse.json({ received: true })
}
