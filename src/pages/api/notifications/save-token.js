// ✅ src/pages/api/notifications/save-token.js

// 📦 Stockage en mémoire (Set pour éviter les doublons)
let tokenStore = new Set()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' })
  }

  try {
    const { token } = req.body

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token invalide ou manquant' })
    }

    tokenStore.add(token)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ Erreur enregistrement token Firebase :', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}

// ✅ Récupérer tous les tokens enregistrés (format tableau)
export function getAllTokens() {
  return Array.from(tokenStore)
}

// ✅ Supprimer un token (ex: token expiré ou invalide)
export function deleteToken(token) {
  tokenStore.delete(token)
}
