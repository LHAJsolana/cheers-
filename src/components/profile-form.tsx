"use client";

import { useActionState } from "react";
import type { User } from "@prisma/client";
import { updateProfileAction, type ActionState } from "@/app/actions";
import { drinkingGoals, genders, notificationStyles, titleEnum, visibilities } from "@/lib/format";

export function ProfileForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProfileAction, {});
  return (
    <form action={action} className="card grid gap-4">
      <Field name="name" label="Name" defaultValue={user.name} />
      <Field name="username" label="Username" defaultValue={user.username} />
      <Field name="weightKg" label="Weight kg" type="number" step="0.1" defaultValue={String(user.weightKg)} />
      <Select name="gender" label="Gender optional" defaultValue={user.gender ?? ""} values={["", ...genders]} />
      <Select name="drinkingGoal" label="Drinking goal" defaultValue={user.drinkingGoal} values={drinkingGoals} />
      <Select name="privacyDefault" label="Privacy default" defaultValue={user.privacyDefault} values={visibilities} />
      <Select name="notificationStyle" label="Notification style" defaultValue={user.notificationStyle} values={notificationStyles} />
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-neon">Profile updated.</p> : null}
      <button className="btn-primary" disabled={pending}>{pending ? "Saving..." : "Save profile"}</button>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <div className="grid gap-2">
      <label className="label">{label}</label>
      <input className="field" required {...inputProps} />
    </div>
  );
}

function Select({ name, label, values, defaultValue }: { name: string; label: string; values: string[]; defaultValue: string }) {
  return (
    <div className="grid gap-2">
      <label className="label">{label}</label>
      <select className="field" name={name} defaultValue={defaultValue}>
        {values.map((value) => <option key={value || "none"} value={value}>{value ? titleEnum(value) : "Prefer not to say"}</option>)}
      </select>
    </div>
  );
}
