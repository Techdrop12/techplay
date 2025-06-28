// ✅ /src/pages/api/invoice.js (génération de facture PDF à la demande)
import { generateInvoice } from '@/lib/pdf/generateInvoice';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { order } = req.body;
    if (!order) return res.status(400).json({ error: 'Order required' });
    const pdfBuffer = await generateInvoice(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.status(200).send(pdfBuffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
