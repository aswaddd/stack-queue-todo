import { prisma } from "@/lib/prisma";

export const STRUCTURES = ["STACK", "QUEUE"] as const;
export type Structure = (typeof STRUCTURES)[number];
export type TaskRecord = Awaited<ReturnType<typeof prisma.task.findMany>>[number];

export type BoardTaskInput = {
  id?: string;
  text: string;
  structure: Structure;
  position: number;
  createdAt?: string;
};

export function isStructure(value: unknown): value is Structure {
  return value === "STACK" || value === "QUEUE";
}

export async function listTasks(userId = "local-user"): Promise<TaskRecord[]> {
  return prisma.task.findMany({
    where: { userId },
    orderBy: [{ structure: "asc" }, { position: "asc" }],
  });
}

export async function replaceTasks(
  tasks: BoardTaskInput[],
  userId = "local-user",
): Promise<void> {
  const normalized = tasks.map((task, index) => {
    const trimmed = task.text.trim();
    if (!trimmed) {
      throw new Error("Task text is required");
    }
    if (!isStructure(task.structure)) {
      throw new Error("Invalid structure");
    }

    const safePosition = Number.isFinite(task.position) ? task.position : index;

    return {
      id: task.id ?? crypto.randomUUID(),
      text: trimmed,
      structure: task.structure,
      position: safePosition,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    };
  });

  const records = [
    ...normalized
      .filter((task) => task.structure === "STACK")
      .sort((a, b) => a.position - b.position)
      .map((task, index) => ({ ...task, position: index })),
    ...normalized
      .filter((task) => task.structure === "QUEUE")
      .sort((a, b) => a.position - b.position)
      .map((task, index) => ({ ...task, position: index })),
  ];

  await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { userId } });

    if (records.length === 0) {
      return;
    }

    await tx.task.createMany({
      data: records.map((task) => ({
        id: task.id,
        text: task.text,
        structure: task.structure,
        position: task.position,
        userId,
        createdAt: task.createdAt,
      })),
    });
  });
}

export async function reindex(
  structure: Structure,
  userId = "local-user",
): Promise<void> {
  const tasks: TaskRecord[] = await prisma.task.findMany({
    where: { structure, userId },
    orderBy: { position: "asc" },
  });

  await prisma.$transaction(
    tasks.map((task: TaskRecord, index: number) =>
      prisma.task.update({
        where: { id: task.id },
        data: { position: index },
      }),
    ),
  );
}

export async function addTask(
  structure: Structure,
  text: string,
  userId = "local-user",
) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Task text is required");
  }

  if (structure === "STACK") {
    await prisma.task.updateMany({
      where: { userId, structure: "STACK" },
      data: { position: { increment: 1 } },
    });
    return prisma.task.create({
      data: { text: trimmed, structure, position: 0, userId },
    });
  }

  const last = await prisma.task.aggregate({
    where: { userId, structure: "QUEUE" },
    _max: { position: true },
  });
  const position = (last._max.position ?? -1) + 1;
  return prisma.task.create({
    data: { text: trimmed, structure, position, userId },
  });
}

export async function removeEnd(structure: Structure, userId = "local-user") {
  const task = await prisma.task.findFirst({
    where: { structure, userId },
    orderBy: { position: "asc" },
  });
  if (!task) return null;
  await prisma.task.delete({ where: { id: task.id } });
  await reindex(structure, userId);
  return task;
}

export async function updateTask(id: string, text: string, userId = "local-user") {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Task not found");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Task text is required");
  }
  return prisma.task.update({
    where: { id },
    data: { text: trimmed },
  });
}

export async function deleteTask(id: string, userId = "local-user") {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return null;
  await prisma.task.delete({ where: { id } });
  await reindex(existing.structure as Structure, existing.userId);
  return existing;
}

export async function reorder(
  structure: Structure,
  orderedIds: string[],
  userId = "local-user",
): Promise<void> {
  const existing = await prisma.task.findMany({
    where: { structure, userId },
    select: { id: true },
  });
  const existingIds = new Set<string>(existing.map((task: { id: string }) => task.id));
  if (
    orderedIds.length !== existingIds.size ||
    orderedIds.some((id: string) => !existingIds.has(id))
  ) {
    throw new Error("Order does not match current tasks");
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.task.update({
        where: { id },
        data: { position: index },
      }),
    ),
  );
}
