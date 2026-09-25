import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "../../db";
import { featuredContent } from "../../db/schema";

export async function setFeatured(input: {
  movieId: number;
  featuredReviewId?: number;
  setByAdminId: number;
}) {
  const dup = await db.query.featuredContent.findFirst({
    where: eq(featuredContent.movieId, input.movieId),
  });
  if (dup) throw new Error("ALREADY_FEATURED");

  const [entry] = await db.insert(featuredContent).values(input).returning();
  return entry;
}

export async function updateFeatured(
  id: number,
  input: { movieId?: number; featuredReviewId?: number }
) {
  const existing = await db.query.featuredContent.findFirst({
    where: eq(featuredContent.id, id),
  });
  if (!existing) throw new Error("NOT_FOUND");

  if (input.movieId) {
    const dup = await db.query.featuredContent.findFirst({
      where: and(eq(featuredContent.movieId, input.movieId), ne(featuredContent.id, id)),
    });
    if (dup) throw new Error("ALREADY_FEATURED");
  }

  const [updated] = await db
    .update(featuredContent)
    .set(input)
    .where(eq(featuredContent.id, id))
    .returning();

  return updated;
}

export async function removeFeatured(id: number) {
  const existing = await db.query.featuredContent.findFirst({
    where: eq(featuredContent.id, id),
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db.delete(featuredContent).where(eq(featuredContent.id, id));
}

export async function getFeaturedList(limit = 5) {
  return db.query.featuredContent.findMany({
    orderBy: desc(featuredContent.createdAt),
    limit,
    with: { movie: true, featuredReview: true },
  });
}