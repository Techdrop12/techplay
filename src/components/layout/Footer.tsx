import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center">
        <p>&copy; {new Date().getFullYear()} TechPlay. Tous droits réservés.</p>
        <div className="space-x-4 text-sm">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/cgv">CGV</Link>
        </div>
      </div>
    </footer>
  )
}
