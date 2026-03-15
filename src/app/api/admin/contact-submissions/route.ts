import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import ContactSubmission from '@/models/ContactSubmission'
import { requireAdmin } from '@/lib/requireAdmin'

function toPlain(obj: unknown) {
  return JSON.parse(JSON.stringify(obj))
}

export async function GET() {
  const err = await requireAdmin()
  if (err) return err

  try {
    await connectToDatabase()
    const docs = await ContactSubmission.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
      .exec()
    return NextResponse.json(toPlain(docs))
  } catch (e) {
    console.error('[admin/contact-submissions]', e)
    return NextResponse.json(
      { error: 'Erreur chargement messages' },
      { status: 500 }
    )
  }
}
