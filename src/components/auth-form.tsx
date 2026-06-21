"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions";
import { loginAction, signupAction } from "@/app/actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signupAction, {});
  return (
    <form action={action} className="card grid gap-3">
      <input className="field" name="name" placeholder="Name" required />
      <input className="field" name="email" type="email" placeholder="Email" required />
      <input className="field" name="password" type="password" placeholder="Password" required minLength={8} />
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      <button className="btn-primary" disabled={pending}>{pending ? "Creating..." : "Start tracking"}</button>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="card grid gap-3">
      <input className="field" name="email" type="email" placeholder="Email" required />
      <input className="field" name="password" type="password" placeholder="Password" required />
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      <button className="btn-primary" disabled={pending}>{pending ? "Logging in..." : "Login"}</button>
    </form>
  );
}
