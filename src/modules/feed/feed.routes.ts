import { Router } from "express";
import { getFeed } from "./feed.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const feedRouter = Router();

feedRouter.get("/", requireAuth, getFeed); // GET /api/feed
