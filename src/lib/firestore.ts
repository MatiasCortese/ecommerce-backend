// lib/firestore.ts o donde inicialices Firebase

import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountRaw = process.env.FIREBASE_CONNECTION;

  if (!serviceAccountRaw) {
    throw new Error('FIREBASE_CONNECTION env variable is not defined');
  }

  const parsed = JSON.parse(serviceAccountRaw);

  // Importante: reemplazar los \n por saltos de línea reales
  if (parsed.private_key?.includes('\\n')) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}

export const firestoreAdmin = admin.firestore();

