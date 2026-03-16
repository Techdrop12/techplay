// src/lib/sanity.ts — Sanity client singleton + helper fetch
// @deprecated Non importé. À brancher si CMS Sanity utilisé.
import { createClient, type SanityClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || '2023-11-01';

let _client: SanityClient | undefined;

export function getSanityClient({
  useCdn = true,
  token,
}: { useCdn?: boolean; token?: string } = {}): SanityClient {
  _client =
    _client && !token ? _client : createClient({ projectId, dataset, apiVersion, useCdn, token });
  return _client;
}

export const client = getSanityClient();

export interface SanityFetchOptions {
  useCdn?: boolean;
  token?: string;
  next?: { revalidate?: number };
}

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: SanityFetchOptions = {}
): Promise<T> {
  const c = options.token
    ? getSanityClient({ useCdn: options.useCdn, token: options.token })
    : client;
  return c.fetch(query, params, { next: options.next });
}

export default client;
