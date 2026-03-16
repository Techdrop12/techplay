// src/lib/pdf.ts — Invoice data formatter + PDF generator (single source of truth)
// Typé proprement, compatible Next.js App Router, buffer, HTTP response et Web stream.

import PDFDocument from 'pdfkit';

import type {
  InvoiceOrder,
  InvoiceOrderItem,
  InvoiceData,
  InvoiceLineItem,
  InvoiceAddress,
} from '@/types/order';
import type { ServerResponse } from 'http';
import type { Readable } from 'node:stream';

import { formatDate } from '@/lib/formatDate';

/** @deprecated Use InvoiceOrder from @/types/order */
export type Order = InvoiceOrder;

/** @deprecated Use InvoiceOrderItem from @/types/order */
export type OrderItem = InvoiceOrderItem;

export type { InvoiceData, Money } from '@/types/order';

export type BrandInfo = {
  name: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
  siret?: string;
  logoPath?: string;
};

export type FormatOptions = {
  defaultTaxRate?: number;
  discountAffectsTaxBase?: boolean;
};

export type PdfRenderOptions = {
  brand?: BrandInfo;
  locale?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  pageSize?: 'A4' | 'Letter';
  margin?: number;
  title?: string;
};

type PdfDoc = InstanceType<typeof PDFDocument>;

/* ====================== Formatage: InvoiceOrder -> InvoiceData ===================== */

export function formatInvoiceData(order: InvoiceOrder, opts: FormatOptions = {}): InvoiceData {
  const currency = order.currency || 'EUR';
  const defaultTaxRate = normalizeRate(opts.defaultTaxRate ?? order.taxRateDefault ?? 0);

  const items: InvoiceLineItem[] = (order.items || []).map((item) => {
    const rate = normalizeRate(item.taxRate ?? defaultTaxRate);
    const unitPrice = toNumber(item.price);
    const quantity = Math.max(1, Math.floor(toNumber(item.quantity)));
    const lineTotal = round2(unitPrice * quantity);

    return {
      name: item.name,
      unitPrice,
      quantity,
      taxRate: rate,
      lineTotal,
    };
  });

  const subtotal = round2(sum(items.map((item) => item.lineTotal)));

  const shippingPrice = round2(toNumber(order.shipping?.price));
  const shippingRate = normalizeRate(order.shipping?.taxRate ?? defaultTaxRate);
  const shipping =
    shippingPrice > 0
      ? {
          label: order.shipping?.label || 'Livraison',
          price: shippingPrice,
          taxRate: shippingRate,
        }
      : undefined;

  const discountAmount = Math.max(0, round2(toNumber(order.discount?.amount)));
  const discount =
    discountAmount > 0
      ? {
          code: order.discount?.code,
          amount: discountAmount,
        }
      : undefined;

  const taxFromItems = sum(items.map((item) => round2(item.lineTotal * item.taxRate)));
  const taxFromShipping = shipping ? round2(shipping.price * shipping.taxRate) : 0;
  let tax = round2(taxFromItems + taxFromShipping);

  let total = round2(subtotal + (shipping?.price || 0) + tax);

  if (discount) {
    if (opts.discountAffectsTaxBase) {
      const taxableBase = subtotal + (shipping?.price || 0);
      const discountApplied = Math.min(discount.amount, taxableBase);
      const ratio = taxableBase > 0 ? (taxableBase - discountApplied) / taxableBase : 1;
      tax = round2(tax * ratio);
      total = round2(Math.max(0, taxableBase - discountApplied + tax));
    } else {
      total = round2(Math.max(0, total - discount.amount));
    }
  }

  const createdAt =
    order.createdAt instanceof Date
      ? order.createdAt
      : order.createdAt
        ? new Date(order.createdAt)
        : new Date();

  return {
    invoiceNumber: String(order.id),
    orderId: order.id,
    date: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
    customerName: order.customerName || order.customer?.name,
    customer: order.customer,
    items,
    shipping,
    discount,
    subtotal,
    tax,
    total,
    currency,
  };
}

/* =========================== Génération du PDF =========================== */

export async function renderInvoicePDFToBuffer(
  data: InvoiceData,
  opts: PdfRenderOptions = {}
): Promise<Buffer> {
  const doc = createDoc(opts);
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer | Uint8Array | string) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
        return;
      }
      if (chunk instanceof Uint8Array) {
        chunks.push(Buffer.from(chunk));
        return;
      }
      chunks.push(Buffer.from(chunk));
    });

    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    drawInvoice(doc, data, opts);
    doc.end();
  });
}

export async function renderInvoicePDFStream(
  data: InvoiceData,
  opts: PdfRenderOptions = {}
): Promise<{ stream: ReadableStream<Uint8Array>; filename: string }> {
  const filename = `invoice-${sanitizeFilename(String(data.invoiceNumber || data.orderId))}.pdf`;
  const nodeStream = await renderInvoiceNodeStream(data, opts);
  const stream = nodeToWebReadable(nodeStream);
  return { stream, filename };
}

export async function renderInvoiceToHttpResponse(
  data: InvoiceData,
  res: ServerResponse,
  opts: PdfRenderOptions = {}
): Promise<void> {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="invoice-${sanitizeFilename(String(data.invoiceNumber))}.pdf"`
  );

  const doc = createDoc(opts);
  doc.pipe(res);
  drawInvoice(doc, data, opts);
  doc.end();
}

async function renderInvoiceNodeStream(
  data: InvoiceData,
  opts: PdfRenderOptions = {}
): Promise<Readable> {
  const doc = createDoc(opts);
  drawInvoice(doc, data, opts);
  doc.end();
  return doc as unknown as Readable;
}

/* ============================== Implémentation ============================== */

function createDoc(opts: PdfRenderOptions = {}): PdfDoc {
  const margin = opts.margin ?? 50;
  const size = opts.pageSize ?? 'A4';

  const doc = new PDFDocument({
    size,
    margin,
    bufferPages: true,
  });

  doc.info = {
    Title: opts.title || 'Invoice',
    Author: opts.brand?.name || process.env.BRAND_NAME || 'TechPlay',
    Subject: 'Invoice',
  };

  return doc;
}

function drawInvoice(doc: PdfDoc, data: InvoiceData, opts: PdfRenderOptions) {
  const brand = getBrand(opts.brand);
  const locale = opts.locale || 'fr-FR';
  const currency = data.currency || 'EUR';
  const nf = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: opts.currencyDisplay || 'symbol',
    maximumFractionDigits: 2,
  });
  const money = (value: number) => nf.format(value);

  const startX = doc.page.margins.left;
  const rightX = doc.page.width - doc.page.margins.right;
  const contentWidth = rightX - startX;

  const divider = () => {
    doc
      .strokeColor('#dddddd')
      .moveTo(startX, doc.y + 4)
      .lineTo(rightX, doc.y + 4)
      .stroke()
      .strokeColor('#000000');
  };

  if (brand.logoPath) {
    try {
      doc.image(brand.logoPath, startX, 40, { width: 120 });
    } catch {}
  }

  doc
    .fontSize(22)
    .fillColor('#000000')
    .text(brand.name, startX, brand.logoPath ? 40 : 50);

  doc
    .fontSize(10)
    .fillColor('#666666')
    .text(brand.address || '', startX, doc.y + 4, { width: contentWidth / 2 });

  if (brand.website) doc.text(brand.website);
  if (brand.email) doc.text(`Contact: ${brand.email}`);
  if (brand.phone) doc.text(`Téléphone: ${brand.phone}`);
  if (brand.vatNumber) doc.text(`TVA: ${brand.vatNumber}`);
  if (brand.siret) doc.text(`SIRET: ${brand.siret}`);

  doc.fillColor('#000000');
  doc
    .fontSize(12)
    .text(`Facture n°: ${data.invoiceNumber}`, rightX - 200, 50, { width: 200, align: 'right' })
    .text(`Commande: ${String(data.orderId)}`, { width: 200, align: 'right' })
    .text(
      `Date: ${formatDate(data.date, locale, { day: '2-digit', month: 'short', year: 'numeric' })}`,
      {
        width: 200,
        align: 'right',
      }
    );

  doc.moveDown(1.2);
  doc.fontSize(12).text('Facturé à :', startX);
  const addressText = formatAddress(data.customer, data.customerName);
  if (addressText) {
    doc.fontSize(10).fillColor('#333333').text(addressText).fillColor('#000000');
  }

  doc.moveDown(1.2);
  drawTableHeader(doc);

  const rowHeight = 18;
  const columns = {
    title: startX,
    qty: rightX - 215,
    unit: rightX - 150,
    amount: rightX - 70,
  };

  let y = doc.y + 10;

  const ensurePageSpace = () => {
    if (y <= doc.page.height - doc.page.margins.bottom - 120) return;

    doc.addPage();
    y = doc.page.margins.top;
    drawTableHeader(doc, { yStart: y });
    y += 24;
  };

  data.items.forEach((item, index) => {
    const amount = round2(item.unitPrice * item.quantity);

    doc.fontSize(10).font('Helvetica');
    doc.text(item.name || `Article ${index + 1}`, columns.title, y, {
      width: columns.qty - columns.title - 20,
    });
    doc.text(String(item.quantity), columns.qty, y, { width: 40, align: 'right' });
    doc.text(money(item.unitPrice), columns.unit, y, { width: 60, align: 'right' });
    doc.text(money(amount), columns.amount, y, { width: 70, align: 'right' });

    y += rowHeight;
    ensurePageSpace();
  });

  y += 6;
  doc
    .moveTo(rightX - 205, y)
    .lineTo(rightX, y)
    .strokeColor('#dddddd')
    .stroke()
    .strokeColor('#000000');

  y += 10;

  const rightRow = (label: string, value: string, bold = false) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
    doc.fontSize(10);
    doc.text(label, rightX - 195, y, { width: 110, align: 'left' });
    doc.text(value, rightX - 80, y, { width: 80, align: 'right' });
    y += 16;
  };

  rightRow('Sous-total', money(data.subtotal));
  if (data.shipping) rightRow(data.shipping.label, money(data.shipping.price));
  rightRow('TVA', money(data.tax));
  if (data.discount?.amount) {
    rightRow(
      `Remise${data.discount.code ? ` (${data.discount.code})` : ''}`,
      `- ${money(data.discount.amount)}`
    );
  }
  rightRow('Total', money(data.total), true);

  doc.font('Helvetica').moveDown(2);
  divider();
  doc.moveDown(0.8);

  doc
    .fontSize(9)
    .fillColor('#666666')
    .text(
      'Merci pour votre achat ! Cette facture a été générée automatiquement.',
      startX,
      doc.y + 6,
      {
        align: 'center',
        width: contentWidth,
      }
    )
    .fillColor('#000000');
}

function drawTableHeader(doc: PdfDoc, opt?: { yStart?: number }) {
  const startX = doc.page.margins.left;
  const rightX = doc.page.width - doc.page.margins.right;
  const y0 = opt?.yStart ?? doc.y;

  const columns = {
    title: startX,
    qty: rightX - 215,
    unit: rightX - 150,
    amount: rightX - 70,
  };

  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('Article', columns.title, y0, { width: columns.qty - columns.title - 20 });
  doc.text('Qté', columns.qty, y0, { width: 40, align: 'right' });
  doc.text('Prix', columns.unit, y0, { width: 60, align: 'right' });
  doc.text('Montant', columns.amount, y0, { width: 70, align: 'right' });

  doc
    .moveTo(startX, y0 + 15)
    .lineTo(rightX, y0 + 15)
    .strokeColor('#dddddd')
    .stroke()
    .strokeColor('#000000')
    .font('Helvetica');

  doc.y = y0 + 16;
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
  };
}

function nodeToWebReadable(stream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('data', (chunk: Buffer | Uint8Array | string) => {
        if (Buffer.isBuffer(chunk)) {
          controller.enqueue(new Uint8Array(chunk));
          return;
        }
        if (chunk instanceof Uint8Array) {
          controller.enqueue(chunk);
          return;
        }
        controller.enqueue(new Uint8Array(Buffer.from(chunk)));
      });

      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });
}

/* ================================ Helpers ================================ */

function normalizeRate(rate: number): number {
  if (!Number.isFinite(rate)) return 0;
  if (rate > 1) return rate / 100;
  if (rate < 0) return 0;
  return rate;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9_.-]/gi, '_');
}

function formatAddress(address?: InvoiceAddress, fallbackName?: string): string {
  if (!address && !fallbackName) return '';

  const lines = [
    address?.name || fallbackName,
    address?.company,
    address?.address1,
    address?.address2,
    [address?.postcode, address?.city].filter(Boolean).join(' '),
    address?.country,
    address?.email,
    address?.phone,
  ].filter((line): line is string => typeof line === 'string' && line.trim().length > 0);

  return lines.join('\n');
}
