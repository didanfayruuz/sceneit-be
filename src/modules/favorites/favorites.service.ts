import { eq, and, desc } from "drizzle-orm";

import { db } from "../../db";
import { favorites } from "../../db/schema";
import { tmdbClient } from "../../utils/tmdbClient";

export async function addToFavorites(userId: number, movieId: number) {
  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, userId),
      eq(favorites.movieId, movieId)
    ),
  });

  if (existing) {
    throw new Error("ALREADY_FAVORITED");
  }

  const [entry] = await db
    .insert(favorites)
    .values({ userId, movieId })
    .returning();

  return entry;
}

export async function removeFromFavorites(userId: number, movieId: number) {
  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, userId),
      eq(favorites.movieId, movieId)
    ),
  });

  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.movieId, movieId)
      )
    );
}

export async function getUserFavorites(userId: number) {
  const result = await db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    orderBy: desc(favorites.addedAt),
    with: {
      movie: true,
    },
  });

  const favoritesWithRating = await Promise.all(
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

  return favoritesWithRating;
}
