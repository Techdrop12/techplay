import { generateInvoicePDF } from '@/lib/pdf/generateInvoice'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const order = req.body
  if (!order || !order.items || !order.total) {
    return res.status(400).json({ error: 'Invalid order data' })
  }

  try {
    const pdfBytes = await generateInvoicePDF({ order })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=facture-${order.id}.pdf`)
    res.send(pdfBytes)
  } catch (err) {
    res.status(500).json({ error: 'PDF generation failed' })
  }
}
