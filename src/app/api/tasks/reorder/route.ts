import { NextResponse } from "next/server";
import { isStructure, reorder } from "@/lib/tasks";

export async function PUT(request: Request) {
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
    await reorder(body.structure, orderedIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reorder";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
