// src/types/product.ts

export type ReviewRating = 1 | 2 | 3 | 4 | 5;
export type ProductAttributeValue = string | number | boolean;

/** Avis client unitaire */
export interface Review {
  [key: string]: unknown;

  _id: string;
  productId?: string;
  rating: ReviewRating;
  comment: string;
  author?: string;
  title?: string;
  createdAt?: string | Date;
}

/** Agrégation des avis */
export interface AggregateRating {
  [key: string]: unknown;

  average: number;
  total: number;
  breakdownCount?: Partial<Record<ReviewRating, number>>;
}

/** Promotion stockée côté back */
export interface Promo {
  [key: string]: unknown;

  price?: number;
  startDate?: string | Date;
  endDate?: string | Date;
}

/** Produit unitaire vendu à l'item */
export interface Product {
  [key: string]: unknown;

  _id: string;
  slug: string;

  title?: string;
  description?: string;

  price: number;
  oldPrice?: number;

  image?: string;
  images?: string[];
  gallery?: string[];

  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
  aggregateRating?: AggregateRating;

  isNew?: boolean;
  isBestSeller?: boolean;

  category?: string;
  brand?: string;
  sku?: string;
  stock?: number;

  promo?: Promo;
  attributes?: Record<string, ProductAttributeValue>;
}

/** Utilisé dans le panier (source unique pour context, lib/cart, abandon-cart payloads) */
export interface CartItem {
  [key: string]: unknown;

  _id: string;
  slug: string;
  title?: string;
  price: number;
  image?: string;
  quantity: number;
  sku?: string;
  category?: string;
}

/** Item contenu dans un pack */
export interface PackItem {
  [key: string]: unknown;

  _id?: string;
  id?: string | number;
  slug?: string;

  title?: string;
  name?: string;
  label?: string;

  image?: string;

  price?: number;
  prix?: number;
  amount?: number;
  value?: number;

  quantity?: number;
}

/** Pack/bundle de plusieurs produits */
export interface Pack {
  [key: string]: unknown;

  _id: string;
  id?: string | number;

  slug: string;
  title: string;
  description: string;

  price: number;
  oldPrice?: number;

  compareAtPrice?: number;
  compare_at_price?: number;
  referencePrice?: number;
  reference_price?: number;

  rating?: number;
  reviewsCount?: number;

  tags?: string[];

  image?: string;
  images?: string[];

  isNew?: boolean;
  new?: boolean;

  isBestSeller?: boolean;
  bestSeller?: boolean;
  bestseller?: boolean;

  stock?: number;

  brand?: string;
  sku?: string;

  items?: PackItem[];
  contents?: PackItem[];
}
