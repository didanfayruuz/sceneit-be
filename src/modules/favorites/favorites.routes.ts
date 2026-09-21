import { Router } from "express";
import { add, remove, list } from "./favorites.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const favoritesRouter = Router();

favoritesRouter.get("/", requireAuth, list);              // GET    /api/favorites
favoritesRouter.post("/:movieId", requireAuth, add);      // POST   /api/favorites/:movieId
favoritesRouter.delete("/:movieId", requireAuth, remove); // DELETE /api/favorites/:movieId
