import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isStructure, removeEnd } from "@/lib/tasks";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { structure?: unknown };
  if (!isStructure(body.structure)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const task = await removeEnd(body.structure, user.uid);
  if (!task) {
    return NextResponse.json({ error: "Structure is empty" }, { status: 400 });
  }
  return NextResponse.json({ task });
}
