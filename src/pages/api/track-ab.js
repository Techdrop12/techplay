import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Schéma A/B test – permet de suivre les interactions selon le variant
const ABTestSchema = new mongoose.Schema(
  {
    variant: { type: String, enum: ['A', 'B', 'C'], required: true },
    event: { type: String, default: 'view' }, // view, add_to_cart, checkout...
    productId: { type: String, default: null },
    userId: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Utilise le modèle existant s’il est déjà compilé
const ABTest = mongoose.models.ABTest || mongoose.model('ABTest', ABTestSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await dbConnect();

    const { variant, event = 'view', productId = null, userId = null } = req.body;

    if (!['A', 'B', 'C'].includes(variant)) {
      return res.status(400).json({ message: 'Variant invalide' });
    }

    await ABTest.create({ variant, event, productId, userId });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('❌ Erreur tracking A/B :', err);
    return res.status(500).json({ message: 'Erreur serveur A/B tracking' });
  }
}
