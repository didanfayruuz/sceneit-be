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
  const { data } = await tmdbClient.get(`/${tmdbType}/${tmdbId}`, {
  params: {
    append_to_response: 'credits',
  },
});
  
  const detail = {
    tmdbId: data.id,
    type,
    title: data.title ?? data.name,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    country: data.production_countries?.[0]?.name ?? null,
    director:
    data.credits?.crew?.find((person: any) => person.job === "Director")?.name ?? null,
    genres: (data.genres ?? []).map((g: any) => g.name).join(", "),
    releaseYear: (data.release_date ?? data.first_air_date ?? "").slice(0, 4) || null,
    overview: data.overview,
    rating: data.vote_average,
    duration: data.runtime,
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

	const localId = await cacheMovie(detail);
  return { id: localId, ...detail };
}

export async function getSimilarContent(
  tmdbId: number,
  type: ContentType = "movie"
) {
  const tmdbType =
    type === "series"
      ? "tv"
      : "movie";

  const { data } = await tmdbClient.get(
    `/${tmdbType}/${tmdbId}/similar`,
    {
      params: {
        page: 1,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type,
      title: item.title ?? item.name,
      posterPath: item.poster_path,
      releaseYear:
        (
          item.release_date ??
          item.first_air_date ??
          ""
        ).slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function getTrendingMovies(page = 1) {
  const { data } = await tmdbClient.get(
    "/trending/movie/week",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "movie",
      title: item.title,
      posterPath: item.poster_path,
      releaseYear:
        (item.release_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function getPopularMovies(page = 1) {
  const { data } = await tmdbClient.get(
    "/movie/popular",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "movie",
      title: item.title,
      posterPath: item.poster_path,
      releaseYear:
        (item.release_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function getTopRatedMovies(page = 1) {
  const { data } = await tmdbClient.get(
    "/movie/top_rated",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "movie",
      title: item.title,
      posterPath: item.poster_path,
      releaseYear:
        (item.release_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function getNowPlayingMovies(page = 1) {
  const { data } = await tmdbClient.get(
    "/movie/now_playing",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "movie",
      title: item.title,
      posterPath: item.poster_path,
      releaseYear:
        (item.release_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
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

export async function getTrendingSeries(page = 1) {
  const { data } = await tmdbClient.get(
    "/trending/tv/week",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "series",
      title: item.name,
      posterPath: item.poster_path,
      releaseYear:
        (item.first_air_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function getPopularSeries(page = 1) {
  const { data } = await tmdbClient.get(
    "/tv/popular",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "series",
      title: item.name,
      posterPath: item.poster_path,
      releaseYear:
        (item.first_air_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function getTopRatedSeries(page = 1) {
  const { data } = await tmdbClient.get(
    "/tv/top_rated",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "series",
      title: item.name,
      posterPath: item.poster_path,
      releaseYear:
        (item.first_air_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function getAiringTodaySeries(page = 1) {
  const { data } = await tmdbClient.get(
    "/tv/airing_today",
    {
      params: {
        page,
      },
    }
  );

  return {
    page: data.page,
    totalPages: data.total_pages,

    results: (data.results ?? []).map((item: any) => ({
      tmdbId: item.id,
      type: "series",
      title: item.name,
      posterPath: item.poster_path,
      releaseYear:
        (item.first_air_date ?? "").slice(0, 4) || null,
      rating: item.vote_average,
    })),
  };
}

export async function exploreContent(
  query = "",
  type = "",
  genre = "",
  year = "",
  rating = "",
  page = 1
) {
  const { data } = await tmdbClient.get(
    "/search/multi",
    {
      params: {
        query,
        page,
      },
    }
  );

  const results = (data.results ?? [])
    .filter((item: any) => {
      // Hanya Movie dan Series
      const validType =
        item.media_type === "movie" ||
        item.media_type === "tv";

      if (!validType) {
        return false;
      }

      // Filter type
      if (
        type &&
        (
          (type === "movie" && item.media_type !== "movie") ||
          (type === "series" && item.media_type !== "tv")
        )
      ) {
        return false;
      }

      // Filter genre
      if (
        genre &&
        !item.genre_ids?.includes(Number(genre))
      ) {
        return false;
      }

      // Filter year
      const itemYear =
        item.media_type === "movie"
          ? (item.release_date ?? "").slice(0, 4)
          : (item.first_air_date ?? "").slice(0, 4);

      if (year && itemYear !== year) {
        return false;
      }

      // Filter rating
      if (
        rating &&
        Number(item.vote_average ?? 0) < Number(rating)
      ) {
        return false;
      }

      return true;
    })
    .map((item: any) => ({
      tmdbId: item.id,
      type:
        item.media_type === "tv"
          ? "series"
          : "movie",
      title:
        item.media_type === "movie"
          ? item.title
          : item.name,
      posterPath: item.poster_path,
      releaseYear:
        (
          item.media_type === "movie"
            ? item.release_date
            : item.first_air_date
        )?.slice(0, 4) || null,
      rating: item.vote_average,
    }));

  return {
    page: data.page,
    totalPages: data.total_pages,
    results,
  };
}