import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const subscription = await req.json()

  // À stocker en BDD
  console.log('📲 Nouvelle souscription aux notifications push', subscription)

  return NextResponse.json({ success: true })
}
