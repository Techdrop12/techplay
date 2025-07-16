import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-24 border-t py-12 text-sm text-muted-foreground">
      <div className="container grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-semibold">TechPlay</p>
          <p className="mt-2 max-w-xs text-xs text-muted">Votre boutique high-tech nouvelle génération.</p>
        </div>
        <div>
          <p className="font-semibold">Navigation</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/categorie/accessoires">Catégories</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Infos</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/cgv">CGV</Link></li>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Suivez-nous</p>
          <ul className="mt-2 space-y-1">
            <li><a href="#">Instagram</a></li>
            <li><a href="#">TikTok</a></li>
            <li><a href="#">Facebook</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
