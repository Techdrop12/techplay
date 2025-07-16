import { NextResponse } from 'next/server'

export async function GET() {
  // À compléter avec logique OpenAI + base de données
  console.log('📝 Cron : publication automatique de blog (simulé)')
  return NextResponse.json({ success: true, message: 'Article publié' })
}
