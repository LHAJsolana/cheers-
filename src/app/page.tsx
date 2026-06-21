"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Martini,
  PiggyBank,
  Sparkles,
  Wallet,
} from "lucide-react";

type FormState = {
  name: string;
  email: string;
  handle: string;
  city: string;
  goesOutWeekly: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  handle: "",
  city: "",
  goesOutWeekly: "",
};

const previewStats = [
  { label: "Drink logs", value: "3", detail: "spritz, mocktail, lager", icon: Martini },
  { label: "Spending", value: "$42", detail: "night total", icon: Wallet },
  { label: "Calories", value: "~510", detail: "rough estimate", icon: Flame },
  { label: "Sober streak", value: "6 days", detail: "personal best +2", icon: CalendarCheck },
];

const socialUpdates = [
  "Maya logged a margarita and immediately became the group photographer.",
  "Sam reacted: Respect. Hydration break detected.",
  "Weekly recap: lower spend, better sleep, same elite playlist energy.",
];

const trustPoints = [
  "Approximate calories and spend for personal awareness.",
  "Sober streaks and weekly recaps that celebrate balance.",
  "Funny friend updates without pressure, competition, or unsafe prompts.",
];

export default function LandingPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT?.trim(), []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    if (!endpoint) {
      setStatus("error");
      setErrorMessage("Waitlist endpoint is missing. Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to submit signups.");
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          social_username: form.handle,
          city: form.city,
          goes_out_weekly: form.goesOutWeekly,
        }),
      });

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      setForm(initialFormState);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong submitting the form. Please try again in a moment.");
    }
  };

  return (
    <main className="overflow-hidden">
      <section className="grid min-h-[calc(100vh-7rem)] items-center gap-10 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-12">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-neon">
            <Sparkles size={14} />
            Early access waitlist
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Cheers is coming 🍻
          </h1>
          <p className="mt-5 text-2xl font-black text-slate-100 sm:text-3xl">Join the waitlist for early access</p>
          <p className="mt-3 text-xl font-bold text-ember">Track the night. Remember the vibes.</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Cheers is a funny, social, responsible nightlife app for logging drinks, tracking spending,
            estimating calories, keeping sober streaks visible, reacting with friends, and getting weekly recaps.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#waitlist" className="btn-primary">
              Join the waitlist
            </a>
            <span className="text-sm font-semibold text-slate-400">Responsible social tracking for better nights out.</span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-slate-300">
                <CheckCircle2 className="mb-3 text-neon" size={20} />
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-neon/20 blur-3xl" />
          <div className="absolute -right-10 bottom-10 h-52 w-52 rounded-full bg-ember/20 blur-3xl" />
          <div className="relative mx-auto max-w-md rounded-[2rem] border border-white/15 bg-slate-950/80 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="rounded-[1.55rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,255,107,0.14),transparent_16rem),linear-gradient(145deg,#07111f,#050816_55%,#0d1021)] p-4">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neon">Tonight</p>
                  <h2 className="text-2xl font-black">Cheers Preview</h2>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ember text-ink">
                  <Heart size={21} fill="currentColor" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {previewStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                        <Icon className="text-neon" size={17} />
                      </div>
                      <p className="text-2xl font-black">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-ember/25 bg-ember/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-ember">Funny updates</p>
                  <BarChart3 size={18} className="text-ember" />
                </div>
                <div className="space-y-3">
                  {socialUpdates.map((update) => (
                    <p key={update} className="rounded-xl bg-black/20 p-3 text-sm leading-5 text-slate-200">
                      {update}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-neon/25 bg-neon/10 p-4">
                <p className="text-sm font-black text-neon">Weekly recap</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-black/20 p-3">
                    <p className="text-lg font-black">-18%</p>
                    <p className="text-[11px] text-slate-400">spend</p>
                  </div>
                  <div className="rounded-xl bg-black/20 p-3">
                    <p className="text-lg font-black">2</p>
                    <p className="text-[11px] text-slate-400">quiet nights</p>
                  </div>
                  <div className="rounded-xl bg-black/20 p-3">
                    <p className="text-lg font-black">9.1</p>
                    <p className="text-[11px] text-slate-400">vibe score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-glow backdrop-blur sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="label text-neon">Private beta</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Join the waitlist</h2>
          <p className="mt-4 leading-7 text-slate-300">
            Be first in line for the Cheers MVP. We will use your city and social handle only to understand where early access should open first.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-3">
              <Mail className="text-ember" size={18} />
              Early access updates, no spam.
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="text-ember" size={18} />
              City helps prioritize launch communities.
            </p>
            <p className="flex items-center gap-3">
              <PiggyBank className="text-ember" size={18} />
              Built for awareness, balance, and better nights out.
            </p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Name
              <input
                className="field"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Email
              <input
                className="field"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              Instagram/TikTok username
              <input
                className="field"
                name="social_username"
                autoComplete="off"
                value={form.handle}
                onChange={(event) => updateField("handle", event.target.value)}
                placeholder="@username"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-200">
              City
              <input
                className="field"
                name="city"
                required
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                placeholder="New York"
              />
            </label>
          </div>

          <fieldset className="grid gap-3 rounded-2xl border border-white/10 bg-ink/60 p-4">
            <legend className="px-1 text-sm font-bold text-slate-200">Do you go out weekly?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-neon/50">
                  <input
                    required
                    type="radio"
                    name="goes_out_weekly"
                    value={option}
                    checked={form.goesOutWeekly === option}
                    onChange={(event) => updateField("goesOutWeekly", event.target.value)}
                    className="h-4 w-4 accent-neon"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <button className="btn-primary min-h-12 w-full text-base" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Joining...
              </span>
            ) : (
              "Join the waitlist"
            )}
          </button>

          {status === "success" ? (
            <p className="rounded-2xl border border-neon/30 bg-neon/10 p-4 text-sm font-bold text-neon">
              You’re on the Cheers waitlist. Early access coming soon.
            </p>
          ) : null}

          {status === "error" ? (
            <p className="rounded-2xl border border-ember/30 bg-ember/10 p-4 text-sm font-bold text-ember">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
