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
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
    setDirty(false);
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
    setDirty(false);
  }, []);

  const persist = useCallback(async () => {
    const payload = [
      ...stacked.map((task, position) => ({ ...task, position, structure: "STACK" as const })),
      ...queued.map((task, position) => ({ ...task, position, structure: "QUEUE" as const })),
    ];

    setSaving(true);
    setError("");

    const response = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: payload }),
    });

    setSaving(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not save the board.");
      return;
    }

    await refresh();
  }, [queued, refresh, stacked]);

  async function add(structure: Structure, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError("");
    const nextTask: Task = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
      structure,
      position: 0,
    };

    setTasks((current) => {
      const sameStructure = current.filter((task) => task.structure === structure);
      const otherStructure = current.filter((task) => task.structure !== structure);
      if (structure === "STACK") {
        return [...otherStructure, nextTask, ...sameStructure];
      }
      return [...otherStructure, ...sameStructure, nextTask];
    });
    setDirty(true);
  }

  async function pop(structure: Structure) {
    setError("");
    setTasks((current) => {
      const sameStructure = current.filter((task) => task.structure === structure);
      if (sameStructure.length === 0) {
        return current;
      }

      const [, ...rest] = sameStructure;
      const others = current.filter((task) => task.structure !== structure);
      return [...others, ...rest];
    });
    setDirty(true);
  }

  async function reorder(structure: Structure, orderedIds: string[]) {
    setTasks((current) => {
      const others = current.filter((task) => task.structure !== structure);
      const byId = new Map(
        current.filter((task) => task.structure === structure).map((task) => [task.id, task]),
      );
      const next = orderedIds
        .map((id) => byId.get(id))
        .filter((task): task is Task => task !== undefined);
      return [...others, ...next];
    });
    setDirty(true);
  }

  async function save(id: string, text: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              text,
            }
          : task,
      ),
    );
    setSelected(null);
    setDirty(true);
  }

  async function remove(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setSelected(null);
    setDirty(true);
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
        <div className="flex items-center gap-2">
          {dirty ? (
            <button
              type="button"
              onClick={persist}
              disabled={saving}
              className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving…" : "Save board"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Log out
          </button>
        </div>
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
