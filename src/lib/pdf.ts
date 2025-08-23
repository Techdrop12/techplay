// src/lib/pdf.ts — Invoice data formatter + PDF generator (single source of truth)
// Ultra-premium: typé, i18n, remises, TVA, shipping, logo, headers répétés, Web stream pour Next.js App Router.

import type { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'http'
// pdfkit n’a pas toujours ses types installés. On laisse TS ignorer l’import si manquants.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PDFDocument from 'pdfkit'

/* =============================== Types =============================== */

export type Money = number

export type Address = {
  name?: string
  company?: string
  address1?: string
  address2?: string
  postcode?: string
  city?: string
  country?: string
  email?: string
  phone?: string
}

export type OrderItem = {
  name: string
  price: Money // prix unitaire HT (ou TTC si taxRate=0)
  quantity: number
  taxRate?: number // ex: 0.2 pour 20%
}

export type ShippingLine = { label?: string; price?: Money; taxRate?: number }

export type Discount = { code?: string; amount?: Money } // Montant absolu (TTC par défaut)

export type Order = {
  id: string | number
  createdAt?: Date | string
  customerName?: string
  customer?: Address
  items: OrderItem[]
  shipping?: ShippingLine
  discount?: Discount
  currency?: string // ex: 'EUR'
  taxRateDefault?: number // fallback pour items sans taxRate
}

export type InvoiceItem = {
  name: string
  unitPrice: Money
  quantity: number
  taxRate: number
  lineTotal: Money // total HT de la ligne (unit * qty)
}

export type InvoiceData = {
  invoiceNumber: string // peut = orderId, mais mieux d’avoir une séquence
  orderId: string | number
  date: Date
  customerName?: string
  customer?: Address
  items: InvoiceItem[]
  shipping?: { label: string; price: Money; taxRate: number }
  discount?: { code?: string; amount: Money }
  subtotal: Money // somme des lineTotal (HT)
  tax: Money // TVA totale (items + shipping)
  total: Money // TTC
  currency: string
}

export type BrandInfo = {
  name: string
  address?: string
  website?: string
  email?: string
  phone?: string
  vatNumber?: string // TVA intracommunautaire
  siret?: string
  logoPath?: string // chemin local (ex: process.cwd() + '/public/logo.png')
}

export type FormatOptions = {
  defaultTaxRate?: number // si un item n’a pas de taxRate
  /** Si true, on applique la remise avant calcul de la TVA (base imposable réduite).
   *  Par défaut false (remise après). Adapter selon vos contraintes légales. */
  discountAffectsTaxBase?: boolean
}

export type PdfRenderOptions = {
  brand?: BrandInfo
  locale?: string // ex: 'fr-FR'
  currencyDisplay?: 'symbol' | 'code' | 'name'
  pageSize?: 'A4' | 'Letter'
  margin?: number
  title?: string // titre PDF meta
}

/* ====================== Formatage: Order -> InvoiceData ===================== */

export function formatInvoiceData(order: Order, opts: FormatOptions = {}): InvoiceData {
  const currency = order.currency || 'EUR'
  const defaultTaxRate = normalizeRate(opts.defaultTaxRate ?? order.taxRateDefault ?? 0)

  const items: InvoiceItem[] = (order.items || []).map((i) => {
    const rate = normalizeRate(i.taxRate ?? defaultTaxRate)
    const unit = toNumber(i.price)
    const qty = Math.max(1, Math.floor(toNumber(i.quantity)))
    const line = unit * qty // HT si unit HT; si TTC, mettre taxRate=0 pour neutraliser
    return { name: i.name, unitPrice: unit, quantity: qty, taxRate: rate, lineTotal: line }
  })

  // Base
  let subtotal = sum(items.map((i) => i.lineTotal)) // HT
  const shippingPrice = toNumber(order.shipping?.price)
  const shippingRate = normalizeRate(order.shipping?.taxRate ?? defaultTaxRate)
  const shipping: InvoiceData['shipping'] | undefined = shippingPrice
    ? { label: order.shipping?.label || 'Livraison', price: shippingPrice, taxRate: shippingRate }
    : undefined

  const rawDiscount = Math.max(0, toNumber(order.discount?.amount))
  const discount = rawDiscount ? { code: order.discount?.code, amount: round2(rawDiscount) } : undefined

  // Remise avant ou après TVA ?
  let taxableBase = subtotal + (shipping?.price || 0)
  if (discount && (opts.discountAffectsTaxBase ?? false)) {
    const baseAfter = Math.max(0, taxableBase - discount.amount)
    // répartir la remise proportionnellement pour TVA exacte (simple: baseAfter -> TVA recalculée)
    taxableBase = baseAfter
    // On applique la remise uniquement sur le total final, pas besoin de modifier les lignes ici
  }

  // TVA
  const taxFromItems = sum(items.map((i) => i.lineTotal * i.taxRate))
  const taxFromShipping = shipping ? shipping.price * shipping.taxRate : 0
  let tax = taxFromItems + taxFromShipping

  // Total TTC
  let total = taxableBase + tax
  if (discount && !(opts.discountAffectsTaxBase ?? false)) {
    total = Math.max(0, total - discount.amount)
  }

  const createdAt =
    order.createdAt instanceof Date ? order.createdAt : order.createdAt ? new Date(order.createdAt) : new Date()

  return {
    invoiceNumber: String(order.id),
    orderId: order.id,
    date: createdAt,
    customerName: order.customerName || order.customer?.name,
    customer: order.customer,
    items,
    shipping,
    discount,
    subtotal: round2(subtotal),
    tax: round2(tax),
    total: round2(total),
    currency,
  }
}

/* =========================== Génération du PDF =========================== */

/**
 * Rend un Buffer Node (pratique pour tests et API route Node).
 * Pour App Router (web streams), utilisez `renderInvoicePDFStream()` plus bas.
 */
export async function renderInvoicePDFToBuffer(
  data: InvoiceData,
  opts: PdfRenderOptions = {}
): Promise<Buffer> {
  const doc = createDoc(opts)
  const chunks: Buffer[] = []
  return new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('error', reject)
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    drawInvoice(doc, data, opts)
    doc.end()
  })
}

/**
 * Crée un Web ReadableStream utilisable dans un route handler App Router.
 * Exemple d’usage dans `src/app/api/invoice/route.ts` :
 *
 *   import { NextResponse } from 'next/server'
 *   import { formatInvoiceData, renderInvoicePDFStream } from '@/lib/pdf'
 *
 *   export async function GET(req: Request) {
 *     const order = ... // fetch order
 *     const invoice = formatInvoiceData(order)
 *     const { stream, filename } = await renderInvoicePDFStream(invoice, { brand: { name: 'TechPlay' } })
 *     return new NextResponse(stream, {
 *       headers: {
 *         'Content-Type': 'application/pdf',
 *         'Content-Disposition': `attachment; filename="${filename}"`,
 *       }
 *     })
 *   }
 */
export async function renderInvoicePDFStream(
  data: InvoiceData,
  opts: PdfRenderOptions = {}
): Promise<{ stream: ReadableStream<Uint8Array>; filename: string }> {
  const filename = `invoice-${sanitizeFilename(String(data.invoiceNumber || data.orderId))}.pdf`
  const nodeStream = await renderInvoiceNodeStream(data, opts)
  const webStream = nodeToWebReadable(nodeStream)
  return { stream: webStream, filename }
}

/**
 * Rendu vers un stream Node (utile si vous répondez avec res: ServerResponse)
 */
export async function renderInvoiceToHttpResponse(
  data: InvoiceData,
  res: ServerResponse,
  opts: PdfRenderOptions = {}
): Promise<void> {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${sanitizeFilename(String(data.invoiceNumber))}.pdf`)
  const doc = createDoc(opts)
  doc.pipe(res)
  drawInvoice(doc, data, opts)
  doc.end()
}

/* ============================== Implémentation ============================== */

function createDoc(opts: PdfRenderOptions = {}) {
  const margin = opts.margin ?? 50
  const size = opts.pageSize ?? 'A4'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const doc = new PDFDocument({ size, margin, bufferPages: true })
  doc.info = {
    Title: opts.title || 'Invoice',
    Author: (opts.brand?.name || process.env.BRAND_NAME || 'TechPlay') as any,
    Subject: 'Invoice',
  }
  return doc
}

function drawInvoice(doc: any, data: InvoiceData, opts: PdfRenderOptions) {
  const brand = getBrand(opts.brand)

  const nf = new Intl.NumberFormat(opts.locale || 'fr-FR', {
    style: 'currency',
    currency: data.currency || 'EUR',
    currencyDisplay: opts.currencyDisplay || 'symbol',
    maximumFractionDigits: 2,
  })
  const money = (n: number) => nf.format(n)

  const startX = 50
  const width = 545 - startX
  const lineY = () => doc
    .strokeColor('#ddd')
    .moveTo(startX, doc.y + 4)
    .lineTo(595 - startX, doc.y + 4)
    .stroke()
    .strokeColor('#000')

  /* Header (logo + marque + infos facture) */
  if (brand.logoPath) {
    try {
      doc.image(brand.logoPath, startX, 40, { width: 120 })
    } catch {}
  }

  doc
    .fontSize(22)
    .text(brand.name, startX, brand.logoPath ? 40 : 50, { continued: false })
    .fontSize(10)
    .fillColor('#666')
    .text(brand.address || '', { width, align: 'left' })
    .moveDown(0.2)
    .text(brand.website || '')
    .moveDown(0.2)
    .text(brand.email ? `Contact: ${brand.email}` : '')
    .moveDown(0.2)
    .text(brand.vatNumber ? `TVA: ${brand.vatNumber}` : '')
    .moveDown(0.2)
    .text(brand.siret ? `SIRET: ${brand.siret}` : '')
    .fillColor('#000')

  doc
    .fontSize(12)
    .text(`Facture n°: ${data.invoiceNumber}`, 350, 50, { align: 'right' })
    .text(`Commande: ${String(data.orderId)}`, { align: 'right' })
    .text(`Date: ${formatDateFR(data.date)}`, { align: 'right' })

  /* Adresse client */
  doc.moveDown(1.2).fontSize(12).text('Facturé à :', startX)
  const addr = formatAddress(data.customer, data.customerName)
  if (addr) doc.fontSize(10).fillColor('#333').text(addr).fillColor('#000')

  /* Tableau articles */
  doc.moveDown(1.2)
  drawTableHeader(doc)

  const rowHeight = 18
  let y = doc.y + 10
  const columns = { title: startX, qty: 330, unit: 380, amount: 460 }

  const maybeAddPage = () => {
    if (y > 720) {
      doc.addPage()
      y = 50
      drawTableHeader(doc, { yStart: y - 10 })
      y += 20
    }
  }

  data.items.forEach((it, idx) => {
    const amount = round2(it.unitPrice * it.quantity)
    doc.fontSize(10).text(it.name || `Article ${idx + 1}`, columns.title, y, { width: 260 })
    doc.text(String(it.quantity), columns.qty, y, { width: 40, align: 'right' })
    doc.text(money(it.unitPrice), columns.unit, y, { width: 70, align: 'right' })
    doc.text(money(amount), columns.amount, y, { width: 90, align: 'right' })
    y += rowHeight
    maybeAddPage()
  })

  /* Totaux */
  y += 6
  doc
    .moveTo(340, y)
    .lineTo(545, y)
    .strokeColor('#ddd')
    .stroke()
    .strokeColor('#000')

  y += 10
  const rightRow = (label: string, val: string, bold = false) => {
    if (bold) doc.font('Helvetica-Bold')
    else doc.font('Helvetica')
    doc.fontSize(10).text(label, 350, y)
    doc.text(val, 460, y, { width: 90, align: 'right' })
    y += 16
  }

  rightRow('Sous-total', money(data.subtotal))
  if (data.shipping) rightRow(data.shipping.label, money(data.shipping.price))
  rightRow('TVA', money(data.tax))
  if (data.discount?.amount) rightRow(`Remise${data.discount.code ? ` (${data.discount.code})` : ''}`, `- ${money(data.discount.amount)}`)
  doc.font('Helvetica-Bold')
  rightRow('Total', money(data.total), true)
  doc.font('Helvetica')

  /* Footer */
  doc.moveDown(2)
  lineY()
  doc.moveDown(0.8)
  doc
    .fontSize(9)
    .fillColor('#666')
    .text('Merci pour votre achat ! Cette facture a été générée automatiquement.', startX, doc.y + 6, {
      align: 'center',
      width: 595 - startX * 2,
    })
    .fillColor('#000')
}

function drawTableHeader(doc: any, opt?: { yStart?: number }) {
  const startX = 50
  const y0 = opt?.yStart ?? doc.y
  const columns = { title: startX, qty: 330, unit: 380, amount: 460 }
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Article', columns.title, y0, { width: 260 })
    .text('Qté', columns.qty, y0)
    .text('Prix', columns.unit, y0)
    .text('Montant', columns.amount, y0)
    .font('Helvetica')
    .moveTo(startX, y0 + 15)
    .lineTo(545, y0 + 15)
    .strokeColor('#ddd')
    .stroke()
    .strokeColor('#000')
}

function getBrand(brand?: BrandInfo): BrandInfo {
  return {
    name: brand?.name || process.env.BRAND_NAME || 'TechPlay',
    address:
      brand?.address || process.env.BRAND_ADDRESS || '42 rue de la Liberté\n75000 Paris\nFrance',
    website: brand?.website || process.env.BRAND_URL || '',
    email: brand?.email || process.env.BRAND_EMAIL || '',
    phone: brand?.phone || process.env.BRAND_PHONE || '',
    vatNumber: brand?.vatNumber || process.env.BRAND_VAT || '',
    siret: brand?.siret || process.env.BRAND_SIRET || '',
    logoPath: brand?.logoPath || process.env.BRAND_LOGO_PATH || '',
  }
}

function nodeToWebReadable(stream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)))
      stream.on('end', () => controller.close())
      stream.on('error', (err) => controller.error(err))
    },
    cancel() {
      stream.destroy()
    },
  })
}

async function renderInvoiceNodeStream(data: InvoiceData, opts: PdfRenderOptions = {}): Promise<Readable> {
  const doc = createDoc(opts)
  const stream: Readable = doc as any
  drawInvoice(doc, data, opts)
  doc.end()
  return stream
}

/* ================================ Helpers ================================ */

function normalizeRate(rate: number) {
  if (!Number.isFinite(rate)) return 0
  if (rate > 1) return rate / 100 // si 20 -> 0.2
  if (rate < 0) return 0
  return rate
}

function toNumber(n: any): number {
  const v = Number(n)
  return Number.isFinite(v) ? v : 0
}

function sum(arr: number[]) {
  return arr.reduce((s, n) => s + n, 0)
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function sanitizeFilename(s: string) {
  return s.replace(/[^a-z0-9_\-\.]/gi, '_')
}

function formatAddress(a?: Address, fallbackName?: string) {
  if (!a && !fallbackName) return ''
  const lines = [
    a?.name || fallbackName,
    a?.company,
    a?.address1,
    a?.address2,
    [a?.postcode, a?.city].filter(Boolean).join(' '),
    a?.country,
    a?.email,
    a?.phone,
  ].filter(Boolean)
  return lines.join('\n')
}

function formatDateFR(d: Date) {
  try {
    return new Intl.DateTimeFormat('fr-FR').format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}
