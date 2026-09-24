import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { reviews, reportedReviews } from "../../db/schema";
import { getLikeCounts } from "../likes/likes.service";
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
  const rows = await db.query.reviews.findMany({
    where: eq(reviews.movieId, movieId),
    orderBy: desc(reviews.createdAt),
    with: {
      user: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });
  const counts = await getLikeCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, likeCount: counts.get(r.id) ?? 0 }));
}

  export async function getReviewsByUser(userId: number) {
  const rows = await db.query.reviews.findMany({
    where: eq(reviews.userId, userId),
    orderBy: desc(reviews.createdAt),
    with: { movie: true },
  });
  
  const counts = await getLikeCounts(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, likeCount: counts.get(r.id) ?? 0 }));
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

export async function getPopularReviews(limit = 10) {
  const rows = await db.query.reviews.findMany({
    orderBy: desc(reviews.createdAt),
    limit: 100,
    with: {
      user: { columns: { id: true, name: true, avatarUrl: true } },
      movie: { columns: { id: true, title: true, posterPath: true, type: true } },
    },
  });
  const counts = await getLikeCounts(rows.map((r) => r.id));
  const withLikes = rows.map((r) => ({ ...r, likeCount: counts.get(r.id) ?? 0 }));
  return withLikes
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, limit);
}

export async function reportReview(reviewId: number, reportedBy: number, reason: string) {
  const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) });
  if (!review) throw new Error("NOT_FOUND");

  const [entry] = await db.insert(reportedReviews).values({ reviewId, reportedBy, reason }).returning();
  return entry;
}