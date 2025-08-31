// src/app/api/faq/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const faqs = [
    { _id: '1', question: 'Quels sont les délais de livraison ?', answer: 'La majorité des commandes sont livrées en 48 à 72h ouvrées.' },
    { _id: '2', question: 'Puis-je retourner un article ?', answer: 'Oui, vous avez 14 jours pour changer d’avis et demander un remboursement.' },
    { _id: '3', question: 'Les paiements sont-ils sécurisés ?', answer: 'Oui, les paiements sont 100% sécurisés via Stripe ou PayPal.' },
  ]
  return NextResponse.json(faqs)
}
