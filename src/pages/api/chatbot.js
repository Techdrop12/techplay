export default function handler(req, res) {
  const { message } = req.body

  let reply = "Je n'ai pas compris. Pouvez-vous reformuler ?"

  if (/livraison/i.test(message)) reply = "La livraison prend généralement 2 à 4 jours ouvrés."
  else if (/retour/i.test(message)) reply = "Les retours sont possibles sous 14 jours."
  else if (/produit/i.test(message)) reply = "Nos produits sont garantis 2 ans."
  else if (/contact/i.test(message)) reply = "Vous pouvez nous contacter via le formulaire en bas de page."

  res.status(200).json({ reply })
}
