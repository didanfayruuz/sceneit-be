import type { Request, Response } from "express";
import { getActivityFeed } from "./feed.service";

export async function feed(req: Request, res: Response) {
  const data = await getActivityFeed(req.user!.userId);
  return res.json({ feed: data });
}