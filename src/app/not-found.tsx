// src/app/not-found.tsx
import NotFoundPageContent from '@/components/NotFoundPageContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Page introuvable – TechPlay',
  description: 'La page demandée n\'existe pas ou a été déplacée.',
  robots: { index: false, follow: true },
}

export default function NotFoundPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-5xl px-4 pt-32 pb-24 text-center"
      aria-labelledby="nf-title"
      role="main"
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-lg)]">
        <NotFoundPageContent />
      </div>
    </main>
  )
}
