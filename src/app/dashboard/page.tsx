import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/auth";
import { alcoholFreeDaysThisWeek, currentSoberStreak, startOfWeek } from "@/lib/analytics";
import { BAC_DISCLAIMER, estimateBAC, getFunnySafetyStatus } from "@/lib/drinks";
import { money } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { weeklyRecap } from "@/lib/recap";
import { closeExpiredSessions } from "@/lib/sessions";
import { WeeklyRecapCard } from "@/components/weekly-recap-card";

const safetyTips = [
  "Water is your sidekick.",
  "Food before drinks is elite strategy.",
  "Uber is cheaper than bad decisions.",
  "A sober friend is the real MVP.",
];

export default async function DashboardPage() {
  const user = await requireUser();
  await closeExpiredSessions(user.id);
  const weekStart = startOfWeek();
  const logs = await prisma.drinkLog.findMany({
    where: { userId: user.id },
    orderBy: { loggedAt: "desc" },
  });
  const openSession = await prisma.session.findFirst({
    where: { userId: user.id, endTime: null },
    orderBy: { startTime: "desc" },
  });
  const weekLogs = logs.filter((log) => log.loggedAt >= weekStart);
  const recentSession = logs.filter((log) => Date.now() - log.loggedAt.getTime() < 8 * 60 * 60 * 1000);
  const sessionGrams = recentSession.reduce((sum, log) => sum + log.alcoholGramsEstimate, 0);
  const firstDrink = recentSession.at(-1)?.loggedAt;
  const hoursSinceFirstDrink = firstDrink ? (Date.now() - firstDrink.getTime()) / 36e5 : 0;
  const bac = estimateBAC(user.weightKg, user.gender, sessionGrams, hoursSinceFirstDrink);
  const sober = alcoholFreeDaysThisWeek(logs);
  const recap = weeklyRecap(logs);
  const safetyTip = safetyTips[new Date().getDay() % safetyTips.length];

  return (
    <AppShell>
      <section className="card bg-gradient-to-br from-white/10 to-neon/10 transition duration-200 hover:border-neon/30">
        <p className="label text-neon">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black">{logs.length ? `Hey ${user.name}, hydration is character development.` : "Your night starts here."}</h1>
        <p className="mt-2 text-sm text-slate-300">{logs.length ? "Weekend Mode: pending." : "No chaos logged yet. Respectfully suspicious."}</p>
        <Link href="/log-drink" className="btn-primary mt-5">{logs.length ? "Log a drink" : "Log first drink"}</Link>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Drinks this week" value={String(weekLogs.length)} />
        <StatCard label="Alcohol calories" value={String(Math.round(weekLogs.reduce((s, l) => s + l.caloriesEstimate, 0)))} />
        <StatCard label="Spent this week" value={money(weekLogs.reduce((s, l) => s + l.price, 0))} />
        <StatCard label="Sober streak" value={`${currentSoberStreak(logs)}d`} hint={`${sober.freeDays}/${sober.totalDays} alcohol-free days this week`} />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <WeeklyRecapCard recap={recap} />
        <article className="card border-neon/20">
          <p className="label text-neon">Night session</p>
          {openSession ? (
            <div className="mt-3">
              <p className="text-2xl font-black">{openSession.title}</p>
              <p className="mt-2 text-sm text-slate-300">
                {openSession.totalDrinks} drinks · {Math.round(openSession.totalCalories)} calories · {money(openSession.totalSpent)}
              </p>
              <p className="mt-1 text-sm text-slate-500">{openSession.location ?? "Location TBD"}</p>
            </div>
          ) : (
            <p className="mt-3 text-slate-400">No active session. The night is behaving.</p>
          )}
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="card">
          <p className="label">Last drink</p>
          {logs[0] ? (
            <div className="mt-3">
              <p className="text-xl font-black">{logs[0].drinkName}</p>
              <p className="text-sm text-slate-400">{logs[0].location ?? "No location"} · {logs[0].loggedAt.toLocaleString()}</p>
            </div>
          ) : (
            <p className="mt-3 text-slate-400">No drinks logged yet.</p>
          )}
        </article>
        <article className="card border-neon/30">
          <p className="label text-neon">Safety estimate</p>
          <p className="mt-2 text-3xl font-black">{getFunnySafetyStatus(bac)}</p>
          <p className="mt-1 text-sm text-slate-300">Estimated BAC: {bac.toFixed(3)}%</p>
          <p className="mt-3 text-sm font-black text-ember">Do not drive after drinking.</p>
          <p className="mt-1 text-sm text-slate-300">{safetyTip}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">{BAC_DISCLAIMER}</p>
        </article>
      </section>
    </AppShell>
  );
}
