import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { WeeklyRecapCard } from "@/components/weekly-recap-card";
import { requireUser } from "@/lib/auth";
import { getDashboardPayload } from "@/lib/api-services";
import { money } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardPayload(user);
  const noLogs = !data.lastDrink;

  return (
    <AppShell>
      <section className="card bg-gradient-to-br from-white/10 to-neon/10 transition duration-200 hover:border-neon/30">
        <p className="label text-neon">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black">{noLogs ? "Your night starts here." : `Hey ${user.name}, hydration is character development.`}</h1>
        <p className="mt-2 text-sm text-slate-300">{noLogs ? "No chaos logged yet. Respectfully suspicious." : "Weekend Mode: pending."}</p>
        <Link href="/log-drink" className="btn-primary mt-5">{noLogs ? "Log first drink" : "Log a drink"}</Link>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Drinks this week" value={String(data.stats.drinksThisWeek)} />
        <StatCard label="Alcohol calories" value={String(data.stats.caloriesThisWeek)} />
        <StatCard label="Spent this week" value={money(data.stats.spentThisWeek)} />
        <StatCard label="Sober streak" value={`${data.stats.soberStreak}d`} hint={`${data.stats.alcoholFreeDays.freeDays}/${data.stats.alcoholFreeDays.totalDays} alcohol-free days this week`} />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <WeeklyRecapCard recap={data.recap} />
        <article className="card border-neon/20">
          <p className="label text-neon">Night session</p>
          {data.openSession ? (
            <div className="mt-3">
              <p className="text-2xl font-black">{data.openSession.title}</p>
              <p className="mt-2 text-sm text-slate-300">
                {data.openSession.totalDrinks} drinks · {Math.round(data.openSession.totalCalories)} calories · {money(data.openSession.totalSpent)}
              </p>
              <p className="mt-1 text-sm text-slate-500">{data.openSession.location ?? "Location TBD"}</p>
            </div>
          ) : (
            <p className="mt-3 text-slate-400">No active session. The night is behaving.</p>
          )}
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="card">
          <p className="label">Last drink</p>
          {data.lastDrink ? (
            <div className="mt-3">
              <p className="text-xl font-black">{data.lastDrink.drinkName}</p>
              <p className="text-sm text-slate-400">{data.lastDrink.location ?? "No location"} · {data.lastDrink.loggedAt.toLocaleString()}</p>
            </div>
          ) : (
            <p className="mt-3 text-slate-400">No drinks logged yet.</p>
          )}
        </article>
        <article className={`card ${data.safety.urgent ? "border-ember/60 bg-ember/10" : "border-neon/30"}`}>
          <p className={`label ${data.safety.urgent ? "text-ember" : "text-neon"}`}>Safety estimate</p>
          <p className="mt-2 text-3xl font-black">{data.safety.urgent ? "Do Not Drive" : data.safety.status}</p>
          <p className="mt-1 text-sm text-slate-300">Estimated BAC: {data.safety.bac.toFixed(3)}%</p>
          <p className="mt-3 rounded-xl bg-ember px-4 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-ink">
            Do not drive after drinking.
          </p>
          <p className="mt-3 text-sm text-slate-300">{data.safety.urgent ? "Skip the jokes here. Get a ride, water, and food." : data.safety.tip}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">{data.safety.disclaimer}</p>
        </article>
      </section>
    </AppShell>
  );
}
