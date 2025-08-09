import admin from "firebase-admin";

if (!process.env.FIREBASE_CONNECTION) {
  throw new Error("FIREBASE_CONNECTION environment variable is not set");
}
var serviceAccount = JSON.parse(process.env.FIREBASE_CONNECTION);

if (admin.apps.length == 0){
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });  
  }
  
  const firestoreAdmin = admin.firestore();
  export { firestoreAdmin };
