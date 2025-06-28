// ✅ /src/lib/isAdmin.js (protection admin, ultra simple)
export default function isAdmin(email) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  return adminEmails.includes(email);
}
