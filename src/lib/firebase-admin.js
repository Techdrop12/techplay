import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Reconstruction de l’objet credential à partir des variables d’environnement
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Transforme les séquences "\n" en vrais retours à la ligne
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // (optionnel) Si vous utilisez Cloud Storage côté serveur :
      // storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
    console.log('✅ Firebase Admin initialisé');
  } catch (error) {
    console.error('❌ Erreur d’initialisation Firebase Admin :', error);
  }
}

export default admin;
