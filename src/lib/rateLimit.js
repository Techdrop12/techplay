// src/lib/rateLimit.js

const cache = new Map();

export function rateLimit({ limit = 5, interval = 60_000 }) {
  return (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    const calls = cache.get(ip) || [];
    const recentCalls = calls.filter((time) => now - time < interval);

    if (recentCalls.length >= limit) {
      res.status(429).json({ error: 'Trop de requêtes. Réessaie bientôt.' });
      return false;
    }

    recentCalls.push(now);
    cache.set(ip, recentCalls);
    return true;
  };
}
