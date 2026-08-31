import { NextResponse } from "next/server";
import { createSession, passwordMatches } from "@/lib/auth";
import {
  firebaseEnabled,
  signInWithFirebase,
  signUpWithFirebase,
} from "@/lib/firebase";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    uid?: string;
    provider?: string;
    mode?: "signIn" | "signUp";
  };

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const uid = typeof body.uid === "string" ? body.uid : "";
  const mode = body.mode === "signUp" ? "signUp" : "signIn";

  if (uid && body.provider) {
    await createSession({
      uid,
      email: email || "firebase-user",
    });
    return NextResponse.json({ ok: true });
  }

  if (firebaseEnabled && email) {
    try {
      const user =
        mode === "signUp"
          ? await signUpWithFirebase(email, password)
          : await signInWithFirebase(email, password);
      await createSession({
        uid: user.uid,
        email: user.email ?? email,
      });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { error: mode === "signUp" ? "Could not create account." : "Invalid email or password" },
        { status: 401 },
      );
    }
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  await createSession({
    uid: mode === "signUp" ? `local-user-${Date.now()}` : "local-user",
    email: email || "local-user@local",
  });
  return NextResponse.json({ ok: true });
}
