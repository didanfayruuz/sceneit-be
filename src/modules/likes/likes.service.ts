import { eq, and, inArray, count } from "drizzle-orm";
import { db } from "../../db";
import { likes } from "../../db/schema";

export async function likeReview(userId: number, reviewId: number) {
  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)),
  });
  if (existing) throw new Error("ALREADY_LIKED");

  const [entry] = await db.insert(likes).values({ userId, reviewId }).returning();
  return entry;
}

export async function unlikeReview(userId: number, reviewId: number) {
  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)),
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)));
}

export async function getLikeCounts(reviewIds: number[]): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  if (reviewIds.length === 0) return map;

  const rows = await db
    .select({
      reviewId: likes.reviewId,
      total: count(likes.id),
    })
    .from(likes)
    .where(inArray(likes.reviewId, reviewIds))
    .groupBy(likes.reviewId);

  for (const row of rows) {
    map.set(row.reviewId, Number(row.total));
  }

  return map;
}
