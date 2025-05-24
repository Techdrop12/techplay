let tokenStore = new Set()

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token manquant' })

  tokenStore.add(token)
  res.status(200).json({ success: true })
}

export function getAllTokens() {
  return Array.from(tokenStore)
}
