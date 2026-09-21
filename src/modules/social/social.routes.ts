import { Router } from "express";
import { follow, unfollow } from "./social.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const socialRouter = Router();

socialRouter.post("/:id/follow", requireAuth, follow);     // POST   /api/users/:id/follow
socialRouter.delete("/:id/follow", requireAuth, unfollow); // DELETE /api/users/:id/follow