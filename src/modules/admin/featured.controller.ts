import type { Request, Response } from "express";
import { setFeatured, updateFeatured, removeFeatured } from "./featured.service";

export async function create(req: Request, res: Response) {
  const { tmdbId, type, featuredReviewId } = req.body;
  if (!tmdbId || !["movie", "series"].includes(type)) {
    return res.status(400).json({ message: "tmdbId dan type ('movie'/'series') wajib diisi" });
  }
  try {
    const entry = await setFeatured({
      tmdbId: Number(tmdbId),
      type,
      featuredReviewId: featuredReviewId ? Number(featuredReviewId) : undefined,
      setByAdminId: req.user!.userId,
    });
    return res.status(201).json({ featured: entry });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_FEATURED") {
      return res.status(409).json({ message: "Movie/series ini sudah jadi featured" });
    }
    if (err instanceof Error && err.message === "MAX_FEATURED_REACHED") {
      return res.status(409).json({ message: "Sudah mencapai batas maksimal 5 Featured Content" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { tmdbId, type, featuredReviewId } = req.body;
  try {
    const updated = await updateFeatured(id, {
      tmdbId: tmdbId ? Number(tmdbId) : undefined,
      type: type === "series" ? "series" : type === "movie" ? "movie" : undefined,
      featuredReviewId: featuredReviewId !== undefined ? (featuredReviewId ? Number(featuredReviewId) : null) : undefined,
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