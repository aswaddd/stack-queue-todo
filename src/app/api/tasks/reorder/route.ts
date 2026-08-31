import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isStructure, reorder } from "@/lib/tasks";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    structure?: unknown;
    orderedIds?: unknown;
  };
  if (!isStructure(body.structure) || !Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const orderedIds = body.orderedIds.filter(
    (id): id is string => typeof id === "string",
  );
  try {
    await reorder(body.structure, orderedIds, user.uid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reorder";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
