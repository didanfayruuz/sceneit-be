import type { Request, Response } from "express";
import { setFeatured } from "./featured.service";

export async function create(req: Request, res: Response) {
  const { movieId, featuredReviewId } = req.body;

  if (!movieId) {
    return res.status(400).json({ message: "movieId wajib diisi" });
  }

  const entry = await setFeatured({
    movieId: Number(movieId),
    featuredReviewId: featuredReviewId ? Number(featuredReviewId) : undefined,
    setByAdminId: req.user!.userId,
  });

  return res.status(201).json({ featured: entry });
}