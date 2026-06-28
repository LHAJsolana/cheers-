import { respondToFriendRequestAction } from "@/app/actions";
import { FriendForm } from "@/components/friend-form";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getFriendsPayload } from "@/lib/friends";

export default async function FriendsPage() {
  const user = await requireUser();
  const friendships = await getFriendsPayload(user);
  const incoming = friendships.filter((friendship) => friendship.receiverId === user.id && friendship.status === "PENDING");
  const outgoing = friendships.filter((friendship) => friendship.requesterId === user.id && friendship.status === "PENDING");
  const accepted = friendships.filter((friendship) => friendship.status === "ACCEPTED");

  return (
    <AppShell>
      <section>
        <p className="label text-neon">Friends</p>
        <h1 className="mt-2 text-3xl font-black">Your responsible chaos circle</h1>
        <p className="mt-2 text-sm text-slate-400">Accepted friends can see your friends-only drink posts.</p>
      </section>
      <FriendForm />
      <FriendSection title="Incoming requests" empty="No incoming requests. Peaceful." friendships={incoming} userId={user.id} actionable />
      <FriendSection title="Friends" empty="No accepted friends yet." friendships={accepted} userId={user.id} />
      <FriendSection title="Sent requests" empty="No pending sent requests." friendships={outgoing} userId={user.id} />
    </AppShell>
  );
}

function FriendSection({
  title,
  empty,
  friendships,
  userId,
  actionable = false,
}: {
  title: string;
  empty: string;
  friendships: Awaited<ReturnType<typeof getFriendsPayload>>;
  userId: string;
  actionable?: boolean;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-black">{title}</h2>
      {friendships.length === 0 ? (
        <article className="card text-sm text-slate-400">{empty}</article>
      ) : null}
      {friendships.map((friendship) => {
        const friend = friendship.requesterId === userId ? friendship.receiver : friendship.requester;
        return (
          <article key={friendship.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black">{friend.name}</p>
              <p className="text-sm text-slate-400">@{friend.username}</p>
            </div>
            {actionable ? (
              <div className="flex gap-2">
                <form action={respondToFriendRequestAction.bind(null, friendship.id, "accept")}>
                  <button className="btn-primary py-2">Accept</button>
                </form>
                <form action={respondToFriendRequestAction.bind(null, friendship.id, "reject")}>
                  <button className="btn-secondary py-2">Reject</button>
                </form>
              </div>
            ) : (
              <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs">{friendship.status}</span>
            )}
          </article>
        );
      })}
    </section>
  );
}
