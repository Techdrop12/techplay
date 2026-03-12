// src/app/api/invoice/route.ts
// Invoice PDF (App Router, Node runtime)
// - Source unique: formatInvoiceData + renderInvoicePDFStream
// - Validation/coercition douce sans dépendance externe
// - Compatible payloads souples (items/title/name, shipping imbriqué ou plat, discount imbriqué ou plat)
// - Debug JSON via ?debug=json
// - Zéro récursion cassée, zéro any

import { NextResponse } from 'next/server'

import { serverEnv } from '@/env.server'
import {
  type Order,
  type OrderItem,
  formatInvoiceData,
  renderInvoicePDFStream,
} from '@/lib/pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type InvoiceBody = {
  order?: Record<string, unknown>
  orderId?: string
  id?: string
  createdAt?: string | number | Date
  currency?: string
  customerName?: string
  email?: string
  items?: unknown[]
  shipping?: unknown
  shippingPrice?: number
  shippingTaxRate?: number
  taxRateDefault?: number
  discount?: unknown
  discountAmount?: number
  coupon?: unknown
  promoCode?: string
  promotionCode?: string
  discountCode?: string
  customer?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {}
}

function getNonEmptyString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function getNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function getOptionalNumber(value: unknown): number | undefined {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function getDate(value: unknown, fallback = Date.now()): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value)
  }

  if (typeof value === 'string' && value.trim()) {
    const ts = Date.parse(value)
    if (!Number.isNaN(ts)) return new Date(ts)
  }

  return new Date(fallback)
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function readRoot(body: unknown): Record<string, unknown> {
  const root = getRecord(body)
  const nestedOrder = root.order
  return isRecord(nestedOrder) ? nestedOrder : root
}

function readId(root: Record<string, unknown>): string {
  const candidates = [root.orderId, root.id, root._id, root.invoiceId]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return String(candidate)
    }
  }

  return `order-${Date.now()}`
}

function readCurrency(root: Record<string, unknown>, fallback = 'EUR'): string {
  const value = getNonEmptyString(root.currency, fallback).toUpperCase()
  return value || fallback
}

function readCustomer(root: Record<string, unknown>): Record<string, unknown> {
  return getRecord(root.customer)
}

function readCustomerName(root: Record<string, unknown>): string {
  const customer = readCustomer(root)

  const firstName = getNonEmptyString(customer.firstName)
  const lastName = getNonEmptyString(customer.lastName)
  const fullNameFromParts =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : ''

  return (
    getNonEmptyString(root.customerName) ||
    getNonEmptyString(customer.name) ||
    getNonEmptyString(customer.fullName) ||
    fullNameFromParts ||
    ''
  )
}

function readCustomerField(
  root: Record<string, unknown>,
  key: string,
  fallback = ''
): string {
  const customer = readCustomer(root)
  return getNonEmptyString(customer[key], fallback)
}

function readEmail(root: Record<string, unknown>, fallback = ''): string {
  return getNonEmptyString(root.email) || getNonEmptyString(readCustomer(root).email) || fallback
}

function readShipping(root: Record<string, unknown>): Record<string, unknown> {
  return getRecord(root.shipping)
}

function readShippingPrice(root: Record<string, unknown>): number | undefined {
  const shipping = readShipping(root)
  return getOptionalNumber(shipping.price) ?? getOptionalNumber(root.shippingPrice)
}

function readShippingTaxRate(root: Record<string, unknown>): number | undefined {
  const shipping = readShipping(root)
  return (
    getOptionalNumber(shipping.taxRate) ??
    getOptionalNumber(root.shippingTaxRate) ??
    getOptionalNumber(root.taxRateDefault)
  )
}

function readCouponCode(root: Record<string, unknown>): string {
  const discount = getRecord(root.discount)
  const coupon = getRecord(root.coupon)

  return (
    getNonEmptyString(discount.code) ||
    getNonEmptyString(coupon.code) ||
    getNonEmptyString(root.promoCode) ||
    getNonEmptyString(root.promotionCode) ||
    getNonEmptyString(root.discountCode) ||
    ''
  )
}

function readDiscountAmount(root: Record<string, unknown>): number | undefined {
  const discount = root.discount

  if (typeof discount === 'number' && Number.isFinite(discount)) {
    return discount
  }

  if (isRecord(discount)) {
    return getOptionalNumber(discount.amount)
  }

  return getOptionalNumber(root.discountAmount)
}

function readItems(root: Record<string, unknown>): OrderItem[] {
  return getArray(root.items)
    .map((item): OrderItem | null => {
      const it = getRecord(item)

      const name = getNonEmptyString(it.name) || getNonEmptyString(it.title) || 'Article'
      const price = Math.max(0, getNumber(it.price, 0))
      const quantity = Math.max(1, Math.floor(getNumber(it.quantity ?? it.qty, 1)))
      const taxRate =
        getOptionalNumber(it.taxRate) ??
        getOptionalNumber(it.vatRate) ??
        getOptionalNumber(it.tva)

      if (!name || quantity <= 0) return null

      return {
        name,
        price,
        quantity,
        ...(typeof taxRate === 'number' ? { taxRate } : {}),
      }
    })
    .filter((item): item is OrderItem => item !== null)
}

function buildOrderFromBody(body: unknown): Order {
  const root = readRoot(body)
  const shipping = readShipping(root)

  const shippingPrice = readShippingPrice(root)
  const shippingTaxRate = readShippingTaxRate(root)
  const discountAmount = readDiscountAmount(root)
  const discountCode = readCouponCode(root)
  const taxRateDefault = getOptionalNumber(root.taxRateDefault)

  return {
    id: readId(root),
    createdAt: getDate(root.createdAt),
    customerName: readCustomerName(root),
    customer: {
      name: readCustomerField(root, 'name'),
      company: readCustomerField(root, 'company'),
      address1: readCustomerField(root, 'address1') || readCustomerField(root, 'address'),
      address2: readCustomerField(root, 'address2'),
      postcode: readCustomerField(root, 'postcode') || readCustomerField(root, 'zip'),
      city: readCustomerField(root, 'city'),
      country: readCustomerField(root, 'country'),
      email: readEmail(root),
      phone: readCustomerField(root, 'phone'),
    },
    items: readItems(root),
    ...(typeof shippingPrice === 'number'
      ? {
          shipping: {
            label: getNonEmptyString(shipping.label, 'Livraison'),
            price: shippingPrice,
            ...(typeof shippingTaxRate === 'number' ? { taxRate: shippingTaxRate } : {}),
          },
        }
      : {}),
    ...(typeof discountAmount === 'number'
      ? {
          discount: {
            code: discountCode,
            amount: discountAmount,
          },
        }
      : {}),
    currency: readCurrency(root, 'EUR'),
    ...(typeof taxRateDefault === 'number' ? { taxRateDefault } : {}),
  }
}

export async function POST(req: Request) {
  let body: unknown = {}

  try {
    body = (await req.json()) as InvoiceBody
  } catch {
    body = {}
  }

  const order = buildOrderFromBody(body)

  if (!Array.isArray(order.items) || order.items.length === 0) {
    return NextResponse.json({ error: 'Aucun article dans la commande.' }, { status: 400 })
  }

  const data = formatInvoiceData(order, {
    defaultTaxRate: 0.2,
    discountAffectsTaxBase: false,
  })

  const url = new URL(req.url)
  if (url.searchParams.get('debug') === 'json') {
    return NextResponse.json(data, { status: 200 })
  }

  const { stream, filename } = await renderInvoicePDFStream(data, {
    brand: {
      name: serverEnv.BRAND_NAME || 'TechPlay',
      address: serverEnv.BRAND_ADDRESS || '42 rue de la Liberté\n75000 Paris\nFrance',
      website: serverEnv.BRAND_URL || '',
      email: serverEnv.BRAND_EMAIL || '',
      vatNumber: serverEnv.BRAND_VAT || '',
      siret: serverEnv.BRAND_SIRET || '',
      logoPath: serverEnv.BRAND_LOGO_PATH || '',
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

export async function OPTIONS() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}