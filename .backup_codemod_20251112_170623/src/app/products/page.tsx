/* src/app/products/page.tsx — version autonome (await searchParams + JSON-safe + rendu simple) */
import Link from "next/link"

import type { Metadata } from "next"

import { generateMeta } from "@/lib/seo"

type SortKey = "new" | "price_asc" | "price_desc"
type Query = {
  q?: string
  sort?: SortKey
  page?: string | number
  min?: string | number
  max?: string | number
  cat?: string
}

/* Helpers */
function toPlain<T>(x: T): T {
  try { return JSON.parse(JSON.stringify(x)) } catch { return x as T }
}

async function fetchProductsServer(q: {
  q: string
  sort: SortKey
  page: number
  min?: number
  max?: number
  cat?: string | null
}): Promise<{ items: any[]; total: number }> {
  // Essaie d'utiliser l'API interne si elle existe
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000"
  const params = new URLSearchParams()
  if (q.q) params.set("q", q.q)
  if (q.sort) params.set("sort", q.sort)
  if (q.page) params.set("page", String(q.page))
  if (typeof q.min === "number") params.set("min", String(q.min))
  if (typeof q.max === "number") params.set("max", String(q.max))
  if (q.cat) params.set("cat", q.cat)

  try {
    const res = await fetch(`${base}/api/products?${params.toString()}`, { cache: "no-store" })
    if (!res.ok) return { items: [], total: 0 }
    const data = await res.json().catch(() => null)
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    const total = Number(data?.total ?? items.length) || 0
    return { items, total }
  } catch {
    return { items: [], total: 0 }
  }
}

/* ---------- Metadata ---------- */
export async function generateMetadata(
  { searchParams }: { searchParams?: Promise<Query> | Query }
): Promise<Metadata> {
  const sp = (searchParams && typeof (searchParams as any).then === "function")
    ? await (searchParams as Promise<Query>)
    : (searchParams as Query | undefined)

  const q = (sp?.q ?? "").toString().trim()
  const sort = ((sp?.sort ?? "new") as SortKey)
  const page = Math.max(1, Number(sp?.page ?? 1))
  const min = sp?.min
  const max = sp?.max
  const cat = (sp?.cat ?? "").toString().trim()

  const bits: string[] = []
  if (q) bits.push(`Recherche: "${q}"`)
  if (cat) bits.push(`Catégorie: ${cat}`)
  if (min || max) bits.push(`Prix${min ? " ≥ " + min : ""}${max ? " ≤ " + max : ""}`)
  if (sort !== "new") bits.push(`Tri: ${sort}`)

  const title = bits.length ? `Produits — ${bits.join(" · ")}` : "Tous les produits"
  const description = "Découvrez notre catalogue de produits high-tech."

  return generateMeta({
    title,
    description,
    url: "/products",
    image: "/og-products.jpg",
  })
}

/* ---------- Page ---------- */
export default async function ProductsPage(
  { searchParams }: { searchParams?: Promise<Query> | Query }
) {
  const sp = (searchParams && typeof (searchParams as any).then === "function")
    ? await (searchParams as Promise<Query>)
    : (searchParams as Query | undefined)

  const q = (sp?.q ?? "").toString().trim()
  const rawSort = (sp?.sort ?? "new") as SortKey
  const sort: SortKey = (["new","price_asc","price_desc"] as SortKey[]).includes(rawSort) ? rawSort : "new"
  const minNum = Number(sp?.min)
  const maxNum = Number(sp?.max)
  const min = Number.isFinite(minNum) && minNum >= 0 ? minNum : undefined
  const max = Number.isFinite(maxNum) && maxNum >= 0 ? maxNum : undefined
  const page = Math.max(1, Number(sp?.page ?? 1))
  const cat = (sp?.cat ?? "").toString().trim() || null

  const { items, total } = await fetchProductsServer({ q, sort, min, max, page, cat })
  const list = toPlain(items) as Array<{ slug?: string; title?: string; price?: number }>

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Produits</h1>
      <p className="text-sm opacity-70 mb-6">{total} résultat(s)</p>

      {list.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <li key={p?.slug ?? i} className="border rounded-xl p-4">
              <h3 className="font-medium">{p?.title ?? "Produit"}</h3>
              {"price" in (p || {}) && typeof p?.price === "number" ? (
                <p className="mt-1">{p.price} €</p>
              ) : null}
              {p?.slug ? (
                <Link href={`/products/${p.slug}`} className="inline-block mt-2 underline">Voir</Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
