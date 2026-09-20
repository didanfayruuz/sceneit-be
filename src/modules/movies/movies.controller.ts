import type { Request, Response } from "express";
import { searchContent, getContentDetail } from "./movies.service";

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