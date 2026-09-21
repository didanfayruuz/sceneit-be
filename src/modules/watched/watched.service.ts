import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { watched, watchlist } from "../../db/schema";

export async function addToWatched(userId: number, movieId: number) {
  const existing = await db.query.watched.findFirst({
    where: and(eq(watched.userId, userId), eq(watched.movieId, movieId)),
  });
  if (existing) throw new Error("ALREADY_WATCHED");

  const [entry] = await db.insert(watched).values({ userId, movieId }).returning();

  // otomatis keluar dari watchlist begitu ditandai sudah ditonton
  await db
    .delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)));

  return entry;
}

export async function removeFromWatched(userId: number, movieId: number) {
  const existing = await db.query.watched.findFirst({
    where: and(eq(watched.userId, userId), eq(watched.movieId, movieId)),
  });
  if (!existing) throw new Error("NOT_FOUND");

  await db
    .delete(watched)
    .where(and(eq(watched.userId, userId), eq(watched.movieId, movieId)));
}

export async function getUserWatched(userId: number) {
  return db.query.watched.findMany({
    where: eq(watched.userId, userId),
    orderBy: desc(watched.watchedAt),
    with: { movie: true },
  });
}