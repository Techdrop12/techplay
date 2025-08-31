import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const form = await req.formData()
  const url = String(form.get('url') || '')
  const text = String(form.get('text') || '')
  const title = String(form.get('title') || '')
  // Prends d’abord l’URL partagée, sinon le texte/titre
  const q = encodeURIComponent(url || text || title || '')
  return NextResponse.redirect(new URL(`/products?q=${q}`, req.url))
}
