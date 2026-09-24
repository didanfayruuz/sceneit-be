import { Router } from "express";
import { getCurrentFeatured } from "../admin/featured.service";

export const featuredPublicRouter = Router();

featuredPublicRouter.get("/", async (_req, res) => {
  const data = await getCurrentFeatured();
  return res.json({ featured: data ?? null });
}); // GET /api/featured