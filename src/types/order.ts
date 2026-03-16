/**
 * Types pour facturation / PDF (DTO métier, distinct du modèle Mongoose Order).
 */

export type Money = number;

export interface InvoiceAddress {
  name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  postcode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceOrderItem {
  name: string;
  price: Money;
  quantity: number;
  taxRate?: number;
}

export interface InvoiceShippingLine {
  label?: string;
  price?: Money;
  taxRate?: number;
}

export interface InvoiceDiscount {
  code?: string;
  amount?: Money;
}

/** Commande au format facture / PDF */
export interface InvoiceOrder {
  id: string | number;
  createdAt?: Date | string;
  customerName?: string;
  customer?: InvoiceAddress;
  items: InvoiceOrderItem[];
  shipping?: InvoiceShippingLine;
  discount?: InvoiceDiscount;
  currency?: string;
  taxRateDefault?: number;
}

export interface InvoiceLineItem {
  name: string;
  unitPrice: Money;
  quantity: number;
  taxRate: number;
  lineTotal: Money;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string | number;
  date: Date;
  customerName?: string;
  customer?: InvoiceAddress;
  items: InvoiceLineItem[];
  shipping?: { label: string; price: Money; taxRate: number };
  discount?: { code?: string; amount: Money };
  subtotal: Money;
  tax: Money;
  total: Money;
  currency: string;
}

export interface InvoiceBrandInfo {
  name: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
  siret?: string;
  logoPath?: string;
  logo?: string;
}
