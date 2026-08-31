"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatTimestamp, type Task } from "@/lib/types";

type Props = {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function EditDialog({ task, onClose, onSave, onDelete }: Props) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setText(task?.text ?? "");
  }, [task]);

  if (!task) return null;
  const currentTask = task;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    await onSave(currentTask.id, text);
    setPending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl"
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          {currentTask.structure === "STACK" ? "Stack item" : "Queue item"}
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-400">
          Added {formatTimestamp(currentTask.createdAt)}
        </p>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none ring-amber-400/30 focus:ring-2"
        />
        <div className="mt-4 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              await onDelete(currentTask.id);
              setPending(false);
            }}
            className="rounded-xl border border-rose-400/30 px-4 py-2 text-sm text-rose-300 hover:bg-rose-400/10"
          >
            Remove
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
