import Link from 'next/link';
import Garanties from './Garanties';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t mt-12 text-sm text-gray-700 dark:bg-zinc-900 dark:text-gray-300"
      aria-label="Pied de page du site TechPlay"
    >
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <p>&copy; {currentYear} TechPlay. Tous droits réservés.</p>
          <div className="flex gap-4 mt-2 flex-wrap justify-center sm:justify-start">
            <Link href="/a-propos" className="hover:text-black dark:hover:text-white">
              À propos
            </Link>
            <Link href="/mentions-legales" className="hover:text-black dark:hover:text-white">
              Mentions légales
            </Link>
            <a
              href="mailto:contact@techplay.com"
              className="hover:text-black dark:hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
          Propulsé avec ❤️ par TechPlay
        </div>
      </div>

      <div className="px-4">
        <Garanties />
      </div>
    </footer>
  );
}
