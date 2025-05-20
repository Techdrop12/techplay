import Head from 'next/head'

export default function SEOHead({
  title = 'TechPlay - Produits Tech Innovants',
  description = 'TechPlay propose les meilleurs produits high-tech en dropshipping. Livraison rapide, paiement sécurisé et nouveautés chaque semaine.',
  image = '/favicon.ico',
  url = 'https://www.techplay.com',
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  )
}
