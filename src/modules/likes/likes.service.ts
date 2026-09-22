import { eq, and, inArray, sql } from "drizzle-orm";
import { db } from "../../db";
import { likes, reviews } from "../../db/schema";
import { createNotification } from "../notifications/notifications.service";

export async function likeReview(userId: number, reviewId: number) {
  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)),
  });
  if (existing) throw new Error("ALREADY_LIKED");

  const [entry] = await db.insert(likes).values({ userId, reviewId }).returning();

  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (review) {
    await createNotification({
      userId: review.userId,
      type: "like",
      sourceUserId: userId,
      reviewId,
    });
  }

  return entry;
}

export async function unlikeReview(userId: number, reviewId: number) {
  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)),
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)));
}

// Dipakai reviews.service.ts buat nampilin jumlah like per review
export async function getLikeCounts(reviewIds: number[]) {
  if (reviewIds.length === 0) return new Map<number, number>();

  const rows = await db
    .select({ reviewId: likes.reviewId, count: sql<number>`count(*)`.as("count") })
    .from(likes)
    .where(inArray(likes.reviewId, reviewIds))
    .groupBy(likes.reviewId);

  return new Map(rows.map((r) => [r.reviewId, Number(r.count)]));
}