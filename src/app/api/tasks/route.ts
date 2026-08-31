import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addTask, isStructure, listTasks } from "@/lib/tasks";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await listTasks(user.uid);
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    structure?: unknown;
    text?: unknown;
  };
  if (!isStructure(body.structure) || typeof body.text !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  try {
    const task = await addTask(body.structure, body.text, user.uid);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
