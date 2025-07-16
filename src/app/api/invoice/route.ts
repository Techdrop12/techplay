import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function POST(req: Request) {
  const { orderId, customerName, items, total } = await req.json()

  const doc = new PDFDocument()
  const chunks: any[] = []

  doc.on('data', (chunk) => chunks.push(chunk))
  doc.on('end', () => {})

  doc.fontSize(18).text(`Facture #${orderId}`, { align: 'center' })
  doc.moveDown()
  doc.text(`Client : ${customerName}`)
  doc.moveDown()

  items.forEach((item: any) => {
    doc.text(`${item.name} x${item.quantity} – ${item.price}€`)
  })

  doc.moveDown()
  doc.text(`Total : ${total} €`, { align: 'right' })

  doc.end()

  const buffer = await new Promise<Buffer>((resolve) =>
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  )

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="facture.pdf"',
    },
  })
}
