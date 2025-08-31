import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simule la synchro fournisseur
  const stockData = [
    { id: 1, dispo: true, stock: 10 },
    { id: 2, dispo: false, stock: 0 },
  ]

  res.status(200).json(stockData)
}
