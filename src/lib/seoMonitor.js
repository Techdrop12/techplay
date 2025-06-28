// ✅ /src/lib/seoMonitor.js (bonus SEO audit auto)
export function reportSEOIssue(msg) {
  if (typeof window !== 'undefined') {
    console.warn('[SEO Monitor]', msg);
    // Possibilité d’envoyer à un endpoint si besoin
  }
}
