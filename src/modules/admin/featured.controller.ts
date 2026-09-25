import type { Request, Response } from "express";
import { setFeatured, updateFeatured, removeFeatured } from "./featured.service";

export async function create(req: Request, res: Response) {
  const { movieId, featuredReviewId } = req.body;
  if (!movieId) return res.status(400).json({ message: "movieId wajib diisi" });

  try {
    const entry = await setFeatured({
      movieId: Number(movieId),
      featuredReviewId: featuredReviewId ? Number(featuredReviewId) : undefined,
      setByAdminId: req.user!.userId,
    });
    return res.status(201).json({ featured: entry });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_FEATURED") {
      return res.status(409).json({ message: "Movie/series ini sudah jadi featured" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { movieId, featuredReviewId } = req.body;

  try {
    const updated = await updateFeatured(id, {
      movieId: movieId ? Number(movieId) : undefined,
      featuredReviewId: featuredReviewId ? Number(featuredReviewId) : undefined,
    });
    return res.json({ featured: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Featured content tidak ditemukan" });
    }
    if (err instanceof Error && err.message === "ALREADY_FEATURED") {
      return res.status(409).json({ message: "Movie/series ini sudah jadi featured lain" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await removeFeatured(id);
    return res.json({ message: "Featured content dihapus" });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Featured content tidak ditemukan" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}