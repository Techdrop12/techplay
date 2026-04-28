import { cache } from 'react';

import { connectToDatabase } from './db';
import { toPlain } from './utils';

import type { BlogPost } from '@/types/blog';
import type { Pack as PackType, Product as ProductType } from '@/types/product';
import type { PipelineStage } from 'mongoose';

import Blog from '@/models/Blog';
import Pack from '@/models/Pack';
import Product from '@/models/Product';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const PRODUCT_LIST_FIELDS = [
  '_id',
  'slug',
  'title',
  'description',
  'price',
  'oldPrice',
  'image',
  'images',
  'gallery',
  'rating',
  'aggregateRating',
  'reviewsCount',
  'reviews',
  'stock',
  'category',
  'brand',
  'sku',
  'isNew',
  'isBestSeller',
  'featured',
  'tags',
  'createdAt',
].join(' ');

const PACK_LIST_FIELDS = [
  '_id',
  'slug',
  'title',
  'description',
  'price',
  'oldPrice',
  'image',
  'images',
  'rating',
  'reviewsCount',
  'stock',
  'brand',
  'sku',
  'isNew',
  'isBestSeller',
  'recommended',
  'items',
  'createdAt',
].join(' ');

export const getBestProducts = cache(async function getBestProducts(): Promise<ProductType[]> {
  await connectToDatabase();

  const docs = await Product.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .select(PRODUCT_LIST_FIELDS)
    .lean()
    .exec();

  return toPlain<ProductType[]>(docs);
});

export const getAllProducts = cache(async function getAllProducts(): Promise<ProductType[]> {
  await connectToDatabase();

  const docs = await Product.find({})
    .sort({ createdAt: -1 })
    .select(PRODUCT_LIST_FIELDS)
    .lean()
    .exec();

  return toPlain<ProductType[]>(docs);
});

export const getProductBySlug = cache(async function getProductBySlug(slug: string): Promise<ProductType | null> {
  await connectToDatabase();

  const product = await Product.findOne({ slug }).lean().exec();
  return product ? toPlain<ProductType>(product) : null;
});

export async function getRelatedProducts(
  currentSlug: string,
  category: string | null | undefined,
  limit = 4
): Promise<ProductType[]> {
  await connectToDatabase();
  const filter: Record<string, unknown> = { slug: { $ne: currentSlug } };
  if (category && String(category).trim()) {
    filter.category = { $regex: new RegExp(`^${escapeRegex(String(category).trim())}$`, 'i') };
  }
  const docs = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(PRODUCT_LIST_FIELDS)
    .lean()
    .exec();
  return toPlain<ProductType[]>(docs);
}

export async function getAllPacks(): Promise<PackType[]> {
  await connectToDatabase();

  const docs = await Pack.find({})
    .sort({ createdAt: -1 })
    .select(PACK_LIST_FIELDS)
    .lean()
    .exec();

  return toPlain<PackType[]>(docs);
}

export async function getRecommendedPacks(): Promise<PackType[]> {
  await connectToDatabase();

  const docs = await Pack.find({ recommended: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .select(PACK_LIST_FIELDS)
    .lean()
    .exec();

  return toPlain<PackType[]>(docs);
}

export async function getPackBySlug(slug: string): Promise<PackType | null> {
  await connectToDatabase();

  const pack = await Pack.findOne({ slug }).lean().exec();
  return pack ? toPlain<PackType>(pack) : null;
}

export async function getLatestBlogPosts(): Promise<BlogPost[]> {
  await connectToDatabase();

  const docs = await Blog.find({}).sort({ createdAt: -1 }).limit(10).lean().exec();

  return toPlain<BlogPost[]>(docs);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await connectToDatabase();

  const post = await Blog.findOne({ slug }).lean().exec();
  return post ? toPlain<BlogPost>(post) : null;
}

type SortKey = 'price_asc' | 'price_desc' | 'rating' | 'new' | 'promo';

type GetProductsPageInput = {
  q?: string;
  min?: number;
  max?: number;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  category?: string | null;
};

type ProductPageFacet = {
  items: ProductType[];
  total: Array<{ value: number }>;
  categoryCounts: Array<{ _id: string | null; count: number }>;
  stats: Array<{ _id: null; min: number; max: number }>;
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  casques: ['casques', 'casque', 'headphones', 'headset', 'écouteurs', 'earbuds', 'audio headset'],
  claviers: ['claviers', 'clavier', 'keyboards', 'keyboard', 'mechanical keyboard', 'mech'],
  souris: ['souris', 'mouse', 'mice', 'gaming mouse', 'wireless mouse'],
  webcams: ['webcam', 'webcams', 'camera', 'pc camera'],
  batteries: ['batteries', 'battery', 'power bank', 'chargeur', 'charger', 'usb-c charger', 'hub'],
  audio: ['audio', 'speakers', 'speaker', 'enceinte', 'dac', 'soundbar'],
  stockage: [
    'stockage',
    'storage',
    'ssd',
    'carte',
    'memory card',
    'sd card',
    'usb',
    'hdd',
    'disque',
  ],
  ecrans: ['ecrans', 'écrans', 'monitor', 'monitors', 'screen', 'display'],
};

function buildCategoryRegex(input?: string | null): RegExp | null {
  if (!input) return null;

  const key = String(input).trim().toLowerCase();
  const list = CATEGORY_ALIASES[key] || [key];
  const alts = Array.from(new Set(list.filter(Boolean).map((s) => s.trim())));

  return alts.length ? new RegExp(`^(${alts.map(escapeRegex).join('|')})$`, 'i') : null;
}

export async function getProductsPage({
  q,
  min,
  max,
  sort = 'new',
  page = 1,
  pageSize = 24,
  category = null,
}: GetProductsPageInput) {
  await connectToDatabase();

  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.min(96, Math.max(1, Number(pageSize) || 24));
  const skip = (safePage - 1) * safeSize;

  const textMatch: Record<string, unknown> = {};
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    textMatch.$or = [{ title: rx }, { description: rx }, { brand: rx }, { category: rx }];
  }

  const catRegex = buildCategoryRegex(category || undefined);
  const categoryStage: PipelineStage.Match | null = catRegex
    ? { $match: { category: { $regex: catRegex } } }
    : null;

  const now = new Date();

  const promoAddFields: PipelineStage[] = [
    {
      $addFields: {
        isPromoActive: {
          $and: [
            { $ifNull: ['$promo.price', false] },
            { $lt: ['$promo.price', '$price'] },
            { $or: [{ $eq: ['$promo.startDate', null] }, { $lte: ['$promo.startDate', now] }] },
            { $or: [{ $eq: ['$promo.endDate', null] }, { $gte: ['$promo.endDate', now] }] },
          ],
        },
      },
    },
    {
      $addFields: {
        currentPrice: { $cond: ['$isPromoActive', '$promo.price', '$price'] },
        oldPriceOut: { $cond: ['$isPromoActive', '$price', '$oldPrice'] },
      },
    },
    {
      $addFields: {
        discountPct: {
          $cond: [
            { $and: [{ $gt: ['$oldPriceOut', 0] }, { $lt: ['$currentPrice', '$oldPriceOut'] }] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: [{ $subtract: ['$oldPriceOut', '$currentPrice'] }, '$oldPriceOut'] },
                    100,
                  ],
                },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
  ];

  const hasMin = typeof min === 'number' && Number.isFinite(min);
  const hasMax = typeof max === 'number' && Number.isFinite(max);

  const priceStage: PipelineStage.Match | null =
    hasMin || hasMax
      ? {
          $match: {
            currentPrice: {
              ...(hasMin ? { $gte: Number(min) } : {}),
              ...(hasMax ? { $lte: Number(max) } : {}),
            },
          },
        }
      : null;

  const itemsSort: PipelineStage.Sort[] =
    sort === 'promo'
      ? [{ $sort: { discountPct: -1, currentPrice: 1, createdAt: -1 } }]
      : sort === 'price_asc'
        ? [{ $sort: { currentPrice: 1, createdAt: -1 } }]
        : sort === 'price_desc'
          ? [{ $sort: { currentPrice: -1, createdAt: -1 } }]
          : sort === 'rating'
            ? [{ $sort: { 'aggregateRating.average': -1, rating: -1, createdAt: -1 } }]
            : [{ $sort: { createdAt: -1 } }];

  const itemsPipeline = [
    ...(categoryStage ? [categoryStage] : []),
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
    ...itemsSort,
    { $skip: skip },
    { $limit: safeSize },
    {
      $project: {
        _id: 1,
        slug: 1,
        title: 1,
        description: 1,
        price: '$currentPrice',
        oldPrice: '$oldPriceOut',
        image: 1,
        images: 1,
        gallery: 1,
        rating: 1,
        aggregateRating: 1,
        reviewsCount: 1,
        stock: 1,
        category: 1,
        brand: 1,
        sku: 1,
        isNew: 1,
        isBestSeller: 1,
        tags: 1,
        discountPct: 1,
        createdAt: 1,
      },
    },
  ] as unknown as PipelineStage[];

  const totalPipeline = [
    ...(categoryStage ? [categoryStage] : []),
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
    { $count: 'value' },
  ] as unknown as PipelineStage[];

  const categoryCountsPipeline = [
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
    {
      $group: {
        _id: { $ifNull: ['$category', 'Autres'] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
  ] as unknown as PipelineStage[];

  const statsPipeline = [
    ...promoAddFields,
    ...(priceStage ? [priceStage] : []),
    {
      $group: {
        _id: null,
        min: { $min: '$currentPrice' },
        max: { $max: '$currentPrice' },
      },
    },
  ] as unknown as PipelineStage[];

  const facetStage = {
    $facet: {
      items: itemsPipeline,
      total: totalPipeline,
      categoryCounts: categoryCountsPipeline,
      stats: statsPipeline,
    },
  } as unknown as PipelineStage;

  const pipeline: PipelineStage[] = [{ $match: textMatch }, facetStage];

  const [facet] = await Product.aggregate<ProductPageFacet>(pipeline);

  const safeFacet: ProductPageFacet = facet ?? {
    items: [],
    total: [],
    categoryCounts: [],
    stats: [],
  };

  const items = Array.isArray(safeFacet.items) ? safeFacet.items : [];
  const total = Number(safeFacet.total?.[0]?.value || 0);
  const pageCount = Math.max(1, Math.ceil(total / safeSize));

  const counts: Record<string, number> = {};
  for (const row of safeFacet.categoryCounts || []) {
    if (row?._id != null) counts[String(row._id)] = Number(row.count || 0);
  }

  const firstStat = safeFacet.stats?.[0];
  const priceRange =
    firstStat && Number.isFinite(firstStat.min) && Number.isFinite(firstStat.max)
      ? { min: Number(firstStat.min), max: Number(firstStat.max) }
      : undefined;

  return {
    items: toPlain<ProductType[]>(items),
    total,
    page: safePage,
    pageSize: safeSize,
    pageCount,
    categoryCounts: counts,
    priceRange,
  };
}
