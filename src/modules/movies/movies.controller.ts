import type { Request, Response } from "express";
import { searchContent, getContentDetail, getSimilarContent, getTrendingMovies, getPopularMovies, getTopRatedMovies, getNowPlayingMovies,
  getTrendingSeries, getPopularSeries, getTopRatedSeries, getAiringTodaySeries, exploreContent } from "./movies.service";

export async function search(req: Request, res: Response) {
  const query = String(req.query.query ?? "");
  const type = req.query.type === "series" ? "series" : "movie";
  const page = Number(req.query.page ?? 1);

  if (!query) {
    return res.status(400).json({ message: "Query pencarian wajib diisi" });
  }

  try {
    const result = await searchContent(query, type, page);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ message: "Gagal mengambil data dari TMDB" });
  }
}

export async function detail(req: Request, res: Response) {
  const tmdbId = Number(req.params.id);
  const type = req.query.type === "series" ? "series" : "movie";

  if (Number.isNaN(tmdbId)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  try {
    const result = await getContentDetail(tmdbId, type);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(502).json({ message: "Gagal mengambil detail dari TMDB" });
  }
}

export async function similar(req: Request, res: Response) {

  const tmdbId = Number(req.params.id);

  const type =
    req.query.type === "series"
      ? "series"
      : "movie";

  if (Number.isNaN(tmdbId)) {
    return res.status(400).json({
      message: "ID tidak valid",
    });
  }

  try {

    const result =
      await getSimilarContent(tmdbId, type);

    return res.json(result);

  } catch (err) {

    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil similar content dari TMDB",
    });

  }
}

export async function trending(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getTrendingMovies(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil trending movies dari TMDB",
    });
  }
}

export async function popular(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getPopularMovies(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil popular movies dari TMDB",
    });
  }
}

export async function topRated(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getTopRatedMovies(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil top rated movies dari TMDB",
    });
  }
}

export async function nowPlaying(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getNowPlayingMovies(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil now playing movies dari TMDB",
    });
  }
}

export async function trendingSeries(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getTrendingSeries(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil trending series dari TMDB",
    });
  }
}

export async function popularSeries(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getPopularSeries(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil popular series dari TMDB",
    });
  }
}

export async function topRatedSeries(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getTopRatedSeries(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil top rated series dari TMDB",
    });
  }
}

export async function airingTodaySeries(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);

  try {
    const result = await getAiringTodaySeries(page);

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal mengambil airing today series dari TMDB",
    });
  }
}

export async function explore(req: Request, res: Response) {
  const query = String(req.query.query ?? "");
  const type = String(req.query.type ?? "");
  const genre = String(req.query.genre ?? "");
  const year = String(req.query.year ?? "");
  const rating = String(req.query.rating ?? "");
  const page = Number(req.query.page ?? 1);

  if (!query) {
    return res.status(400).json({
      message: "Query pencarian wajib diisi",
    });
  }

  try {
    const result = await exploreContent(
      query,
      type,
      genre,
      year,
      rating,
      page
    );

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(502).json({
      message: "Gagal melakukan explore content dari TMDB",
    });
  }
}