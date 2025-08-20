// src/app/api/email/welcome/route.ts
import { NextResponse } from 'next/server'
import { sendEmailRaw as sendEmail } from '@/lib/email' // <-- corrige l'import

// On force l’exécution côté Node (utile si ton lib email utilise Node/nodemailer)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string }
    const email = typeof body?.email === 'string' ? body.email.trim() : ''

    // petite validation rapide
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValid) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    await sendEmail({
      to: email,
      subject: 'Bienvenue chez TechPlay 👋',
      html: `<h1>Merci pour votre inscription !</h1><p>Nous sommes ravis de vous compter parmi nous.</p>`,
    })

    return NextResponse.json({ status: 'sent' })
  } catch (err) {
    console.error('[welcome email] error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
