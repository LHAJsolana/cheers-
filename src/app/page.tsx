import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Camera,
  CarFront,
  Clock3,
  Martini,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

const highlights = [
  {
    title: "Log in seconds",
    copy: "Choose a drink template, add the place, and get back to the night.",
    icon: Martini,
  },
  {
    title: "Know your night",
    copy: "See drinks, spending, calories, timing, and estimated BAC together.",
    icon: BarChart3,
  },
  {
    title: "Look out for each other",
    copy: "Share the good moments, keep safety visible, and call a ride fast.",
    icon: ShieldCheck,
  },
];

const tonightStats = [
  { label: "Drinks", value: "3", icon: Martini },
  { label: "Spent", value: "$42", icon: Wallet },
  { label: "Last drink", value: "34m", icon: Clock3 },
];

export default function HomePage() {
  return (
    <main className="space-y-20 pb-8 sm:space-y-24">
      <section className="relative isolate min-h-[72vh] overflow-hidden rounded-[2rem] border border-white/10">
        <Image
          src="/drinks/mojito.jpg"
          alt="A fresh mojito ready for a night out"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-y-0 left-0 w-full bg-ink/35 lg:w-[68%]" />

        <div className="relative flex min-h-[72vh] max-w-3xl flex-col justify-end px-6 pb-10 pt-28 sm:px-10 sm:pb-14 lg:px-14">
          <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-neon/35 bg-black/40 px-3 py-2 text-xs font-bold uppercase text-neon backdrop-blur">
            <Sparkles size={14} />
            Your night, in one place
          </div>
          <h1 className="text-6xl font-black text-white sm:text-7xl lg:text-8xl">Cheers</h1>
          <p className="mt-4 max-w-2xl text-2xl font-black leading-tight text-white sm:text-3xl">
            Remember the night. Respect tomorrow.
          </p>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
            A private social companion for logging drinks, capturing moments, tracking your night, and getting home safely.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary min-h-12 gap-2 px-6 text-base">
              Create account <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn-secondary min-h-12 px-6 text-base backdrop-blur">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="tonight-heading" className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="label text-neon">Tonight mode</p>
          <h2 id="tonight-heading" className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
            Everything that matters, while the night is moving.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Cheers keeps the essentials close without turning your night into a spreadsheet. Log a drink, check the pace, save the memory, move on.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-slate-200">
            <span className="flex items-center gap-2"><Camera size={17} className="text-ember" /> Photos and places</span>
            <span className="flex items-center gap-2"><Users size={17} className="text-ember" /> Friends and reactions</span>
            <span className="flex items-center gap-2"><CarFront size={17} className="text-ember" /> Ride access</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-panel p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-neon">Live session</p>
              <h3 className="mt-2 text-2xl font-black">Friday in Rabat</h3>
            </div>
            <span className="rounded-full border border-neon/30 bg-neon/10 px-3 py-1 text-xs font-bold text-neon">LIVE</span>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {tonightStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <Icon size={18} className="text-neon" />
                  <p className="mt-5 text-2xl font-black">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-ember/30 bg-ember/10 p-4">
            <div>
              <p className="text-sm font-black text-ember">Do not drive</p>
              <p className="mt-1 text-xs text-slate-300">Choose a safe ride home.</p>
            </div>
            <button type="button" className="btn-secondary shrink-0 gap-2 px-4 py-2">
              <CarFront size={17} /> Call ride
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading">
        <div className="max-w-2xl">
          <p className="label text-ember">Made for real nights</p>
          <h2 id="features-heading" className="mt-3 text-4xl font-black sm:text-5xl">Less tapping. More living.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon text-ink"><Icon size={20} /></span>
                <h3 className="mt-6 text-xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-6 py-12 text-center sm:px-10 sm:py-16">
        <p className="label text-neon">Ready when you are</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-black sm:text-5xl">Make tonight one worth remembering.</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">Your account, your memories, your pace.</p>
        <Link href="/signup" className="btn-primary mt-7 min-h-12 gap-2 px-6 text-base">
          Get started <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
