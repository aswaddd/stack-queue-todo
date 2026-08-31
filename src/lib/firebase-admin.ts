import admin from "firebase-admin";

const hasServiceAccount = Boolean(
  process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_PROJECT_ID,
);

if (hasServiceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function verifyFirebaseToken(token: string) {
  if (!hasServiceAccount) {
    throw new Error("Firebase Admin is not configured.");
  }

  return admin.auth().verifyIdToken(token);
}
