import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, cart } = await req.json()

  // Ici tu pourrais connecter Brevo (Sendinblue) ou un autre outil
  console.log(`📧 Relance d’abandon de panier envoyée à ${email}`, cart)

  return NextResponse.json({ success: true })
}
