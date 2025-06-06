// src/lib/seoMonitor.js

export async function checkSiteHealth() {
  // Ici on utilise le fetch global de Next 15/Node 18+
  const health = await fetch('https://example.com/health');
  if (!health.ok) {
    console.error('Site health check failed');
    return false;
  }
  return true;
}
