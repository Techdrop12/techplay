export default function handler(req, res) {
  const { productId } = req.query

  // Exemple de FAQ en dur (tu pourras lier à MongoDB plus tard)
  const faqData = {
    '1': [
      { question: "Quel est le délai de livraison ?", answer: "3 à 5 jours ouvrés." },
      { question: "Le produit est-il garanti ?", answer: "Oui, satisfait ou remboursé 30 jours." }
    ],
    '2': [
      { question: "Ce produit est-il compatible avec Android ?", answer: "Oui, 100% compatible." }
    ]
  }

  const faq = faqData[productId] || [
    { question: "Livraison gratuite ?", answer: "Oui dès 50€ d'achat." },
    { question: "Puis-je retourner l'article ?", answer: "Oui dans les 14 jours." }
  ]

  res.status(200).json(faq)
}
