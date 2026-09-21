import type { Request, Response } from "express";
import { likeReview, unlikeReview } from "./likes.service";

export async function like(req: Request, res: Response) {
  const reviewId = Number(req.params.id);

  try {
    const entry = await likeReview(req.user!.userId, reviewId);
    return res.status(201).json({ like: entry });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_LIKED") {
      return res.status(409).json({ message: "Kamu sudah like review ini" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function unlike(req: Request, res: Response) {
  const reviewId = Number(req.params.id);

  try {
    await unlikeReview(req.user!.userId, reviewId);
    return res.json({ message: "Batal like" });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Kamu belum like review ini" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}