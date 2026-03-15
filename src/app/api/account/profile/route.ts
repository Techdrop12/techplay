import { NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'
import { updateUserByEmail } from '@/lib/db/users'

export async function PATCH(req: Request) {
  const session = await getSession()
  const email = session?.user?.email?.trim()
  if (!email) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const name = body?.name != null ? String(body.name).trim() : undefined
  if (name === undefined) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
  }

  try {
    const updated = await updateUserByEmail(email, { name })
    if (!updated) {
      return NextResponse.json(
        { error: 'Compte introuvable en base. La mise à jour du profil est disponible pour les comptes enregistrés.' },
        { status: 404 }
      )
    }
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[account/profile] PATCH', e)
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }
}
