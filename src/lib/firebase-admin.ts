export async function verifyFirebaseToken(_token: string) {
  throw new Error(
    "Firebase Admin is not configured for this app. This project uses client-side Firebase sign-in only.",
  );
}
