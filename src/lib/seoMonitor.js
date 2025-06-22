// ✅ src/lib/seoMonitor.js

export async function checkSiteHealth() {
  try {
    const health = await fetch('https://example.com/health')
    return health.ok
  } catch (error) {
    console.error('Site health check failed:', error)
    return false
  }
}
