// ✅ /src/lib/validateBody.js (sanitizer simple pour API routes)
export function validateBody(body, required = []) {
  for (const key of required) {
    if (!body[key] || typeof body[key] === 'undefined' || body[key] === null) {
      throw new Error(`Missing required field: ${key}`);
    }
  }
  return true;
}
