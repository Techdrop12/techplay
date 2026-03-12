import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, message: 'Payload invalide' }, { status: 400 })
  }

  // Ici, on pourrait persister l'abonnement (web-push) en BDD.
  // On évite de logger le contenu brut pour ne pas exposer de données sensibles.

  return NextResponse.json({ success: true })
}
