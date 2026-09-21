import { Router } from "express";
import { add, remove, list } from "./watched.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const watchedRouter = Router();

watchedRouter.get("/", requireAuth, list);
watchedRouter.post("/:movieId", requireAuth, add);
watchedRouter.delete("/:movieId", requireAuth, remove);