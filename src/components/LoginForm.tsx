"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setPending(false);
    if (!response.ok) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/board");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-zinc-400">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-base text-zinc-100 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-zinc-400">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-base text-zinc-100 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:opacity-60"
      >
        {pending ? "Entering…" : "Open board"}
      </button>
    </form>
  );
}
