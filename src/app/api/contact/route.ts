import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import ContactSubmission from '@/models/ContactSubmission'
import { contactSchema } from '@/lib/zodSchemas'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors
    const message = first?.message?.[0] ?? first?.email?.[0] ?? first?.name?.[0] ?? 'Données invalides'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { name, email, message, consent } = parsed.data

  try {
    await connectToDatabase()
    const doc = await ContactSubmission.create({
      name: name?.trim() || undefined,
      email: email.trim().toLowerCase(),
      message: message.trim(),
      consent: Boolean(consent),
    })
    return NextResponse.json(toPlain({ ok: true, id: doc._id }))
  } catch (e) {
    console.error('[contact] POST', e)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi. Réessayez plus tard.' },
      { status: 500 }
    )
  }
}
