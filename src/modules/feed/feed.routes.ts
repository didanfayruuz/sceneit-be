import { Router } from "express";
import { feed } from "./feed.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const feedRouter = Router();
feedRouter.get("/", requireAuth, feed); // GET /api/feed