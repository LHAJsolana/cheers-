import { FriendForm } from "@/components/friend-form";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FriendsPage() {
  const user = await requireUser();
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: user.id }, { receiverId: user.id }] },
    include: { requester: true, receiver: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <section>
        <p className="label text-neon">Friends</p>
        <h1 className="mt-2 text-3xl font-black">Your responsible chaos circle</h1>
        <p className="mt-2 text-sm text-slate-400">A sober friend is the real MVP.</p>
      </section>
      <FriendForm />
      <section className="grid gap-3">
        {friendships.length === 0 ? (
          <article className="card text-center">
            <p className="text-4xl">👯</p>
            <h2 className="mt-3 text-xl font-black">Drinking is social. Add your first friend.</h2>
            <p className="mt-2 text-sm text-slate-400">Username goes above. The group chat can recover later.</p>
          </article>
        ) : null}
        {friendships.map((friendship) => {
          const friend = friendship.requesterId === user.id ? friendship.receiver : friendship.requester;
          return (
            <article key={friendship.id} className="card flex items-center justify-between">
              <div>
                <p className="font-black">{friend.name}</p>
                <p className="text-sm text-slate-400">@{friend.username}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{friendship.status}</span>
            </article>
          );
        })}
        <article className="card border-ember/30">
          <p className="label text-ember">Tiny social pings</p>
          <p className="mt-3 text-sm text-slate-300">Maya entered Light Vibes. Hydration is character development.</p>
          <p className="mt-2 text-sm text-slate-300">Sam unlocked: Left Before Regret. Elite move.</p>
        </article>
      </section>
    </AppShell>
  );
}
