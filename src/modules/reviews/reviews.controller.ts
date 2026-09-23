import type { Request, Response } from "express";
import { createReviewSchema, updateReviewSchema } from "./reviews.validation";
import { createReview, getReviewsByMovie,getReviewsByUser, updateReview, deleteReview, getPopularReviews } from "./reviews.service";

export async function create(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  try {
    const review = await createReview(req.user!.userId, movieId, parsed.data);
    return res.status(201).json({ review });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_REVIEWED") {
      return res.status(409).json({ message: "Kamu sudah pernah mereview film/series ini" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function listByMovie(req: Request, res: Response) {
  const movieId = Number(req.params.movieId);
  const data = await getReviewsByMovie(movieId);
  return res.json({ reviews: data });
}

export async function listMine(req: Request, res: Response) {
  const data = await getReviewsByUser(req.user!.userId);
  return res.json({ reviews: data });
}

export async function update(req: Request, res: Response) {
  const reviewId = Number(req.params.id);
  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  try {
    const review = await updateReview(reviewId, req.user!.userId, parsed.data);
    return res.json({ review });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Kamu tidak boleh mengedit review orang lain" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function remove(req: Request, res: Response) {
  const reviewId = Number(req.params.id);

  try {
    await deleteReview(reviewId, req.user!.userId);
    return res.json({ message: "Review dihapus" });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Review tidak ditemukan" });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Kamu tidak boleh menghapus review orang lain" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function listPopular(req: Request, res: Response) {
  const limit = Number(req.query.limit ?? 10);
  const data = await getPopularReviews(limit);
  return res.json({ reviews: data });
}