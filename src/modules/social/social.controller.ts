import type { Request, Response } from "express";
import { followUser, unfollowUser } from "./social.service";

export async function follow(req: Request, res: Response) {
  const followingId = Number(req.params.id);

  if (Number.isNaN(followingId)) {
    return res.status(400).json({ message: "User ID tidak valid" });
  }

  try {
    const entry = await followUser(req.user!.userId, followingId);
    return res.status(201).json({ message: "Berhasil mengikuti user", follow: entry });
  } catch (err) {
    if (err instanceof Error && err.message === "CANNOT_FOLLOW_SELF") {
      return res.status(400).json({ message: "Kamu tidak bisa mengikuti diri sendiri" });
    }
    if (err instanceof Error && err.message === "ALREADY_FOLLOWING") {
      return res.status(409).json({ message: "Kamu sudah mengikuti user ini" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function unfollow(req: Request, res: Response) {
  const followingId = Number(req.params.id);

  if (Number.isNaN(followingId)) {
    return res.status(400).json({ message: "User ID tidak valid" });
  }

  try {
    await unfollowUser(req.user!.userId, followingId);
    return res.json({ message: "Berhasil berhenti mengikuti user" });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Kamu belum mengikuti user ini" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}
