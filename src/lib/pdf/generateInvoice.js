// ✅ /src/lib/pdf/generateInvoice.js (facture PDF bonus, utilise pdfkit)
import PDFDocument from 'pdfkit';

export function generateInvoice(order, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
  doc.fontSize(24).text('Facture TechPlay', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Commande: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`);
  doc.text(`Total: ${order.total} €`);
  // ...détails produits, client...
  doc.end();
  doc.pipe(res);
}
