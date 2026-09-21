import type { Request, Response } from "express";
import { addToWatched, removeFromWatched, getUserWatched } from "./watched.service";

export async function add(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);

  try {
    const entry = await addToWatched(req.user!.userId, movieId);
    return res.status(201).json({ watched: entry });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_WATCHED") {
      return res.status(409).json({ message: "Film/series ini sudah ada di watched list kamu" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function remove(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);

  try {
    await removeFromWatched(req.user!.userId, movieId);
    return res.json({ message: "Dihapus dari watched list" });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Film/series ini tidak ada di watched list kamu" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function list(req: Request, res: Response) {
  const data = await getUserWatched(req.user!.userId);
  return res.json({ watched: data });
}