import { Board } from "@/components/Board";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";
import { redirect } from "next/navigation";

export default async function BoardPage() {
  if (!(await isLoggedIn())) {
    redirect("/");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const tasks: Awaited<ReturnType<typeof listTasks>> = await listTasks(user.uid);

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950">
      <Board
        initialTasks={tasks.map((task: Awaited<ReturnType<typeof listTasks>>[number]) => ({
          ...task,
          structure: task.structure as "STACK" | "QUEUE",
          createdAt: task.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
