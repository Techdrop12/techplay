import type { Metadata } from 'next'
import Link from 'next/link'

type Props = { params: { id: string } }

export function generateMetadata({ params }: Props): Metadata {
  const { id } = params
  return {
    title: `Commande #${id} – TechPlay`,
    description: `Détails de la commande n°${id} sur TechPlay.`,
    alternates: { canonical: `/account/mes-commandes/${id}` },
  }
}

export default function OrderDetailPage({ params }: Props) {
  const orderId = params.id

  return (
    <main
      className="max-w-2xl mx-auto px-4 pt-28 pb-20"
      aria-labelledby="order-title"
      role="main"
    >
      <div className="mb-6">
        <Link
          href="/account/mes-commandes"
          className="text-sm text-accent hover:underline"
          aria-label="Retour à la liste de mes commandes"
        >
          ← Retour à mes commandes
        </Link>
      </div>

      <h1
        id="order-title"
        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand dark:text-brand-light"
      >
        Commande #{orderId}
      </h1>

      <p className="mt-3 text-muted-foreground">
        Détails de la commande à venir…
      </p>

      {/* TODO: Infos, lignes, adresse, facture, suivi colis, etc. */}
      <section
        className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
        aria-label="Résumé de la commande"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Résumé indisponible pour le moment.
        </p>
      </section>
    </main>
  )
}
