// src/lib/pdf.ts — formatage des données facture
export type OrderItem = { name: string; price: number; quantity: number; taxRate?: number }
export type Order = {
id: string | number
customerName?: string
items: OrderItem[]
shipping?: { label?: string; price?: number; taxRate?: number }
discount?: { code?: string; amount?: number }
currency?: string
}


export type InvoiceData = {
orderId: string | number
customerName?: string
items: Array<{ name: string; unitPrice: number; quantity: number; taxRate: number; lineTotal: number }>
shipping?: { label: string; price: number }
discount?: { code?: string; amount: number }
subtotal: number
tax: number
total: number
currency: string
}


export function formatInvoiceData(order: Order): InvoiceData {
const currency = order.currency || 'EUR'
const items = (order.items || []).map((i) => {
const rate = i.taxRate ?? 0
const line = i.price * i.quantity
return { name: i.name, unitPrice: i.price, quantity: i.quantity, taxRate: rate, lineTotal: line }
})


const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
const taxFromItems = items.reduce((s, i) => s + i.lineTotal * (i.taxRate ?? 0), 0)


const shipPrice = order.shipping?.price ?? 0
const shipTax = shipPrice * (order.shipping?.taxRate ?? 0)


const discount = Math.max(0, order.discount?.amount ?? 0)


const tax = Math.max(0, taxFromItems + shipTax)
const total = Math.max(0, subtotal + shipPrice + tax - discount)


return {
orderId: order.id,
customerName: order.customerName,
items,
shipping: shipPrice ? { label: order.shipping?.label || 'Livraison', price: shipPrice } : undefined,
discount: discount ? { code: order.discount?.code, amount: discount } : undefined,
subtotal: round2(subtotal),
tax: round2(tax),
total: round2(total),
currency,
}
}


function round2(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100 }