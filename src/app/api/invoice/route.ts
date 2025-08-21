// src/app/api/invoice/route.ts
import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export const runtime = 'nodejs'          // pdfkit nécessite Node
export const dynamic = 'force-dynamic'   // optionnel: évite la mise en cache

type LineItem = { name: string; quantity: number; price: number }
type Payload = {
  orderId: string | number
  customerName: string
  items: LineItem[]
  total: number
}

export async function POST(req: Request) {
  const { orderId, customerName, items = [], total }: Payload = await req.json()

  const doc = new PDFDocument({ size: 'A4', margin: 48 })
  const chunks: Buffer[] = []

  doc.on('data', (chunk) => chunks.push(chunk as Buffer))

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.once('end', () => resolve(Buffer.concat(chunks)))
    doc.once('error', reject)
  })

  // ---- Contenu PDF ----
  doc.fontSize(18).text(`Facture #${orderId}`, { align: 'center' })
  doc.moveDown()
  doc.text(`Client : ${customerName}`)
  doc.moveDown()

  items.forEach((item) => {
    doc.text(`${item.name} x${item.quantity} – ${item.price}€`)
  })

  doc.moveDown()
  doc.text(`Total : ${total} €`, { align: 'right' })

  doc.end()
  // ---------------------

  const pdfBuffer = await done
  // BodyInit accepte un BufferSource → Uint8Array convient parfaitement
  const body = new Uint8Array(pdfBuffer)

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="facture.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}
