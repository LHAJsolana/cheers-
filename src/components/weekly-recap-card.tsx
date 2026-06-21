"use client";

import { useState } from "react";
import { money } from "@/lib/format";

type Recap = {
  drinks: number;
  spent: number;
  calories: number;
  favoriteDrink: string | null;
  favoriteLocation: string | null;
  summary: string;
};

export function WeeklyRecapCard({ recap }: { recap: Recap }) {
  const [copied, setCopied] = useState(false);
  const text = [
    "Cheers Weekly Recap 🍻",
    `${recap.drinks} drinks`,
    `${Math.round(recap.calories).toLocaleString()} kcal`,
    `${money(recap.spent)} spent`,
    `Favorite: ${recap.favoriteDrink ?? "None yet"}`,
    `Vibe: ${recap.summary}`,
  ].join("\n");

  async function copyRecap() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className="card overflow-hidden border-ember/30 bg-gradient-to-br from-ember/15 via-white/[0.06] to-neon/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon text-lg text-ink">🍻</span>
          <div>
            <p className="font-black">Cheers</p>
            <p className="text-xs text-slate-400">Weekly Recap</p>
          </div>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">Screenshot me</span>
      </div>
      <p className="mt-5 text-2xl font-black">{recap.summary}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <span className="rounded-xl bg-black/20 p-3"><b>{recap.drinks}</b><br />drinks</span>
        <span className="rounded-xl bg-black/20 p-3"><b>{Math.round(recap.calories).toLocaleString()}</b><br />kcal</span>
        <span className="rounded-xl bg-black/20 p-3"><b>{money(recap.spent)}</b><br />spent</span>
      </div>
      <div className="mt-4 rounded-xl bg-black/20 p-3 text-sm text-slate-300">
        <p>Favorite: <b className="text-white">{recap.favoriteDrink ?? "None yet"}</b></p>
        <p>Location: <b className="text-white">{recap.favoriteLocation ?? "Still exploring"}</b></p>
      </div>
      <button type="button" onClick={copyRecap} className="btn-secondary mt-4 w-full py-2">
        {copied ? "Copied. Group chat is not ready." : "Copy recap text"}
      </button>
    </article>
  );
}
