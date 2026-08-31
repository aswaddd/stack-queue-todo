"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EditDialog } from "@/components/EditDialog";
import { StructurePanel } from "@/components/StructurePanel";
import type { Structure, Task } from "@/lib/types";

type Props = { initialTasks: Task[] };

export function Board({ initialTasks }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [selected, setSelected] = useState<Task | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const stacked = useMemo(
    () => tasks.filter((task) => task.structure === "STACK"),
    [tasks],
  );
  const queued = useMemo(
    () => tasks.filter((task) => task.structure === "QUEUE"),
    [tasks],
  );

  const refresh = useCallback(async () => {
    const response = await fetch("/api/tasks");
    if (!response.ok) {
      setError("Could not load tasks.");
      return;
    }
    const data = (await response.json()) as { tasks: Task[] };
    setTasks(data.tasks);
  }, []);

  async function add(structure: Structure, text: string) {
    setError("");
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structure, text }),
    });
    if (!response.ok) {
      setError("Could not add that task.");
      return;
    }
    await refresh();
  }

  async function pop(structure: Structure) {
    setError("");
    const response = await fetch("/api/tasks/pop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structure }),
    });
    if (!response.ok) {
      setError("Nothing to remove.");
      return;
    }
    await refresh();
  }

  async function reorder(structure: Structure, orderedIds: string[]) {
    setTasks((current) => {
      const others = current.filter((task) => task.structure !== structure);
      const byId = new Map(
        current.filter((task) => task.structure === structure).map((task) => [task.id, task]),
      );
      const next = orderedIds
        .map((id, position) => {
          const task = byId.get(id);
          return task ? { ...task, position } : null;
        })
        .filter((task): task is Task => task !== null);
      return [...others, ...next];
    });
    const response = await fetch("/api/tasks/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structure, orderedIds }),
    });
    if (!response.ok) {
      setError("Could not save the new order.");
      await refresh();
    }
  }

  async function save(id: string, text: string) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      setError("Could not save edits.");
      return;
    }
    setSelected(null);
    await refresh();
  }

  async function remove(id: string) {
    const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not remove that task.");
      return;
    }
    setSelected(null);
    await refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-zinc-500 uppercase">
            Study board
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-50">
            Stack & queue
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            Keep the current thread on the stack. Park waiting work on the
            queue. Click a card to edit it, or drag to change order when a
            subtask jumps the line.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          Log out
        </button>
      </header>

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="grid flex-1 gap-5 lg:grid-cols-2">
        <StructurePanel
          structure="STACK"
          tasks={stacked}
          onAdd={add}
          onPop={pop}
          onReorder={reorder}
          onOpen={setSelected}
        />
        <StructurePanel
          structure="QUEUE"
          tasks={queued}
          onAdd={add}
          onPop={pop}
          onReorder={reorder}
          onOpen={setSelected}
        />
      </div>

      <EditDialog
        task={selected}
        onClose={() => setSelected(null)}
        onSave={save}
        onDelete={remove}
      />
    </div>
  );
}
