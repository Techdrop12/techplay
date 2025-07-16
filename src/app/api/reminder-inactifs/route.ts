import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()

  // Simule une relance (à automatiser avec Brevo ou autre)
  console.log(`Relance utilisateur inactif : ${email}`)

  return NextResponse.json({ status: 'ok', message: 'Relance envoyée' })
}
