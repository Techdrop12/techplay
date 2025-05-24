import dbConnect from '@/lib/dbConnect'
import mongoose from 'mongoose'

const ABTestSchema = new mongoose.Schema(
  {
    variant: { type: String, enum: ['A', 'B'], required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const ABTest = mongoose.models.ABTest || mongoose.model('ABTest', ABTestSchema)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect()

      const { variant } = req.body
      if (!['A', 'B'].includes(variant)) {
        return res.status(400).json({ message: 'Variant invalide' })
      }

      await ABTest.create({ variant })

      return res.status(201).json({ success: true })
    } catch (err) {
      console.error('Erreur tracking A/B :', err)
      return res.status(500).json({ message: 'Erreur serveur' })
    }
  }

  res.status(405).end()
}
