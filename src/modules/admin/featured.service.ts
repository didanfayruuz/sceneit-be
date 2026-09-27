import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "../../db";
import { featuredContent } from "../../db/schema";
import { getContentDetail } from "../movies/movies.service";


export async function setFeatured(input: {
  tmdbId: number;
  type: "movie" | "series";
  featuredReviewId?: number;
  setByAdminId: number;
}) {
  // Pastikan film/series ini ter-cache dulu ke tabel movies lokal
  const detail = await getContentDetail(input.tmdbId, input.type);
  const movieId = detail.id;

  const dup = await db.query.featuredContent.findFirst({
    where: eq(featuredContent.movieId, movieId),
  });
  if (dup) throw new Error("ALREADY_FEATURED");

  const total = await db.$count(featuredContent);
  if (total >= 5) throw new Error("MAX_FEATURED_REACHED");

  const [entry] = await db
    .insert(featuredContent)
    .values({
      movieId,
      featuredReviewId: input.featuredReviewId,
      setByAdminId: input.setByAdminId,
    })
    .returning();
  return entry;
}

export async function updateFeatured(
  id: number,
  input: { tmdbId?: number; type?: "movie" | "series"; featuredReviewId?: number | null}
) {
  const existing = await db.query.featuredContent.findFirst({
    where: eq(featuredContent.id, id),
  });
  if (!existing) throw new Error("NOT_FOUND");

  let movieId: number | undefined;
  if (input.tmdbId && input.type) {
    const detail = await getContentDetail(input.tmdbId, input.type);
    movieId = detail.id;
    const dup = await db.query.featuredContent.findFirst({
      where: and(eq(featuredContent.movieId, movieId), ne(featuredContent.id, id)),
    });
    if (dup) throw new Error("ALREADY_FEATURED");
  }

  const [updated] = await db
    .update(featuredContent)
    .set({
      ...(movieId ? { movieId } : {}),
      ...(input.featuredReviewId !== undefined ? { featuredReviewId: input.featuredReviewId } : {}),
    })
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
  const rows = await db.query.featuredContent.findMany({
    orderBy: desc(featuredContent.createdAt),
    limit,
    with: { movie: true, featuredReview: true },
  });

  // Enrich tiap item dengan detail lengkap dari TMDB (backdrop, overview, rating, dst)
  const enriched = await Promise.all(
    rows.map(async (row) => {
      try {
        const detail = await getContentDetail(row.movie.tmdbId, row.movie.type);
        return {
          id: row.id,
          tmdbId: detail.tmdbId,
          type: row.movie.type === "series" ? "Series" : "Movie",
          title: detail.title,
          posterPath: detail.posterPath,
          backdropPath: detail.backdropPath,
          overview: detail.overview,
          rating: detail.rating,
          releaseYear: detail.releaseYear,
          genres: detail.genres,
          duration: detail.duration,
          seasons: detail.seasons,
        };
      } catch (err) {
        console.error("FEATURED ENRICH ERROR:", err);
        return null;
      }
    })
  );

  return enriched.filter(Boolean);
}