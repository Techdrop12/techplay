/* src/app/api/og/route.tsx
   OG dynamiques pour /products (Edge) — version premium (chips, robustesse, i18n FR/EN)
*/
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Catalogue TechPlay'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

// ——— Utils ———
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

function chip(label: string) {
  return (
    <div
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.28)',
        background: 'rgba(0,0,0,0.28)',
        fontSize: 24,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {label}
    </div>
  )
}

function toHumanSort(v: string, lang: 'fr' | 'en') {
  const map: Record<string, { fr: string; en: string }> = {
    new: { fr: 'Nouveautés', en: 'Newest' },
    price_asc: { fr: 'Prix ↑', en: 'Price ↑' },
    price_desc: { fr: 'Prix ↓', en: 'Price ↓' },
    rating: { fr: 'Meilleures notes', en: 'Top rated' },
    promo: { fr: 'Promotions', en: 'Promotions' },
  }
  return map[v]?.[lang] ?? v
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // ——— Query params (robustes) ———
    const q = truncate((searchParams.get('q') || '').trim(), 60)
    const sort = (searchParams.get('sort') || 'new').trim()
    const min = (searchParams.get('min') || '').trim()
    const max = (searchParams.get('max') || '').trim()
    const cat = truncate((searchParams.get('cat') || '').trim(), 36)
    const page = clamp(Number(searchParams.get('page') || '1'), 1, 9999)

    // ——— Lang minimal (déduit grossièrement de l’hôte/UA si besoin) ———
    // On reste simple: si host finit par /en ou param lang=en → EN, sinon FR.
    const lang: 'fr' | 'en' = (searchParams.get('lang') || '').startsWith('en') ? 'en' : 'fr'

    // ——— Chips à afficher ———
    const chips: string[] = []
    if (q) chips.push(`${lang === 'en' ? 'Search' : 'Recherche'}: “${q}”`)
    if (cat) chips.push(`${lang === 'en' ? 'Category' : 'Catégorie'}: ${cat}`)
    if (min) chips.push(`${lang === 'en' ? 'Min' : 'Min'}: ${min}€`)
    if (max) chips.push(`${lang === 'en' ? 'Max' : 'Max'}: ${max}€`)
    if (sort && sort !== 'new') chips.push(`${lang === 'en' ? 'Sort' : 'Tri'}: ${toHumanSort(sort, lang)}`)
    if (page > 1) chips.push(`${lang === 'en' ? 'Page' : 'Page'} ${page}`)

    const title =
      lang === 'en' ? 'All Products' : 'Tous les produits'
    const subtitle =
      lang === 'en' ? 'Fast delivery • Innovation guaranteed' : 'Livraison rapide • Innovation garantie'
    const kicker =
      lang === 'en' ? 'Catalog' : 'Catalogue'
    const brand = 'TechPlay' // Si tu veux, expose NEXT_PUBLIC_SITE_NAME et remplace ici.

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background:
              'linear-gradient(135deg, #0f172a 0%, #111827 35%, #1f2937 100%)',
            color: 'white',
            padding: 48,
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 32, opacity: 0.9, fontWeight: 800 }}>{brand}</div>
            <div style={{ fontSize: 22, opacity: 0.7 }}>{kicker}</div>
          </div>

          {/* Middle */}
          <div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: -1,
                // léger effet dégradé
                backgroundImage: 'linear-gradient(180deg, #fff, rgba(255,255,255,0.88))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {title}
            </div>
            <div style={{ marginTop: 16, fontSize: 28, opacity: 0.9 }}>
              {subtitle}
            </div>

            {chips.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', maxWidth: 1000 }}>
                {chips.slice(0, 6).map((c, i) => (
                  <div key={i}>{chip(c)}</div>
                ))}
              </div>
            )}
          </div>

          {/* Ghost grid (produits) */}
          <div style={{ display: 'flex', gap: 10, opacity: 0.32 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 168,
                  height: 168,
                  borderRadius: 24,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              />
            ))}
          </div>
        </div>
      ),
      size
    )
  } catch (err) {
    // Fallback OG (évite 500)
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: 'white',
            fontSize: 48,
            fontWeight: 800,
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI',
          }}
        >
          TechPlay
        </div>
      ),
      size
    )
  }
}
