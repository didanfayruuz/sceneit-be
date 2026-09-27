import { eq, and, desc } from "drizzle-orm";

import { db } from "../../db";
import { watchlist } from "../../db/schema";
import { tmdbClient } from "../../utils/tmdbClient";

export async function addToWatchlist(userId: number, movieId: number) {
  const existing = await db.query.watchlist.findFirst({
    where: and(
      eq(watchlist.userId, userId),
      eq(watchlist.movieId, movieId)
    ),
  });

  if (existing) {
    throw new Error("ALREADY_IN_WATCHLIST");
  }

  const [entry] = await db
    .insert(watchlist)
    .values({ userId, movieId })
    .returning();

  return entry;
}

export async function removeFromWatchlist(userId: number, movieId: number) {
  const existing = await db.query.watchlist.findFirst({
    where: and(
      eq(watchlist.userId, userId),
      eq(watchlist.movieId, movieId)
    ),
  });

  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  await db
    .delete(watchlist)
    .where(
      and(
        eq(watchlist.userId, userId),
        eq(watchlist.movieId, movieId)
      )
    );
}

export async function getUserWatchlist(userId: number) {
  const result = await db.query.watchlist.findMany({
    where: eq(watchlist.userId, userId),
    orderBy: desc(watchlist.addedAt),
    with: {
      movie: true,
    },
  });

  const watchlistWithRating = await Promise.all(
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

  return watchlistWithRating;
}