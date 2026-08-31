import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "sq_session";

export type SessionUser = {
  uid: string;
  email?: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(value);
}

export async function createSession(user: SessionUser = { uid: "local-user" }) {
  const token = await new SignJWT({
    uid: user.uid,
    email: user.email ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const uid = typeof payload.uid === "string" ? payload.uid : "local-user";
    const email = typeof payload.email === "string" ? payload.email : "";
    return { uid, email };
  } catch {
    return null;
  }
}

export async function isLoggedIn() {
  return (await getCurrentUser()) !== null;
}

export function passwordMatches(input: string) {
  const expected = process.env.AUTH_PASSWORD ?? "";
  if (!expected || input.length !== expected.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < input.length; i += 1) {
    mismatch |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
