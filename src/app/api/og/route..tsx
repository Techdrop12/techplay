/* OG dynamiques pour /products (Edge) */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Catalogue TechPlay'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

function chip(label: string) {
  return (
    <div
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(0,0,0,0.25)',
        fontSize: 24,
      }}
    >
      {label}
    </div>
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const sort = searchParams.get('sort') || 'new'
  const min = searchParams.get('min')
  const max = searchParams.get('max')
  const page = Number(searchParams.get('page') || '1')

  const chips: string[] = []
  if (q) chips.push(`Recherche: “${q}”`)
  if (min) chips.push(`Min: ${min}€`)
  if (max) chips.push(`Max: ${max}€`)
  if (sort && sort !== 'new') chips.push(`Tri: ${sort}`)
  if (page > 1) chips.push(`Page ${page}`)

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
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 32, opacity: 0.8 }}>techplay</div>
          <div style={{ fontSize: 22, opacity: 0.6 }}>Catalogue</div>
        </div>

        <div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
            Tous les produits – TechPlay
          </div>
          <div style={{ marginTop: 16, fontSize: 28, opacity: 0.9 }}>
            Livraison rapide • Innovation garantie
          </div>

          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              {chips.slice(0, 5).map((c, i) => <div key={i}>{chip(c)}</div>)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, opacity: 0.3 }}>
          {/* grille fantôme pour “rappeler” des cartes produits */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 168,
                height: 168,
                borderRadius: 24,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
      </div>
    ),
    size
  )
}
