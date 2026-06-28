import { FriendshipStatus, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type FriendshipWithUsers = Awaited<ReturnType<typeof getFriendsPayload>>[number];

export async function getAcceptedFriendIds(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    select: { requesterId: true, receiverId: true },
  });

  return friendships.map((friendship) =>
    friendship.requesterId === userId ? friendship.receiverId : friendship.requesterId,
  );
}

export function visibleActivityWhere(userId: string, acceptedFriendIds: string[]) {
  return {
    OR: [
      { userId },
      { drinkLog: { visibility: "PUBLIC" as const } },
      {
        drinkLog: {
          visibility: "FRIENDS" as const,
          userId: { in: acceptedFriendIds },
        },
      },
      {
        userId: { in: acceptedFriendIds },
        drinkLogId: null,
      },
    ],
  };
}

export async function getFriendsPayload(user: Pick<User, "id">) {
  return prisma.friendship.findMany({
    where: { OR: [{ requesterId: user.id }, { receiverId: user.id }] },
    include: { requester: true, receiver: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function addFriendByUsername(user: Pick<User, "id" | "name">, username: string) {
  const receiver = await prisma.user.findUnique({ where: { username } });
  if (!receiver || receiver.id === user.id) throw new Error("No matching friend found.");

  const reverse = await prisma.friendship.findUnique({
    where: { requesterId_receiverId: { requesterId: receiver.id, receiverId: user.id } },
  });

  if (reverse) {
    if (reverse.status === FriendshipStatus.ACCEPTED) throw new Error("You are already friends.");
    await prisma.friendship.update({
      where: { id: reverse.id },
      data: { status: FriendshipStatus.ACCEPTED },
    });
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "FRIEND_ADDED",
        message: `${user.name} accepted ${receiver.name}'s friend request.`,
      },
    });
    return;
  }

  await prisma.friendship.upsert({
    where: { requesterId_receiverId: { requesterId: user.id, receiverId: receiver.id } },
    update: { status: FriendshipStatus.PENDING },
    create: { requesterId: user.id, receiverId: receiver.id, status: FriendshipStatus.PENDING },
  });
  await prisma.activity.create({
    data: {
      userId: user.id,
      type: "FRIEND_ADDED",
      message: `${user.name} sent ${receiver.name} a friend request.`,
    },
  });
}

export async function respondToFriendRequest(user: Pick<User, "id" | "name">, friendshipId: string, action: "accept" | "reject") {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
    include: { requester: true, receiver: true },
  });

  if (!friendship || friendship.receiverId !== user.id || friendship.status !== FriendshipStatus.PENDING) {
    throw new Error("Friend request not found.");
  }

  if (action === "reject") {
    await prisma.friendship.delete({ where: { id: friendship.id } });
    return;
  }

  await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: FriendshipStatus.ACCEPTED },
  });
  await prisma.activity.create({
    data: {
      userId: user.id,
      type: "FRIEND_ADDED",
      message: `${user.name} accepted ${friendship.requester.name}'s friend request.`,
    },
  });
}
