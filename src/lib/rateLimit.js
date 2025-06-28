// ✅ /src/lib/rateLimit.js (middleware rate limiting pour API Next.js)
const rateLimiters = {};

export default function rateLimit(key, limit = 10, interval = 60000) {
  if (!rateLimiters[key]) {
    rateLimiters[key] = { count: 1, time: Date.now() };
    return false; // pas bloqué
  }
  const entry = rateLimiters[key];
  if (Date.now() - entry.time > interval) {
    entry.count = 1;
    entry.time = Date.now();
    return false;
  }
  entry.count += 1;
  if (entry.count > limit) {
    return true; // bloqué
  }
  return false;
}
