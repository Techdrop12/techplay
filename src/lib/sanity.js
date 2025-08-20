// src/lib/sanity.js — Sanity client singleton + helper fetch
import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.SANITY_API_VERSION || '2023-11-01'

/** @type {import('@sanity/client').SanityClient | undefined} */
let _client

export function getSanityClient({ useCdn = true, token } = {}) {
  _client =
    _client && !token
      ? _client
      : createClient({ projectId, dataset, apiVersion, useCdn, token })
  return _client
}

export const client = getSanityClient()

/**
 * Raccourci fetch (typé via JSDoc) avec options de cache Next.js
 * @template T
 * @param {string} query
 * @param {Record<string, any>} [params]
 * @param {{ useCdn?: boolean; token?: string; next?: { revalidate?: number } }} [options]
 * @returns {Promise<T>}
 */
export async function sanityFetch(query, params = {}, options = {}) {
  const c = options.token
    ? getSanityClient({ useCdn: options.useCdn, token: options.token })
    : client
  return c.fetch(query, params, { next: options.next })
}

export default client
