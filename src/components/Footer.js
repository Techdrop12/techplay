import Link from 'next/link'
import Garanties from './Garanties'

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 text-sm text-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center sm:items-start">
          <p>&copy; {new Date().getFullYear()} TechPlay. Tous droits réservés.</p>
          <div className="flex gap-4 mt-2">
            <Link href="/a-propos" className="hover:text-black">À propos</Link>
            <Link href="/mentions-legales" className="hover:text-black">Mentions légales</Link>
            <a href="mailto:contact@techplay.com" className="hover:text-black">Contact</a>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Propulsé avec ❤️ par TechPlay
        </div>
      </div>

      <div className="px-4">
        <Garanties />
      </div>
    </footer>
  )
}
