import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addTask, isStructure, listTasks, replaceTasks } from "@/lib/tasks";

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

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { tasks?: unknown };
  if (!Array.isArray(body.tasks)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const tasks = body.tasks.map((task) => {
      if (!task || typeof task !== "object") {
        throw new Error("Task is invalid");
      }

      const candidate = task as {
        id?: unknown;
        text?: unknown;
        structure?: unknown;
        position?: unknown;
        createdAt?: unknown;
      };

      if (!candidate.text || typeof candidate.text !== "string") {
        throw new Error("Task text is required");
      }
      if (!isStructure(candidate.structure)) {
        throw new Error("Task structure is invalid");
      }
      if (typeof candidate.position !== "number" || Number.isNaN(candidate.position)) {
        throw new Error("Task position is invalid");
      }
      if (candidate.createdAt !== undefined && typeof candidate.createdAt !== "string") {
        throw new Error("Task createdAt is invalid");
      }

      return {
        id: typeof candidate.id === "string" ? candidate.id : undefined,
        text: candidate.text,
        structure: candidate.structure,
        position: candidate.position,
        createdAt: candidate.createdAt,
      };
    });

    await replaceTasks(tasks, user.uid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save tasks";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
