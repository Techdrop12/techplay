// /src/lib/pdf/generateInvoice.js
// Génération de facture PDF (pdfkit) : logo, adresses, tableau, totaux, footer.
import PDFDocument from 'pdfkit'

/**
 * @param {any} order - { _id, createdAt, user:{name,address...}, items:[{title,quantity,price}], shipping?, taxRate? }
 * @param {import('http').ServerResponse} res
 */
export function generateInvoice (order, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=invoice-${order?._id || 'order'}.pdf`
  )

  doc.pipe(res)

  const brand = {
    name: process.env.BRAND_NAME || 'TechPlay',
    address: process.env.BRAND_ADDRESS || '42 rue de la Liberté\n75000 Paris\nFrance',
    website: process.env.BRAND_URL || 'https://techplay.com',
  }

  const createdAt = order?.createdAt ? new Date(order.createdAt) : new Date()
  const items = Array.isArray(order?.items) ? order.items : []
  const shipping = Number(order?.shipping || 0)
  const taxRate = Number.isFinite(order?.taxRate) ? Number(order.taxRate) : 0.2

  const subtotal = items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  )
  const tax = Math.round(subtotal * taxRate * 100) / 100
  const total = Math.round((subtotal + tax + shipping) * 100) / 100

  const money = (n) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  // Header
  doc
    .fontSize(22)
    .text(`Facture ${brand.name}`, { align: 'left' })
    .moveDown(0.2)
    .fontSize(10)
    .fillColor('#666')
    .text(brand.address)
    .moveDown(0.2)
    .text(brand.website)
    .fillColor('#000')

  doc
    .fontSize(12)
    .text(`Commande : ${order?._id || '-'}`, 350, 50, { align: 'right' })
    .text(`Date : ${createdAt.toLocaleDateString('fr-FR')}`, { align: 'right' })

  // Addresses
  doc.moveDown(1.2).fontSize(12).text('Facturé à :', 50)
  const user = order?.user || {}
  const addressLines = [
    user.name,
    user.company,
    user.address1,
    user.address2,
    [user.postcode, user.city].filter(Boolean).join(' '),
    user.country,
    user.email,
  ]
    .filter(Boolean)
    .join('\n')
  doc.fontSize(10).fillColor('#333').text(addressLines).fillColor('#000')

  // Table header
  doc.moveDown(1.2)
  const startY = doc.y
  const col = { title: 50, qty: 330, price: 380, amount: 460 }

  doc
    .fontSize(11)
    .text('Article', col.title, startY, { bold: true })
    .text('Qté', col.qty, startY)
    .text('Prix', col.price, startY)
    .text('Montant', col.amount, startY)

  doc
    .moveTo(50, startY + 15)
    .lineTo(545, startY + 15)
    .strokeColor('#ddd')
    .stroke()
    .strokeColor('#000')

  // Table rows
  let y = startY + 25
  items.forEach((it, idx) => {
    const q = Number(it.quantity) || 1
    const p = Number(it.price) || 0
    const amount = Math.round(p * q * 100) / 100

    doc.fontSize(10).text(String(it.title || `Article ${idx + 1}`), col.title, y, {
      width: 260,
    })
    doc.text(String(q), col.qty, y, { width: 40, align: 'right' })
    doc.text(money(p), col.price, y, { width: 70, align: 'right' })
    doc.text(money(amount), col.amount, y, { width: 90, align: 'right' })

    y += 18
    if (y > 700) {
      doc.addPage()
      y = 50
    }
  })

  // Totaux
  y += 10
  doc
    .moveTo(340, y)
    .lineTo(545, y)
    .strokeColor('#ddd')
    .stroke()
    .strokeColor('#000')

  y += 10
  const row = (label, val, bold = false) => {
    doc.fontSize(10)[bold ? 'font' : 'font']('Helvetica').text(label, 350, y)
    doc.fontSize(10).text(val, 460, y, { width: 90, align: 'right' })
    y += 16
  }

  row('Sous-total', money(subtotal))
  if (shipping > 0) row('Livraison', money(shipping))
  row(`TVA (${Math.round(taxRate * 100)}%)`, money(tax))
  doc
    .font('Helvetica-Bold')
    .text('Total', 350, y)
    .text(money(total), 460, y, { width: 90, align: 'right' })
    .font('Helvetica')

  // Footer
  doc
    .fontSize(9)
    .fillColor('#666')
    .text(
      'Merci pour votre achat !\nCette facture a été générée automatiquement.',
      50,
      770,
      { align: 'center', width: 500 }
    )

  doc.end()
}

export default generateInvoice
