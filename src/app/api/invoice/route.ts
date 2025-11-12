function readCode(x: any, fallback: string = ''): string {
  const v = (x && typeof x === "object") ? (x as any).code : undefined
  return (typeof v === "string" && v.trim()) ? v : fallback
}
function readDiscountCode(x: any, fallback: string = ''): string {
  if (!x || typeof x !== "object") return fallback
  const d: any = (x as any).discount
  const c1 = (d && typeof d === "object") ? d.code : undefined
  const c2 = (x as any).coupon?.code
  const c3 = (x as any).promoCode ?? (x as any).promotionCode ?? (x as any).discountCode
  const v = typeof c1 === "string" ? c1
        : (typeof c2 === "string" ? c2
        : (typeof c3 === "string" ? c3 : undefined))
  return (typeof v === "string" && v.trim()) ? v : fallback
}
function readDiscountLabel(x: any, fallback: string = "Remise"): string {
  const hasObj = x && typeof x === "object";
  const d = hasObj ? (x as any).discount : undefined;
  const lbl = hasObj ? (x as any).discountLabel : undefined;
  const fromObj = (d && typeof d === "object" && typeof (d as any).label === "string") ? (d as any).label : undefined;
  const v = typeof fromObj === "string" ? fromObj : (typeof lbl === "string" ? lbl : undefined);
  return (typeof v === "string" && v.trim()) ? v : fallback;
}
function readDiscountAmount(x: any, fallback: number = 0): number {
  const hasObj = x && typeof x === "object";
  const d = hasObj ? (x as any).discount : undefined;
  const da = hasObj ? (x as any).discountAmount : undefined;
  // formats supportés: discount:number | discount:{amount:number,label?:string} | discountAmount:number
  const n1 = typeof d === "number" ? d : Number((d as any)?.amount);
  const n2 = Number(da);
  const n  = Number.isFinite(n1) ? n1 : (Number.isFinite(n2) ? n2 : NaN);
  return Number.isFinite(n) ? n : fallback;
}
function readDiscount(x: any, fallback: number = 0): number {
  const v = (x && typeof x === "object") ? (x as any).discount : undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
function readCustomer(x: any): any {
  const c = (x && typeof x === "object") ? (x as any).customer : undefined
  return (c && typeof c === "object") ? c : {}
}
function readCustomerName(x: any, fallback: string = ''): string {
  const cn = (x && typeof x === "object") ? (x as any).customerName : undefined
  if (typeof cn === "string" && cn.trim()) return cn
  const c = readCustomer(x)
  const n = (c as any).name
  return (typeof n === "string") ? n : fallback
}
function readCustomerField(x: any, key: string, fallback: string = ''): string {
  const c = readCustomer(x)
  const v = (c as any)?.[key]
  return (typeof v === "string") ? v : fallback
}
function readCreatedAt(x: any, fallback: number = Date.now()): number {
  const v = (x && typeof x === "object") ? (x as any).createdAt : undefined
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const t = Date.parse(v)
    if (!Number.isNaN(t)) return t
  }
  return fallback
}
function readTaxRateDefault(x: any, fallback: number = 0): number {
  const v = (x && typeof x === "object") ? (x as any).taxRateDefault : undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
function readShippingTaxRate(x: any, fallback: number = 0): number {
  const v = (x && typeof x === "object") ? (x as any).shippingTaxRate : undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
function readShippingPrice(x: any, fallback: number = 0): number {
  const v = (x && typeof x === "object") ? (x as any).shippingPrice : undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
function readShipping(x: any): any {
  const s = (x && typeof x === "object") ? (x as any).shipping : undefined
  if (s && typeof s === "object") return s
  return {}
}
function readItems(x: any): any[] {
  const it = (x && typeof x === "object") ? (x as any).items : undefined
  return Array.isArray(it) ? it : []
}
function readEmail(x: any, fallback: string = ''): string {
  const e = (x && typeof x === "object") ? (x as any).email : undefined
  return (typeof e === "string") ? e : fallback
}
function readAddress(x: any, fallback: string = ''): string {
  const a = (x && typeof x === "object") ? (x as any).address : undefined
  return (typeof a === "string") ? a : fallback
}
function readCurrency(x: any, fallback: string = 'EUR'): string {
  const c = readCurrency(x)
  if (typeof c === "string" && c.trim()) return c
  return fallback
}
function readId(x: any): string {
  const id = readId(x)
  if (typeof id !== "string" || !id.trim()) throw new Error("Missing id")
  return id
}
function readOrderId(x: any): string {
  const id = readOrderId(x);
  if (typeof id !== "string" || !id.trim()) throw new Error("Missing orderId");
  return id;
}
async function getInvoiceBody(req: Request): Promise<InvoiceBody> {
  const j = await getInvoiceBody(req);
  const id = (j as any)?.orderId;
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Missing orderId");
  }
  return { orderId: id };
}
type InvoiceBody = { orderId: string }

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

function toNum(n: unknown, def = 0): number {
  const v = Number(n)
  return Number.isFinite(v) ? v : def
}
function toStr(s: unknown, def = ''): string {
  return typeof s === 'string' ? s : def
}
function asItems(arr: unknown): OrderItem[] {
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

function buildOrderFromBody(body: unknown): Order {
  const id = readOrderId(body) ?? readId(body) ?? Date.now()
  const currency = readCurrency(body, 'EUR')

  const shippingPrice = readShipping(body)?.price ?? readShippingPrice(body)
  const shippingRate =
    readShipping(body)?.taxRate ?? readShippingTaxRate(body) ?? readTaxRateDefault(body)

  return {
    id,
    createdAt: new Date(readCreatedAt(body)),
    customerName: readCustomerName(body),
    customer: {
      name: readCustomerField(body, 'name'),
      company: readCustomerField(body, 'company'),
      address1: readCustomerField(body, 'address1'),
      address2: readCustomerField(body, 'address2'),
      postcode: readCustomerField(body, 'postcode'),
      city: readCustomerField(body, 'city'),
      country: readCustomerField(body, 'country'),
email: readCustomerField(body, 'email') || readEmail(body),
      phone: readCustomerField(body, 'phone'),
    },
    items: asItems(readItems(body)),
    shipping:
      shippingPrice != null
        ? {
            label: toStr(readShipping(body)?.label, 'Livraison'),
            price: toNum(shippingPrice, 0),
            taxRate: Number.isFinite(shippingRate) ? Number(shippingRate) : undefined,
          }
        : undefined,
    discount:
      readDiscountAmount(body) != null || readDiscountAmount(body) != null
        ? {
            code: readCode(toStr(readDiscount(body)) ?? body?.coupon),
            amount: toNum(readDiscountAmount(body) ?? readDiscountAmount(body), 0),
          }
        : undefined,
    currency,
    taxRateDefault: Number.isFinite(readTaxRateDefault(body)) ? Number(readTaxRateDefault(body)) : undefined,
  }
}

/* --------------------------------- POST --------------------------------- */

export async function POST(req: Request) {
  let body: unknown = {}
  try {
    body = await req.json() as InvoiceBody
  } catch {
    // body restera {}
  }

  const order = buildOrderFromBody(body)

  if (!readItems(order) || readItems(order).length === 0) {
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

