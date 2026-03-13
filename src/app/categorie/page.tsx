import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'
import { generateMeta, jsonLdBreadcrumbs, jsonLdItemList } from '@/lib/seo'

export const revalidate = 3600

const CATEGORIES: { slug: string; label: string; description: string }[] = [
  { slug: 'casques', label: 'Casques', description: 'Casques audio, écouteurs et headsets gaming.' },
  { slug: 'claviers', label: 'Claviers', description: 'Claviers mécaniques et bureautique.' },
  { slug: 'souris', label: 'Souris', description: 'Souris gamer et bureautique.' },
  { slug: 'webcams', label: 'Webcams', description: 'Webcams HD pour visio et streaming.' },
  { slug: 'batteries', label: 'Batteries', description: 'Batteries externes et chargeurs.' },
  { slug: 'audio', label: 'Audio', description: 'Enceintes et équipement audio.' },
  { slug: 'stockage', label: 'Stockage', description: 'SSD, clés USB et cartes mémoire.' },
  { slug: 'ecrans', label: 'Écrans', description: 'Moniteurs et écrans PC.' },
]

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: 'Catégories produits – TechPlay',
    description:
      'Parcourez les catégories TechPlay : casques, claviers, souris, audio, stockage, écrans. Trouvez le produit high-tech qu\'il vous faut.',
    url: '/categorie',
    image: '/og-image.jpg',
  })
}

export default function CategoryIndexPage() {
  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: '/' },
    { name: 'Catégories', url: '/categorie' },
  ])

  const itemList = jsonLdItemList({
    name: 'Catégories produits TechPlay',
    description: 'Liste des catégories de produits high-tech.',
    url: '/categorie',
    items: CATEGORIES.map((c) => ({ name: c.label, url: `/categorie/${c.slug}` })),
  })

  return (
    <main className="container-app mx-auto max-w-4xl py-10 sm:py-12" aria-labelledby="categories-title" id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <h1 id="categories-title" className="heading-page mb-2">
        Catégories produits
      </h1>
      <p className="mb-10 text-[15px] text-token-text/75">
        Choisissez une catégorie pour découvrir nos produits high-tech : audio, gaming, bureautique et plus.
      </p>

      <nav aria-label="Catégories" className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categorie/${cat.slug}`}
            className="group flex flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-sm)] transition hover:border-[hsl(var(--accent)/.4)] hover:shadow-[var(--shadow-md)]"
          >
            <span className="font-semibold text-[hsl(var(--text))] transition group-hover:text-[hsl(var(--accent))]">
              {cat.label}
            </span>
            <span className="mt-1 text-[13px] text-token-text/65">{cat.description}</span>
          </Link>
        ))}
      </nav>

      <p className="mt-10 text-center text-[13px] text-token-text/60">
        <Link href="/products" className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline" prefetch={false}>
          Voir tout le catalogue
        </Link>
      </p>
    </main>
  )
}
