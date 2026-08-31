import { initializeApp, getApps } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(
  config.apiKey && config.authDomain && config.projectId,
);

export const firebaseApp =
  firebaseEnabled && getApps().length === 0 ? initializeApp(config) : undefined;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export async function signInWithFirebase(email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase is not configured.");
  }

  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );

  return credential.user;
}

export async function signUpWithFirebase(email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase is not configured.");
  }

  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );

  return credential.user;
}

export async function signInWithGoogleFirebase() {
  if (!firebaseAuth) {
    throw new Error("Firebase is not configured.");
  }

  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(firebaseAuth, provider);
  return credential.user;
}
