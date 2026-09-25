import { Router } from "express";
import { getFeaturedList } from "../admin/featured.service";

export const featuredPublicRouter = Router();

featuredPublicRouter.get("/", async (_req, res) => {
  const data = await getFeaturedList(5);
  return res.json({ featured: data });
}); // GET /api/featured