/**
 * Types for blog posts with a clear split between the
 * raw DB shape and the normalized UI shape.
 */

export type ID = string;

/** ISO date string (keep wide, enforce at runtime if needed) */
export type ISODateString = string;

/** Shape coming from DB / API (can be incomplete) */
export interface BlogPostDb {
  _id: ID;
  slug: string;
  title: string;
  content: string;
  description?: string;
  createdAt?: ISODateString | Date;
  updatedAt?: ISODateString | Date;
  image?: string;     // absolute or /relative
  author?: string;    // display name
  tags?: string[];
}

/** Strict UI shape used by components (no undefined surprises) */
export interface BlogPost {
  _id: ID;
  slug: string;
  title: string;
  content: string;
  description: string;
  createdAt: ISODateString; // normalized ISO string
  updatedAt?: ISODateString;
  image: string;            // guaranteed usable
  author: string;
  tags: string[];
}

/**
 * Normalize a loose DB post into a strict UI post.
 * Gives you safe defaults for JSON-LD, cards, lists, etc.
 */
export function normalizeBlogPost(input: BlogPostDb): BlogPost {
  const toIso = (d?: string | Date): ISODateString =>
    d instanceof Date ? d.toISOString() : (d ?? new Date().toISOString());

  return {
    _id: input._id,
    slug: input.slug,
    title: input.title,
    content: input.content,
    description: input.description ?? '',
    createdAt: toIso(input.createdAt),
    updatedAt: input.updatedAt ? toIso(input.updatedAt) : undefined,
    image: input.image ?? '/images/blog/default-cover.jpg',
    author: input.author ?? 'TechPlay',
    tags: input.tags ?? [],
  };
}

/** Minimal shape for JSON-LD Article components */
export interface ArticleJsonLd {
  headline: string;
  datePublished: ISODateString;
  dateModified?: ISODateString;
  image: string | string[];
  authorName: string | { name: string };
  url: string;
  description?: string;
}
