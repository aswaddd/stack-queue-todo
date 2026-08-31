import { NextResponse } from "next/server";
import { createSession, passwordMatches } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (!passwordMatches(body.password ?? "")) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
