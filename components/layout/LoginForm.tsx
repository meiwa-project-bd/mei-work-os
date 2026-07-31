"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          อีเมล
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
