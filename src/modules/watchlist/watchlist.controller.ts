import type { Request, Response } from "express";
import { addToWatchlist, removeFromWatchlist, getUserWatchlist } from "./watchlist.service";

export async function add(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);

  try {
    const entry = await addToWatchlist(req.user!.userId, movieId);
    return res.status(201).json({ watchlist: entry });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_IN_WATCHLIST") {
      return res.status(409).json({ message: "Film/series ini sudah ada di watchlist kamu" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function remove(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);

  try {
    await removeFromWatchlist(req.user!.userId, movieId);
    return res.json({ message: "Dihapus dari watchlist" });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Film/series ini tidak ada di watchlist kamu" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function list(req: Request, res: Response) {
  const data = await getUserWatchlist(req.user!.userId);
  return res.json({ watchlist: data });
}