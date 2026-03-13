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
    <main className="max-w-4xl mx-auto px-4 py-16" aria-labelledby="categories-title" id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <h1 id="categories-title" className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
        Catégories produits
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
        Choisissez une catégorie pour découvrir nos produits high-tech : audio, gaming, bureautique et plus.
      </p>

      <nav aria-label="Catégories" className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categorie/${cat.slug}`}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[hsl(var(--accent))] hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
          >
            <span className="font-semibold text-gray-900 dark:text-white group-hover:text-[hsl(var(--accent))]">
              {cat.label}
            </span>
            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">{cat.description}</span>
          </Link>
        ))}
      </nav>

      <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link href="/products" className="underline underline-offset-2 hover:text-[hsl(var(--accent))]">
          Voir tout le catalogue
        </Link>
      </p>
    </main>
  )
}
