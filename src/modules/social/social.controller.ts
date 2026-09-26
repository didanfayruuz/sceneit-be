import type { Request, Response } from "express";
import { followUser, unfollowUser, getFollowStatus, getFollowers, getFollowing, searchUsers} from "./social.service";
import { getPublicUserById } from "../auth/auth.service";

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

export async function status(req: Request, res: Response) {
  const targetId = Number(req.params.id);
  if (Number.isNaN(targetId)) {
    return res.status(400).json({ message: "User ID tidak valid" });
  }
  const result = await getFollowStatus(req.user!.userId, targetId);
  return res.json(result);
}

export async function followers(req: Request, res: Response) {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "User ID tidak valid" });
  }
  const data = await getFollowers(userId);
  return res.json({ followers: data });
}

export async function following(req: Request, res: Response) {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "User ID tidak valid" });
  }
  const data = await getFollowing(userId);
  return res.json({ following: data });
}

export async function search(req: Request, res: Response) {
  const query = String(req.query.query || "").trim();

  if (!query) {
    return res.json({ users: [] });
  }

  try {
    const data = await searchUsers(query, req.user!.userId);

    return res.json({ users: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
}

export async function profile(req: Request, res: Response) {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  try {
    const user = await getPublicUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("GET PUBLIC PROFILE ERROR:", err);

    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
}