import { LoginForm } from "@/components/LoginForm";
import { isLoggedIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await isLoggedIn()) {
    redirect("/board");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#3f2e15_0%,_#09090b_42%)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold tracking-[0.28em] text-amber-300/80 uppercase">
          Personal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
          Stack & queue
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          A study board for the current thread of work (stack) and the things
          waiting in line (queue).
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
