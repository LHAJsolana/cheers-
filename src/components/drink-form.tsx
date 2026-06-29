"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { drinkTypes, titleEnum, visibilities } from "@/lib/format";

const drinkTemplates = [
  { label: "Beer", drinkType: "BEER", drinkName: "Beer", volumeMl: "330", abv: "5", image: "/drinks/beer.jpg" },
  { label: "Wine", drinkType: "WINE", drinkName: "Wine", volumeMl: "150", abv: "13", image: "/drinks/wine.jpg" },
  { label: "Vodka soda", drinkType: "VODKA", drinkName: "Vodka Soda", volumeMl: "250", abv: "8", image: "/drinks/vodka-soda.jpg" },
  { label: "Mojito", drinkType: "COCKTAIL", drinkName: "Mojito", volumeMl: "220", abv: "12", image: "/drinks/mojito.jpg" },
  { label: "Whisky", drinkType: "WHISKY", drinkName: "Whisky", volumeMl: "50", abv: "40", image: "/drinks/whisky.jpg" },
  { label: "Tequila shot", drinkType: "TEQUILA", drinkName: "Tequila Shot", volumeMl: "45", abv: "40", image: "/drinks/tequila-shot.jpg" },
] as const;

export function DrinkForm({ defaultVisibility }: { defaultVisibility: string }) {
  const [drinkType, setDrinkType] = useState("BEER");
  const [drinkName, setDrinkName] = useState("");
  const [volumeMl, setVolumeMl] = useState("330");
  const [abv, setAbv] = useState("5");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  function applyTemplate(template: (typeof drinkTemplates)[number]) {
    setDrinkType(template.drinkType);
    setDrinkName(template.drinkName);
    setVolumeMl(template.volumeMl);
    setAbv(template.abv);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/web/drinks", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (!response.ok) {
        setError(result?.error ?? "Could not log drink. Try again.");
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setError("Could not reach Cheers. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="card grid gap-4">
      <div className="grid gap-2">
        <label className="label">Quick templates</label>
        <p className="text-sm text-slate-400">Tap your drink, then adjust anything you need.</p>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {drinkTemplates.map((template) => {
            const active = drinkName === template.drinkName && drinkType === template.drinkType;
            return (
              <button
                key={template.label}
                type="button"
                aria-pressed={active}
                onClick={() => applyTemplate(template)}
                className={`min-w-[148px] overflow-hidden rounded-2xl border text-left transition ${
                  active
                    ? "border-neon bg-neon/10 shadow-[0_0_24px_rgba(124,255,107,0.18)]"
                    : "border-white/10 bg-white/5 hover:border-white/25"
                }`}
              >
                <Image
                  src={template.image}
                  alt={template.label}
                  width={296}
                  height={208}
                  className="h-24 w-full object-cover"
                />
                <span className="block px-3 pb-3 pt-2">
                  <span className="block text-sm font-black text-white">{template.label}</span>
                  <span className={`mt-0.5 block text-xs font-bold ${active ? "text-neon" : "text-slate-400"}`}>
                    {template.volumeMl} ml · {template.abv}% ABV
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-2">
        <label className="label">Drink type</label>
        <select name="drinkType" className="field" value={drinkType} onChange={(event) => setDrinkType(event.target.value)} required>
          {drinkTypes.map((type) => <option key={type} value={type}>{titleEnum(type)}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="label">Drink name</label>
        <input className="field" name="drinkName" value={drinkName} onChange={(event) => setDrinkName(event.target.value)} placeholder="Mojito, lager, house wine..." required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="volumeMl" label="Volume ml" type="number" value={volumeMl} onChange={(event) => setVolumeMl(event.target.value)} />
        <Field name="abv" label="ABV %" type="number" step="0.1" value={abv} onChange={(event) => setAbv(event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="price" label="Price" type="number" step="0.01" defaultValue="0" />
        <Field name="loggedAt" label="Date/time" type="datetime-local" defaultValue={localDate} />
      </div>
      <div className="grid gap-2">
        <label className="label">Location/bar</label>
        <input className="field" name="location" placeholder="Sky Bar" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="label">Drink photo</label>
          <input className="field" name="drinkPhoto" type="file" accept="image/*" />
        </div>
        <div className="grid gap-2">
          <label className="label">Place photo</label>
          <input className="field" name="placePhoto" type="file" accept="image/*" />
        </div>
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
      {error ? <p className="text-sm text-ember">{error}</p> : null}
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
