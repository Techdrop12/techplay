// src/app/api/faq/route.ts
import { NextRequest, NextResponse } from 'next/server';

type FAQEntry = { _id: string; question: string; answer: string };

const FAQ_FR: FAQEntry[] = [
  {
    _id: '1',
    question: 'Quels sont les délais de livraison ?',
    answer:
      'Livraison en 48 à 72 h ouvrées en France métropolitaine. Livraison offerte dès 49 € d’achat. Vous recevez un lien de suivi par email dès l’expédition.',
  },
  {
    _id: '2',
    question: 'Puis-je retourner un article ?',
    answer:
      'Oui. Retours gratuits sous 30 jours : contactez-nous via la page Contact pour obtenir une étiquette de retour. L’article doit être dans son emballage d’origine, non utilisé.',
  },
  {
    _id: '3',
    question: 'Le paiement est-il sécurisé ?',
    answer:
      'Oui. Tous les paiements passent par Stripe (carte bancaire, Apple Pay, Google Pay). Vos données sont cryptées et nous ne stockons pas vos coordonnées bancaires.',
  },
  {
    _id: '4',
    question: 'Comment suivre ma commande ?',
    answer:
      'Dès l’expédition, un email avec un lien de suivi colis vous est envoyé. Vous pouvez aussi consulter « Mes commandes » dans votre compte si vous êtes connecté.',
  },
  {
    _id: '5',
    question: 'Quelle garantie sur les produits ?',
    answer:
      'Nos produits bénéficient de la garantie légale de conformité (2 ans) et, selon les fabricants, d’une garantie constructeur. Consultez la fiche produit pour le détail.',
  },
  {
    _id: '6',
    question: 'Comment créer un compte ?',
    answer:
      'Cliquez sur l’icône compte en haut à droite, puis « Connexion ». Vous pouvez créer un compte avec votre email ; la commande est possible aussi sans compte (invité).',
  },
  {
    _id: '7',
    question: 'Livrez-vous en dehors de la France ?',
    answer:
      'Pour l’instant nous livrons en France métropolitaine. L’extension à d’autres pays est prévue : inscrivez-vous à la newsletter pour être informé.',
  },
  {
    _id: '8',
    question: 'Les packs sont-ils modifiables ?',
    answer:
      'Les packs sont proposés à prix avantageux en ensemble. Vous pouvez aussi acheter les articles séparément depuis la page Produits ou Catégories.',
  },
  {
    _id: '9',
    question: 'Comment contacter le support ?',
    answer:
      'Via la page « Support & contact » : formulaire et email. Nous répondons sous 24 à 48 h ouvrées. Pour une urgence commande, indiquez le numéro de commande.',
  },
];

const FAQ_EN: FAQEntry[] = [
  {
    _id: '1',
    question: 'What are the delivery times?',
    answer:
      'Delivery within 48 to 72 business hours in mainland France. Free shipping from €49. You will receive a tracking link by email as soon as your order ships.',
  },
  {
    _id: '2',
    question: 'Can I return an item?',
    answer:
      'Yes. Free returns within 30 days: contact us via the Contact page to get a return label. The item must be in its original packaging and unused.',
  },
  {
    _id: '3',
    question: 'Is payment secure?',
    answer:
      'Yes. All payments are processed by Stripe (card, Apple Pay, Google Pay). Your data is encrypted and we do not store your payment details.',
  },
  {
    _id: '4',
    question: 'How do I track my order?',
    answer:
      'As soon as your order ships, we send you an email with a tracking link. You can also check "My orders" in your account if you are logged in.',
  },
  {
    _id: '5',
    question: 'What warranty do products have?',
    answer:
      'Our products come with the legal conformity warranty (2 years) and, depending on the manufacturer, a manufacturer warranty. See the product page for details.',
  },
  {
    _id: '6',
    question: 'How do I create an account?',
    answer:
      'Click the account icon at the top right, then "Login". You can create an account with your email; you can also checkout as a guest without an account.',
  },
  {
    _id: '7',
    question: 'Do you deliver outside France?',
    answer:
      'We currently deliver to mainland France only. Expansion to other countries is planned: sign up to our newsletter to be notified.',
  },
  {
    _id: '8',
    question: 'Can I customize the packs?',
    answer:
      'Packs are offered at a bundle price. You can also buy items individually from the Products or Categories pages.',
  },
  {
    _id: '9',
    question: 'How do I contact support?',
    answer:
      'Via the "Support & contact" page: form and email. We reply within 24 to 48 business hours. For order-related urgency, please include your order number.',
  },
];

function getLocale(request: NextRequest): 'fr' | 'en' {
  const url = new URL(request.url);
  const param = url.searchParams.get('locale')?.toLowerCase();
  if (param === 'en' || param === 'fr') return param;
  const accept = request.headers.get('accept-language') ?? '';
  if (accept.startsWith('en')) return 'en';
  return 'fr';
}

export async function GET(request: NextRequest) {
  const locale = getLocale(request);
  const faqs = locale === 'en' ? FAQ_EN : FAQ_FR;
  return NextResponse.json(faqs);
}
