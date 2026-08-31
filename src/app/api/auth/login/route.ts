import { NextResponse } from "next/server";
import { createSession, passwordMatches } from "@/lib/auth";
import { firebaseEnabled, signInWithFirebase } from "@/lib/firebase";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (firebaseEnabled && email) {
    try {
      const user = await signInWithFirebase(email, password);
      await createSession({
        uid: user.uid,
        email: user.email ?? email,
      });
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  await createSession({
    uid: "local-user",
    email: email || "local-user@local",
  });
  return NextResponse.json({ ok: true });
}
