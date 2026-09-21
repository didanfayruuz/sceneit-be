import type { Request, Response } from "express";
import { getActivityFeed } from "./feed.service";

export async function getFeed(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 20;

  try {
    const feed = await getActivityFeed(req.user!.userId, limit);
    return res.json({ feed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}
