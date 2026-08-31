"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { formatTimestamp, type Task } from "@/lib/types";

type Props = {
  task: Task;
  accent: "stack" | "queue";
  badge?: string;
  onOpen: (task: Task) => void;
};

export function TaskCard({ task, accent, badge, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const tint =
    accent === "stack"
      ? "border-amber-200/20 bg-amber-50/10 hover:bg-amber-50/15"
      : "border-cyan-200/20 bg-cyan-50/10 hover:bg-cyan-50/15";

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`w-full rounded-xl border px-3 py-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${tint} ${
        isDragging ? "z-20 opacity-70" : ""
      }`}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-100">
          {task.text}
        </p>
        {badge ? (
          <span className="shrink-0 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300 uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-[11px] text-zinc-400">
        {formatTimestamp(task.createdAt)}
      </p>
    </button>
  );
}
