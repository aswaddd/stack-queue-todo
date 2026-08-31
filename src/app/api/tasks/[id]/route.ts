import { NextResponse } from "next/server";
import { deleteTask, updateTask } from "@/lib/tasks";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as { text?: unknown };
  if (typeof body.text !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  try {
    const task = await updateTask(id, body.text);
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const task = await deleteTask(id);
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ task });
}
