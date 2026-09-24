import { desc } from "drizzle-orm";
import { db } from "../../db";
import { featuredContent } from "../../db/schema";

export async function setFeatured(input: {
  movieId: number;
  featuredReviewId?: number;
  setByAdminId: number;
}) {
  const [entry] = await db.insert(featuredContent).values(input).returning();
  return entry;
}

// Dipakai juga oleh endpoint publik GET /api/featured (Langkah 74)
export async function getCurrentFeatured() {
  return db.query.featuredContent.findFirst({
    orderBy: desc(featuredContent.createdAt),
    with: { movie: true, featuredReview: true },
  });
}