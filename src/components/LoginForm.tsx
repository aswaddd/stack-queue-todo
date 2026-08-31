"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  firebaseEnabled,
  signInWithFirebase,
  signInWithGoogleFirebase,
  signUpWithFirebase,
} from "@/lib/firebase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function finishLoginSession(uid: string, emailValue: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        email: emailValue,
        provider: "firebase",
      }),
    });

    if (!response.ok) {
      throw new Error("Could not create your session.");
    }

    router.push("/board");
    router.refresh();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      if (firebaseEnabled) {
        const user =
          mode === "signUp"
            ? await signUpWithFirebase(email, password)
            : await signInWithFirebase(email, password);
        await finishLoginSession(user.uid, user.email ?? email);
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, mode }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({ error: "Invalid email or password." }))) as { error?: string };
        setError(data.error ?? "Invalid email or password.");
        return;
      }

      router.push("/board");
      router.refresh();
    } catch {
      setError(
        mode === "signUp"
          ? "Could not create account. Try again."
          : "Invalid email or password.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onGoogleSignIn() {
    setPending(true);
    setError("");

    try {
      if (!firebaseEnabled) {
        setError("Google sign-in requires Firebase configuration.");
        return;
      }

      const user = await signInWithGoogleFirebase();
      await finishLoginSession(user.uid, user.email ?? "");
    } catch {
      setError("Google sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex rounded-xl border border-white/10 bg-zinc-900/80 p-1">
        {(["signIn", "signUp"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={[
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
              value === mode
                ? "bg-amber-300 text-zinc-950"
                : "text-zinc-400 hover:text-zinc-200",
            ].join(" ")}
          >
            {value === "signIn" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={pending}
        className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-60"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>

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
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
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
          {pending
            ? mode === "signUp"
              ? "Creating account…"
              : "Signing in…"
            : mode === "signUp"
              ? "Create account"
              : "Open board"}
        </button>
      </form>
    </div>
  );
}
