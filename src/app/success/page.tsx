import Link from '@/components/LocalizedLink'

export default function SuccessPage() {
  return (
    <main className="container-app flex min-h-screen flex-col items-center justify-center py-16" role="main" aria-labelledby="success-title">
      <div className="card w-full max-w-md p-8 text-center shadow-[var(--shadow-xl)] sm:p-10">
        <h1 id="success-title" className="text-2xl font-extrabold tracking-tight text-[hsl(var(--accent))] sm:text-3xl [letter-spacing:var(--heading-tracking)]">
          Commande validée
        </h1>
        <p className="mt-3 text-[var(--step-0)] text-token-text/75">
          Merci pour votre achat ! Vous recevrez un email de confirmation dans quelques instants.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-premium rounded-full px-6 py-2.5 text-[15px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]">
            Retour à l&apos;accueil
          </Link>
          <Link href="/products" className="btn-outline rounded-full px-6 py-2.5 text-[15px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.4)]" prefetch={false}>
            Continuer mes achats
          </Link>
        </div>
      </div>
    </main>
  )
}
