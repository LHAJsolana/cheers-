"use client";

import { useActionState } from "react";
import { logDrinkAction, type ActionState } from "@/app/actions";
import { drinkTypes, titleEnum, visibilities } from "@/lib/format";

export function DrinkForm({ defaultVisibility }: { defaultVisibility: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(logDrinkAction, {});
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <form action={action} className="card grid gap-4">
      <div className="grid gap-2">
        <label className="label">Drink type</label>
        <select name="drinkType" className="field" required>
          {drinkTypes.map((type) => <option key={type} value={type}>{titleEnum(type)}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="label">Drink name</label>
        <input className="field" name="drinkName" placeholder="Mojito, lager, house wine..." required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="volumeMl" label="Volume ml" type="number" defaultValue="330" />
        <Field name="abv" label="ABV %" type="number" step="0.1" defaultValue="5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="price" label="Price" type="number" step="0.01" defaultValue="0" />
        <Field name="loggedAt" label="Date/time" type="datetime-local" defaultValue={localDate} />
      </div>
      <div className="grid gap-2">
        <label className="label">Location/bar</label>
        <input className="field" name="location" placeholder="Sky Bar" />
      </div>
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <input name="checkIn" type="checkbox" className="h-4 w-4 accent-lime-300" />
        Check in here and post it to the feed
      </label>
      <div className="grid gap-2">
        <label className="label">Notes</label>
        <textarea className="field min-h-24" name="notes" placeholder="Optional memory insurance" />
      </div>
      <div className="grid gap-2">
        <label className="label">Visibility</label>
        <select name="visibility" className="field" defaultValue={defaultVisibility}>
          {visibilities.map((visibility) => <option key={visibility} value={visibility}>{titleEnum(visibility)}</option>)}
        </select>
      </div>
      {state.error ? <p className="text-sm text-ember">{state.error}</p> : null}
      <button className="btn-primary" disabled={pending}>{pending ? "Logging..." : "Log drink"}</button>
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
