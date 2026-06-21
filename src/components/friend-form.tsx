"use client";

import { useActionState } from "react";
import { addFriendAction, type ActionState } from "@/app/actions";

export function FriendForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addFriendAction, {});
  return (
    <form action={action} className="card grid gap-3">
      <label className="label">Add friend by username</label>
      <div className="flex gap-2">
        <input className="field" name="username" placeholder="taha" required />
        <button className="btn-primary shrink-0" disabled={pending}>{pending ? "..." : "Add"}</button>
      </div>
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-neon">Friend request sent.</p> : null}
    </form>
  );
}
