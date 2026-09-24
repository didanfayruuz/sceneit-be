import { Router } from "express";
import { create, listByMovie, listMine, update, remove, listPopular, report } from "./reviews.controller";
import { like, unlike } from "../likes/likes.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

// Router ini nempel di path /api/movies/:movieId/reviews
export const movieReviewsRouter = Router({ mergeParams: true });
movieReviewsRouter.get("/", listByMovie);          // GET  /api/movies/:movieId/reviews
movieReviewsRouter.post("/", requireAuth, create); // POST /api/movies/:movieId/reviews

// Router ini nempel di path /api/reviews
export const reviewsRouter = Router();
reviewsRouter.get("/popular", listPopular);               // GET /api/reviews/popular?limit=10
reviewsRouter.get("/me", requireAuth, listMine);          // GET    /api/reviews/me 
reviewsRouter.patch("/:id", requireAuth, update);         // PATCH  /api/reviews/:id
reviewsRouter.delete("/:id", requireAuth, remove);        // DELETE /api/reviews/:id
reviewsRouter.post("/:id/like", requireAuth, like);       // POST   /api/reviews/:id/like
reviewsRouter.delete("/:id/like", requireAuth, unlike);   // DELETE /api/reviews/:id/like
reviewsRouter.post("/:id/report", requireAuth, report);   // POST /api/reviews/:id/report