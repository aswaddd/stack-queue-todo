import { NextResponse } from "next/server";
import { addTask, isStructure, listTasks } from "@/lib/tasks";

export async function GET() {
  const tasks = await listTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    structure?: unknown;
    text?: unknown;
  };
  if (!isStructure(body.structure) || typeof body.text !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  try {
    const task = await addTask(body.structure, body.text);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
