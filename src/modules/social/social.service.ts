import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { follows } from "../../db/schema";
import { createNotification } from "../notifications/notifications.service";

export async function followUser(followerId: number, followingId: number) {
  if (followerId === followingId) throw new Error("CANNOT_FOLLOW_SELF");

  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
  });
  if (existing) throw new Error("ALREADY_FOLLOWING");

  const [entry] = await db.insert(follows).values({ followerId, followingId }).returning();

  await createNotification({
    userId: followingId,
    type: "follow",
    sourceUserId: followerId,
  });

  return entry;
}

export async function unfollowUser(followerId: number, followingId: number) {
  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db
    .delete(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
}

export async function getFollowStatus(followerId: number, followingId: number) {
  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
  });
  return { isFollowing: Boolean(existing) };
}

export async function getFollowers(userId: number) {
  return db.query.follows.findMany({
    where: eq(follows.followingId, userId),
    with: {
      follower: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function getFollowing(userId: number) {
  return db.query.follows.findMany({
    where: eq(follows.followerId, userId),
    with: {
      following: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });
}