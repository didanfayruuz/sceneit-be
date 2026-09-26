import { Router } from "express";
import { follow, unfollow, status, followers, following, search } from "./social.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const socialRouter = Router();
socialRouter.get("/search", requireAuth, search); // GET /api/users/search
socialRouter.post("/:id/follow", requireAuth, follow);     // POST   /api/users/:id/follow
socialRouter.delete("/:id/follow", requireAuth, unfollow); // DELETE /api/users/:id/follow
socialRouter.get("/:id/follow-status", requireAuth, status);  // GET /api/users/:id/follow-status
socialRouter.get("/:id/followers", followers);                 // GET /api/users/:id/followers
socialRouter.get("/:id/following", following);                 // GET /api/users/:id/following