import type { Request, Response } from "express";
import { addToFavorites, removeFromFavorites, getUserFavorites } from "./favorites.service";

export async function add(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);

  try {
    const entry = await addToFavorites(req.user!.userId, movieId);
    return res.status(201).json({ favorite: entry });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_FAVORITED") {
      return res.status(409).json({ message: "Film/series ini sudah ada di favorite kamu" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function remove(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);

  try {
    await removeFromFavorites(req.user!.userId, movieId);
    return res.json({ message: "Dihapus dari favorite" });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Film/series ini tidak ada di favorite kamu" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function list(req: Request, res: Response) {
  const data = await getUserFavorites(req.user!.userId);
  return res.json({ favorites: data });
}