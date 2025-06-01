// src/pages/api/notifications/save-token.js

let tokenStore = new Set()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ message: 'Token manquant' })
    }

    // Stocke en mémoire (optionnel : à remplacer par une base de données dans le futur)
    tokenStore.add(token)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ Erreur enregistrement token Firebase :', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// Permet d'accéder à tous les tokens enregistrés
export function getAllTokens() {
  return Array.from(tokenStore)
}
