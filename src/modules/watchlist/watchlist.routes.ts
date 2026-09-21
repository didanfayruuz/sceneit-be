import { Router } from "express";
import { add, remove, list } from "./watchlist.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const watchlistRouter = Router();

watchlistRouter.get("/", requireAuth, list);          // GET    /api/watchlist
watchlistRouter.post("/:movieId", requireAuth, add);  // POST   /api/watchlist/:movieId
watchlistRouter.delete("/:movieId", requireAuth, remove); // DELETE /api/watchlist/:movieId