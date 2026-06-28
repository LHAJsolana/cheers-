import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { addPresetCommentAction, reactToActivityAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { presetComments } from "@/lib/comment-presets";
import { getAcceptedFriendIds, visibleActivityWhere } from "@/lib/friends";
import { titleEnum } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { reactionOptions } from "@/lib/reactions";
import { closeExpiredSessions } from "@/lib/sessions";

export default async function ActivityPage() {
  const user = await requireUser();
  await closeExpiredSessions(user.id);
  const acceptedFriendIds = await getAcceptedFriendIds(user.id);
  const activities = await prisma.activity.findMany({
    where: visibleActivityWhere(user.id, acceptedFriendIds),
    include: { user: true, drinkLog: true, reactions: true, comments: { include: { user: true }, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <AppShell>
      <section>
        <p className="label text-neon">Activity feed</p>
        <h1 className="mt-2 text-3xl font-black">Tonight&apos;s timeline</h1>
      </section>
      {activities.length === 0 ? (
        <section className="card grid gap-4 text-center">
          <p className="text-5xl">🪩</p>
          <h2 className="text-2xl font-black">No chaos yet.</h2>
          <p className="text-sm text-slate-400">Start a session and give the feed something to gossip about.</p>
          <Link href="/log-drink" className="btn-primary">Start a session</Link>
        </section>
      ) : null}
      <div className="grid gap-3">
        {activities.map((activity) => (
          <article key={activity.id} className="card transition duration-200 hover:-translate-y-0.5 hover:border-white/20">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon to-ember text-sm font-black text-ink">
                {initials(activity.user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black">{activity.user.name}</p>
                  <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    {titleEnum(activity.drinkLog?.visibility ?? "PUBLIC")}
                  </span>
                </div>
                <p className="mt-1 text-slate-200">{activity.message}</p>
                <p className="mt-2 text-xs text-slate-500">{activity.createdAt.toLocaleString()}</p>
                {activity.drinkLog ? (
                  <div className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
                    {activity.drinkLog.drinkPhotoUrl || activity.drinkLog.placePhotoUrl ? (
                      <div className="mb-3 grid gap-2 sm:grid-cols-2">
                        {activity.drinkLog.drinkPhotoUrl ? <Image src={activity.drinkLog.drinkPhotoUrl} alt={`${activity.drinkLog.drinkName} drink`} width={640} height={480} unoptimized className="h-48 w-full rounded-xl object-cover" /> : null}
                        {activity.drinkLog.placePhotoUrl ? <Image src={activity.drinkLog.placePhotoUrl} alt={activity.drinkLog.location ?? "Place photo"} width={640} height={480} unoptimized className="h-48 w-full rounded-xl object-cover" /> : null}
                      </div>
                    ) : null}
                    <p className="font-bold text-white">{activity.drinkLog.drinkName}</p>
                    <p>{activity.drinkLog.volumeMl} ml · {activity.drinkLog.abv}% ABV · {activity.drinkLog.location ?? "mystery location"}</p>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {reactionOptions.map((reaction) => {
                const count = activity.reactions.filter((item) => item.type === reaction.type).length;
                const active = activity.reactions.some((item) => item.type === reaction.type && item.userId === user.id);
                return (
                  <form key={reaction.type} action={reactToActivityAction.bind(null, activity.id, reaction.type)}>
                    <button className={`rounded-full border px-3 py-2 text-xs font-bold transition active:scale-95 ${active ? "border-neon/60 bg-neon/15 text-neon" : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"}`}>
                      {reaction.label} {count > 0 ? count : ""}
                    </button>
                  </form>
                );
              })}
              {presetComments.map((text) => (
                <form key={text} action={addPresetCommentAction.bind(null, activity.id, text)}>
                  <button className="btn-secondary gap-2 py-2">
                    <MessageCircle size={16} /> {text}
                  </button>
                </form>
              ))}
            </div>
            {activity.comments.length ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                {activity.comments.map((comment) => (
                  <span key={comment.id} className="rounded-full bg-white/10 px-3 py-2 text-xs text-slate-200">
                    <strong>{comment.user.name}:</strong> {comment.text}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </AppShell>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
