import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  // Tu peux enrichir ici selon ton modèle User (ex: MongoDB)
  res.status(200).json({
    name: session.user.name,
    email: session.user.email,
  })
}
