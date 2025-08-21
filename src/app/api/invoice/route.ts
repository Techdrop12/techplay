// src/app/api/invoice/route.ts
import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export const runtime = 'nodejs' // pdfkit needs Node, not Edge

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const orderId = body?.orderId ?? '0000'
  const customerName = String(body?.customerName ?? 'Client')
  const items: any[] = Array.isArray(body?.items) ? body.items : []
  const total = Number(body?.total ?? 0)

  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true })
  const chunks: Buffer[] = []

  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  doc.fontSize(18).text(`Facture #${orderId}`, { align: 'center' })
  doc.moveDown()
  doc.text(`Client : ${customerName}`)
  doc.moveDown()

  for (const item of items) {
    const name = String(item?.name ?? 'Article')
    const qty = Number(item?.quantity ?? 1)
    const price = Number(item?.price ?? 0)
    doc.text(`${name} x${qty} – ${price.toFixed(2)}€`)
  }

  doc.moveDown()
  doc.text(`Total : ${total.toFixed(2)} €`, { align: 'right' })
  doc.end()

  // Wait for the PDF to finish
  await new Promise<void>((resolve) => doc.on('end', resolve))

  // Web ReadableStream from the collected Node Buffers (no TS complaints)
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const b of chunks) controller.enqueue(new Uint8Array(b))
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="facture.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}
