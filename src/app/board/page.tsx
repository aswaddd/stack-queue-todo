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

  const tasks = await listTasks(user.uid);

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950">
      <Board
        initialTasks={tasks.map((task) => ({
          ...task,
          structure: task.structure as "STACK" | "QUEUE",
          createdAt: task.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
