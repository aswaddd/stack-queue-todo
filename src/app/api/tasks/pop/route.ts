import { NextResponse } from "next/server";
import { isStructure, removeEnd } from "@/lib/tasks";

export async function POST(request: Request) {
  const body = (await request.json()) as { structure?: unknown };
  if (!isStructure(body.structure)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const task = await removeEnd(body.structure);
  if (!task) {
    return NextResponse.json({ error: "Structure is empty" }, { status: 400 });
  }
  return NextResponse.json({ task });
}
