import admin from '../../lib/firebase-admin';

export default function handler(req, res) {
  try {
    const initialized = admin.apps.length > 0;
    return res.status(200).json({ initialized, apps: admin.apps.map((a) => a.name) });
  } catch (err) {
    return res.status(500).json({ initialized: false, error: err.message });
  }
}
