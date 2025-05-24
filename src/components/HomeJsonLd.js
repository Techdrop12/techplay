export default function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "TechPlay",
    "url": "https://www.techplay.com",
    "logo": "https://www.techplay.com/logo.png",
    "sameAs": [
      "https://www.facebook.com/techplay",
      "https://twitter.com/techplay",
      "https://www.instagram.com/techplay"
    ],
    "description": "TechPlay 🛒 Boutique high-tech proposant une sélection des meilleurs produits.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Rue de la Technologie",
      "addressLocality": "Paris",
      "postalCode": "75001",
      "addressCountry": "FR"
    },
    "telephone": "+33 1 23 45 67 89",
    "openingHours": "Mo,Tu,We,Th,Fr 09:00-18:00",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.techplay.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
