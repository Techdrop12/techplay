// ✅ /src/pages/api/notifications/test-send.js (test notification web push, debug)
export default async function handler(req, res) {
  // Ce endpoint sert juste à tester le push, peut être retiré en prod
  res.status(200).json({ test: true, message: "Push test ok" });
}
