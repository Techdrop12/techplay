export default function isAdmin(email) {
  if (!email) return false
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const domain = (process.env.ADMIN_DOMAIN || '').toLowerCase()
  const e = String(email).toLowerCase()
  if (list.includes(e)) return true
  if (domain && e.endsWith('@' + domain)) return true
  return false
}
