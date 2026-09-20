import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { movies } from "../../db/schema";
import { tmdbClient } from "../../utils/tmdbClient";

type ContentType = "movie" | "series";

export async function searchContent(query: string, type: ContentType = "movie", page = 1) {
  const tmdbType = type === "series" ? "tv" : "movie";
  const { data } = await tmdbClient.get(`/search/${tmdbType}`, {
    params: { query, page },
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    results: data.results.map((item: any) => ({
      tmdbId: item.id,
      type,
      title: item.title ?? item.name,
      posterPath: item.poster_path,
      releaseYear: (item.release_date ?? item.first_air_date ?? "").slice(0, 4) || null,
    })),
  };
}

export async function getContentDetail(tmdbId: number, type: ContentType = "movie") {
  const tmdbType = type === "series" ? "tv" : "movie";
  const { data } = await tmdbClient.get(`/${tmdbType}/${tmdbId}`);

  const detail = {
    tmdbId: data.id,
    type,
    title: data.title ?? data.name,
    posterPath: data.poster_path,
    genres: (data.genres ?? []).map((g: any) => g.name).join(","),
    releaseYear: (data.release_date ?? data.first_air_date ?? "").slice(0, 4) || null,
    overview: data.overview,
    // khusus series: ringkasan musim (jumlah episode per musim, tanpa detail episode dulu)
    seasons:
      type === "series"
        ? (data.seasons ?? []).map((s: any) => ({
            seasonNumber: s.season_number,
            name: s.name,
            episodeCount: s.episode_count,
          }))
        : undefined,
  };

  await cacheMovie(detail);
  return detail;
}

async function cacheMovie(detail: {
  tmdbId: number;
  type: ContentType;
  title: string;
  posterPath: string | null;
  genres: string;
  releaseYear: string | null;
}) {
  const existing = await db.query.movies.findFirst({
    where: and(eq(movies.tmdbId, detail.tmdbId), eq(movies.type, detail.type)),
  });

  if (existing) {
    await db.update(movies).set({ title: detail.title, posterPath: detail.posterPath }).where(eq(movies.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db
    .insert(movies)
    .values({
      tmdbId: detail.tmdbId,
      type: detail.type,
      title: detail.title,
      posterPath: detail.posterPath,
      genres: detail.genres,
      releaseYear: detail.releaseYear ? Number(detail.releaseYear) : null,
    })
    .returning();

  return inserted.id;
}