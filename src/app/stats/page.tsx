import { AchievementCode } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { achievementMeta } from "@/lib/achievements";
import { requireUser } from "@/lib/auth";
import { alcoholFreeDaysThisWeek, mostCommon, startOfWeek } from "@/lib/analytics";
import { money, titleEnum } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { closeExpiredSessions } from "@/lib/sessions";

export default async function StatsPage() {
  const user = await requireUser();
  await closeExpiredSessions(user.id);
  const logs = await prisma.drinkLog.findMany({ where: { userId: user.id }, orderBy: { loggedAt: "desc" } });
  const checkIns = await prisma.checkIn.findMany({ where: { userId: user.id } });
  const unlocked = await prisma.userAchievement.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const weekLogs = logs.filter((log) => log.loggedAt >= startOfWeek());
  const alcoholFree = alcoholFreeDaysThisWeek(logs);
  const mostDrink = mostCommon(logs.map((log) => titleEnum(log.drinkType)));
  const mostVisitedLocation = mostCommon(checkIns.map((checkIn) => checkIn.location)) ?? mostCommon(logs.map((log) => log.location).filter(Boolean) as string[]);
  const unlockedCodes = new Set(unlocked.map((item) => item.code));

  if (logs.length === 0) {
    return (
      <AppShell>
        <section>
          <p className="label text-neon">Stats</p>
          <h1 className="mt-2 text-3xl font-black">Stats unlock after your first night out.</h1>
          <p className="mt-2 text-sm text-slate-400">One drink log and the numbers will start judging politely.</p>
        </section>
        <section className="card grid gap-3 text-center">
          <p className="text-5xl">📊</p>
          <h2 className="text-2xl font-black">No stats yet.</h2>
          <p className="text-sm text-slate-400">Your charts are stretching. Give them a night out.</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section>
        <p className="label text-neon">Stats</p>
        <h1 className="mt-2 text-3xl font-black">{logs.length ? "Patterns without the lecture" : "Stats unlock after your first night out."}</h1>
        <p className="mt-2 text-sm text-slate-400">{logs.length ? "Your wallet has concerns, but the chart is cute." : "Log a drink and the numbers will start judging politely."}</p>
      </section>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Weekly drinks" value={String(weekLogs.length)} />
        <StatCard label="Weekly calories" value={String(Math.round(weekLogs.reduce((s, l) => s + l.caloriesEstimate, 0)))} />
        <StatCard label="Weekly spending" value={money(weekLogs.reduce((s, l) => s + l.price, 0))} />
        <StatCard label="Alcohol-free days" value={`${alcoholFree.freeDays}/${alcoholFree.totalDays}`} />
        <StatCard label="Most logged type" value={mostDrink ?? "None yet"} />
        <StatCard label="Most visited location" value={mostVisitedLocation ?? "None yet"} />
      </section>
      <section className="card">
        <p className="label">Weekly drinks chart</p>
        <div className="mt-4 grid grid-cols-7 items-end gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
            const count = weekLogs.filter((log) => ((log.loggedAt.getDay() + 6) % 7) === index).length;
            return (
              <div key={day} className="grid gap-2 text-center text-xs text-slate-400">
                <div className="flex h-28 items-end rounded-xl bg-white/5 p-1">
                  <div className="w-full rounded-lg bg-gradient-to-t from-ember to-neon transition-all duration-500" style={{ height: `${Math.max(8, count * 24)}px` }} />
                </div>
                <span>{day}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="card">
        <p className="label text-neon">Achievements</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.values(AchievementCode).map((code) => {
            const meta = achievementMeta(code);
            const isUnlocked = unlockedCodes.has(code);
            return (
              <div key={code} className={`rounded-xl border p-3 transition ${isUnlocked ? "border-neon/40 bg-neon/10" : "border-white/10 bg-white/5"}`}>
                <p className="font-black">{meta.emoji} {meta.title}</p>
                <p className="text-sm text-slate-400">{isUnlocked ? "Unlocked" : meta.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
