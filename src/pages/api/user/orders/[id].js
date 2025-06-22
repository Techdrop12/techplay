import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { id } = req.query;

  await dbConnect();

  try {
    // On filtre la commande en vérifiant que l’email utilisateur correspond à la session
    const order = await Order.findOne({ _id: id, 'user.email': session.user.email }).lean();

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Erreur API get order:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
