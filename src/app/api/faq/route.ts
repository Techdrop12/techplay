// src/app/api/faq/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const faqs = [
    { _id: '1', question: 'Quels sont les délais de livraison ?', answer: 'Livraison en 48 à 72 h ouvrées. Livraison offerte dès 49 € d’achat.' },
    { _id: '2', question: 'Puis-je retourner un article ?', answer: 'Oui. Retours gratuits sous 30 jours : contactez-nous pour obtenir l’étiquette de retour.' },
    { _id: '3', question: 'Le paiement est-il sécurisé ?', answer: 'Oui. Paiement par Stripe (CB, Apple Pay, Google Pay). Données cryptées.' },
  ]
  return NextResponse.json(faqs)
}
