import { NextRequest } from "next/server";
import { apiError, json, publicUser, requireApiUser } from "@/lib/api-auth";
import { addFriendByUsername, getFriendsPayload, respondToFriendRequest } from "@/lib/friends";
import { friendSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  const friendships = await getFriendsPayload(user);
  return json({
    friends: friendships.map((friendship) => ({
      id: friendship.id,
      status: friendship.status,
      direction: friendship.receiverId === user.id ? "incoming" : "outgoing",
      friend: publicUser(friendship.requesterId === user.id ? friendship.receiver : friendship.requester),
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  const parsed = friendSchema.safeParse(await request.json());
  if (!parsed.success) return apiError("Enter a valid username.");
  try {
    await addFriendByUsername(user, parsed.data.username);
    return json({ ok: true }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Could not add friend.");
  }
}

export async function PATCH(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  const body = await request.json();
  if (body.action !== "accept" && body.action !== "reject") return apiError("Choose accept or reject.");
  if (typeof body.friendshipId !== "string") return apiError("Friend request is required.");

  try {
    await respondToFriendRequest(user, body.friendshipId, body.action);
    return json({ ok: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Could not update friend request.");
  }
}
