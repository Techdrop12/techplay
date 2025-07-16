const ipCache = new Map<string, { count: number; lastRequest: number }>()

export function rateLimit(ip: string, limit = 5, interval = 60_000): boolean {
  const now = Date.now()
  const data = ipCache.get(ip) || { count: 0, lastRequest: 0 }

  if (now - data.lastRequest > interval) {
    data.count = 1
    data.lastRequest = now
  } else {
    data.count += 1
  }

  ipCache.set(ip, data)
  return data.count <= limit
}
