import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { favorites } from "../../db/schema";

export async function addToFavorites(userId: number, movieId: number) {
  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)),
  });
  if (existing) throw new Error("ALREADY_FAVORITED");

  const [entry] = await db.insert(favorites).values({ userId, movieId }).returning();
  return entry;
}

export async function removeFromFavorites(userId: number, movieId: number) {
  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)),
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)));
}

export async function getUserFavorites(userId: number) {
  return db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    orderBy: desc(favorites.addedAt),
    with: { movie: true },
  });
}