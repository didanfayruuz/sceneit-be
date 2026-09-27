import { eq, and, desc } from "drizzle-orm";

import { db } from "../../db";
import { watched, watchlist } from "../../db/schema";
import { tmdbClient } from "../../utils/tmdbClient";

export async function addToWatched(userId: number, movieId: number) {
  const existing = await db.query.watched.findFirst({
    where: and(
      eq(watched.userId, userId),
      eq(watched.movieId, movieId)
    ),
  });

  if (existing) {
    throw new Error("ALREADY_WATCHED");
  }

  const [entry] = await db
    .insert(watched)
    .values({ userId, movieId })
    .returning();

  // Otomatis keluar dari watchlist begitu ditandai sudah ditonton
  await db
    .delete(watchlist)
    .where(
      and(
        eq(watchlist.userId, userId),
        eq(watchlist.movieId, movieId)
      )
    );

  return entry;
}

export async function removeFromWatched(userId: number, movieId: number) {
  const existing = await db.query.watched.findFirst({
    where: and(
      eq(watched.userId, userId),
      eq(watched.movieId, movieId)
    ),
  });

  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  await db
    .delete(watched)
    .where(
      and(
        eq(watched.userId, userId),
        eq(watched.movieId, movieId)
      )
    );
}

export async function getUserWatched(userId: number) {
  const result = await db.query.watched.findMany({
    where: eq(watched.userId, userId),
    orderBy: desc(watched.watchedAt),
    with: {
      movie: true,
    },
  });

  const watchedWithRating = await Promise.all(
    result.map(async (item) => {
      if (!item.movie) {
        return item;
      }

      try {
        const tmdbType = item.movie.type === "series" ? "tv" : "movie";

        const { data } = await tmdbClient.get(
          `/${tmdbType}/${item.movie.tmdbId}`
        );

        return {
          ...item,
          movie: {
            ...item.movie,
            rating: data.vote_average ?? null,
          },
        };
      } catch (error) {
        console.error(
          `Failed to fetch TMDB rating for ${item.movie.title}:`,
          error
        );

        return {
          ...item,
          movie: {
            ...item.movie,
            rating: null,
          },
        };
      }
    })
  );

  return watchedWithRating;
}