// src/app/api/invoice/route.ts — Invoice PDF (App Router, Node runtime)
// - Utilise la source unique: formatInvoiceData + renderInvoicePDFStream
// - Validation douce / coercition des champs
// - i18n € fr-FR, filename propre, headers cache-safe
// - Bonus: GET ?debug=json pour déboguer rapidement

import { NextResponse } from 'next/server'
import {
  type Order,
  type OrderItem,
  formatInvoiceData,
  renderInvoicePDFStream,
} from '@/lib/pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* ---------- Helpers de validation/coercition (sans dépendance externe) ---------- */

function toNum(n: any, def = 0): number {
  const v = Number(n)
  return Number.isFinite(v) ? v : def
}
function toStr(s: any, def = ''): string {
  return typeof s === 'string' ? s : def
}
function asItems(arr: any): OrderItem[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map((x) => ({
      name: toStr(x?.name || x?.title || 'Article'),
      price: toNum(x?.price, 0),
      quantity: Math.max(1, Math.floor(toNum(x?.quantity, 1))),
      taxRate: Number.isFinite(x?.taxRate) ? Number(x.taxRate) : undefined,
    }))
    .filter((it) => it.name && it.quantity > 0)
}

function buildOrderFromBody(body: any): Order {
  const id = body?.orderId ?? body?.id ?? Date.now()
  const currency = toStr(body?.currency, 'EUR')

  const shippingPrice = body?.shipping?.price ?? body?.shippingPrice
  const shippingRate =
    body?.shipping?.taxRate ?? body?.shippingTaxRate ?? body?.taxRateDefault

  return {
    id,
    createdAt: body?.createdAt,
    customerName: toStr(body?.customerName) || toStr(body?.customer?.name),
    customer: {
      name: toStr(body?.customer?.name),
      company: toStr(body?.customer?.company),
      address1: toStr(body?.customer?.address1),
      address2: toStr(body?.customer?.address2),
      postcode: toStr(body?.customer?.postcode),
      city: toStr(body?.customer?.city),
      country: toStr(body?.customer?.country),
      email: toStr(body?.customer?.email),
      phone: toStr(body?.customer?.phone),
    },
    items: asItems(body?.items),
    shipping:
      shippingPrice != null
        ? {
            label: toStr(body?.shipping?.label, 'Livraison'),
            price: toNum(shippingPrice, 0),
            taxRate: Number.isFinite(shippingRate) ? Number(shippingRate) : undefined,
          }
        : undefined,
    discount:
      body?.discount?.amount != null || body?.discountAmount != null
        ? {
            code: toStr(body?.discount?.code ?? body?.coupon),
            amount: toNum(body?.discount?.amount ?? body?.discountAmount, 0),
          }
        : undefined,
    currency,
    taxRateDefault: Number.isFinite(body?.taxRateDefault) ? Number(body.taxRateDefault) : undefined,
  }
}

/* --------------------------------- POST --------------------------------- */

export async function POST(req: Request) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // body restera {}
  }

  const order = buildOrderFromBody(body)

  if (!order.items || order.items.length === 0) {
    return NextResponse.json(
      { error: 'Aucun article dans la commande.' },
      { status: 400 }
    )
  }

  // Prépare les datas + PDF stream
  const data = formatInvoiceData(order, {
    defaultTaxRate: 0.2, // fallback 20% si rien fourni
    discountAffectsTaxBase: false, // change à true si remise avant TVA
  })

  // mode debug JSON: ajouter ?debug=json à l’URL de la requête (pratique pour tester)
  const url = new URL(req.url)
  if (url.searchParams.get('debug') === 'json') {
    return NextResponse.json(data, { status: 200 })
  }

  const { stream, filename } = await renderInvoicePDFStream(data, {
    brand: {
      name: process.env.BRAND_NAME || 'TechPlay',
      address:
        process.env.BRAND_ADDRESS || '42 rue de la Liberté\n75000 Paris\nFrance',
      website: process.env.BRAND_URL || '',
      email: process.env.BRAND_EMAIL || '',
      vatNumber: process.env.BRAND_VAT || '',
      siret: process.env.BRAND_SIRET || '',
      logoPath: process.env.BRAND_LOGO_PATH || '', // optionnel
    },
    locale: 'fr-FR',
    title: `Facture ${data.invoiceNumber}`,
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}

/* ------------------------------- OPTIONS ------------------------------- */
// (si tu envoies la route depuis un autre domaine / préflight CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
