"use client";

import { useActionState, useState } from "react";
import { completeOnboardingAction, type ActionState } from "@/app/actions";
import { drinkingGoals, notificationStyles, titleEnum } from "@/lib/format";

export function OnboardingForm({ username, weightKg }: { username: string; weightKg: number }) {
  const [step, setStep] = useState(1);
  const [state, action, pending] = useActionState<ActionState, FormData>(completeOnboardingAction, {});

  return (
    <form action={action} className="card grid gap-5">
      <div className="flex gap-2">
        {[1, 2, 3].map((item) => (
          <span key={item} className={`h-2 flex-1 rounded-full ${item <= step ? "bg-neon" : "bg-white/10"}`} />
        ))}
      </div>

      {step === 1 ? (
        <section className="grid min-h-72 content-center gap-4 text-center">
          <p className="text-5xl">🍻</p>
          <h1 className="text-3xl font-black">Welcome to Cheers</h1>
          <p className="text-slate-300">Track your nights, calories, spending, and funny memories.</p>
          <button type="button" className="btn-primary" onClick={() => setStep(2)}>Let&apos;s go</button>
        </section>
      ) : null}

      <section className={step === 2 ? "grid gap-4" : "hidden"}>
        <div>
          <p className="label text-neon">Your vibe</p>
          <h1 className="mt-2 text-2xl font-black">Set your basics</h1>
        </div>
        <Field name="username" label="Username" defaultValue={username} />
        <Field name="weightKg" label="Weight kg" type="number" step="0.1" defaultValue={String(weightKg)} />
        <div className="grid gap-2">
          <label className="label">Notification style</label>
          <select name="notificationStyle" className="field" defaultValue="FUNNY">
            {notificationStyles.map((style) => <option key={style} value={style}>{titleEnum(style)}</option>)}
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => setStep(3)}>Next</button>
      </section>

      <section className={step === 3 ? "grid gap-4" : "hidden"}>
        <div>
          <p className="label text-neon">Goal</p>
          <h1 className="mt-2 text-2xl font-black">What are we tracking?</h1>
        </div>
        <div className="grid gap-2">
          <label className="label">Drinking goal</label>
          <select name="drinkingGoal" className="field" defaultValue="TRACK_ONLY">
            {drinkingGoals.map((goal) => <option key={goal} value={goal}>{goalLabel(goal)}</option>)}
          </select>
        </div>
        {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
        <button className="btn-primary" disabled={pending}>{pending ? "Opening Cheers..." : "Finish"}</button>
        <button type="button" className="text-sm text-slate-400" onClick={() => setStep(2)}>Back</button>
      </section>
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

function goalLabel(goal: string) {
  const labels: Record<string, string> = {
    TRACK_ONLY: "Just tracking",
    REDUCE_DRINKING: "Drink less",
    SOBER_STREAK: "Sober streak",
    SOCIAL_DISCOVERY: "Social nights",
  };
  return labels[goal] ?? titleEnum(goal);
}
