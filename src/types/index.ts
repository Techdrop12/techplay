/**
 * Barrel des types partagés du projet.
 * Préférer importer depuis @/types pour les types métier.
 */

export type {
  Product,
  CartItem,
  Pack,
  PackItem,
  Review,
  ReviewRating,
  AggregateRating,
  Promo,
  ProductAttributeValue,
} from './product';

export type { BlogPost, BlogPostDb, ArticleJsonLd, ID, ISODateString } from './blog';

export type { GAParams, GAEvent, FBQEvent } from './analytics';

export type {
  Money,
  InvoiceOrder,
  InvoiceOrderItem,
  InvoiceData,
  InvoiceLineItem,
  InvoiceAddress,
  InvoiceShippingLine,
  InvoiceDiscount,
  InvoiceBrandInfo,
} from './order';
