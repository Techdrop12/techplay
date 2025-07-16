import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: Request) {
  const { email } = await req.json()

  await sendEmail({
    to: email,
    subject: 'Bienvenue chez TechPlay 👋',
    html: `<h1>Merci pour votre inscription !</h1><p>Nous sommes ravis de vous compter parmi nous.</p>`,
  })

  return NextResponse.json({ status: 'sent' })
}
