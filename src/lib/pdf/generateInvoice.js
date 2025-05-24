import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateInvoicePDF({ order }) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const drawText = (text, x, y, size = 12) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) })
  }

  drawText('Facture', 50, height - 50, 18)
  drawText(`Commande #${order.id}`, 50, height - 80)
  drawText(`Client : ${order.customerName}`, 50, height - 100)
  drawText(`Email : ${order.email}`, 50, height - 115)

  let y = height - 150
  drawText('Produits :', 50, y)
  y -= 20

  order.items.forEach((item) => {
    drawText(`- ${item.name} x${item.quantity} — ${item.price} €`, 60, y)
    y -= 18
  })

  y -= 20
  drawText(`Total : ${order.total} €`, 50, y)

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
