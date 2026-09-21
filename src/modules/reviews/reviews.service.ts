import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { reviews } from "../../db/schema";
import type { CreateReviewInput, UpdateReviewInput } from "./reviews.validation";

export async function createReview(userId: number, movieId: number, input: CreateReviewInput) {
  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.userId, userId), eq(reviews.movieId, movieId)),
  });
  if (existing) throw new Error("ALREADY_REVIEWED");

  const [review] = await db
    .insert(reviews)
    .values({
      userId,
      movieId,
      rating: input.rating,
      content: input.content,
      containsSpoiler: input.containsSpoiler ?? false,
    })
    .returning();

  return review;
}

export async function getReviewsByMovie(movieId: number) {
  return db.query.reviews.findMany({
    where: eq(reviews.movieId, movieId),
    orderBy: desc(reviews.createdAt),
    with: {
      user: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function updateReview(reviewId: number, userId: number, input: UpdateReviewInput) {
  const existing = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.userId !== userId) throw new Error("FORBIDDEN");

  const [updated] = await db
    .update(reviews)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(reviews.id, reviewId))
    .returning();

  return updated;
}

export async function deleteReview(reviewId: number, userId: number) {
  const existing = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.userId !== userId) throw new Error("FORBIDDEN");

  await db.delete(reviews).where(eq(reviews.id, reviewId));
}