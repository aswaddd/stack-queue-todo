"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormEvent, useState } from "react";
import { TaskCard } from "@/components/TaskCard";
import type { Structure, Task } from "@/lib/types";

type Props = {
  structure: Structure;
  tasks: Task[];
  onAdd: (structure: Structure, text: string) => Promise<void>;
  onPop: (structure: Structure) => Promise<void>;
  onReorder: (structure: Structure, orderedIds: string[]) => Promise<void>;
  onOpen: (task: Task) => void;
};

export function StructurePanel({
  structure,
  tasks,
  onAdd,
  onPop,
  onReorder,
  onOpen,
}: Props) {
  const isStack = structure === "STACK";
  const [draft, setDraft] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    setDraft("");
    await onAdd(structure, value);
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = tasks.map((task) => task.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    await onReorder(structure, arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <section
      className={`flex min-h-[32rem] flex-col rounded-3xl border p-5 ${
        isStack
          ? "border-amber-300/20 bg-gradient-to-b from-amber-950/40 to-zinc-950"
          : "border-cyan-300/20 bg-gradient-to-b from-cyan-950/40 to-zinc-950"
      }`}
    >
      <header className="mb-4">
        <p
          className={`text-xs font-semibold tracking-[0.25em] uppercase ${
            isStack ? "text-amber-300" : "text-cyan-300"
          }`}
        >
          {isStack ? "LIFO" : "FIFO"}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          {isStack ? "Stack" : "Queue"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {isStack
            ? "Push lands on top. Pop takes the top card. Drag to reshuffle depth."
            : "Enqueue joins the back. Dequeue leaves from the front. Drag to cut the line."}
        </p>
      </header>

      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isStack ? "Push a subtask…" : "Enqueue a subtask…"}
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none ring-white/20 focus:ring-2"
        />
        <button
          type="submit"
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${
            isStack ? "bg-amber-300 text-zinc-950" : "bg-cyan-300 text-zinc-950"
          }`}
        >
          {isStack ? "Push" : "Enqueue"}
        </button>
        <button
          type="button"
          onClick={() => onPop(structure)}
          disabled={tasks.length === 0}
          className="rounded-xl border border-white/15 px-3 py-2 text-sm text-zinc-200 disabled:opacity-40"
        >
          {isStack ? "Pop" : "Dequeue"}
        </button>
      </form>

      <div className="mb-3 flex justify-between text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
        <span>{isStack ? "Top" : "Front"}</span>
        <span>{isStack ? "Bottom" : "Back"}</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={
            isStack
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          <div
            className={
              isStack
                ? "flex flex-1 flex-col gap-2"
                : "flex flex-1 flex-row flex-wrap content-start gap-2"
            }
          >
            {tasks.length === 0 ? (
              <div className="flex min-h-40 flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-500">
                {isStack ? "Stack is empty" : "Queue is empty"}
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={isStack ? "w-full" : "min-w-[14rem] flex-1"}
                >
                  <TaskCard
                    task={task}
                    accent={isStack ? "stack" : "queue"}
                    badge={
                      index === 0
                        ? isStack
                          ? "top"
                          : "front"
                        : index === tasks.length - 1
                          ? isStack
                            ? "bottom"
                            : "back"
                          : undefined
                    }
                    onOpen={onOpen}
                  />
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
