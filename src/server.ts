import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { moviesRouter } from "./modules/movies/movies.routes";
import { movieReviewsRouter, reviewsRouter } from "./modules/reviews/reviews.routes";
import { watchlistRouter } from "./modules/watchlist/watchlist.routes";
import { watchedRouter } from "./modules/watched/watched.routes";
import { socialRouter } from "./modules/social/social.routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true })); // sesuaikan port Vite frontend
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/movies/:movieId/reviews", movieReviewsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/watchlist", watchlistRouter);
app.use("/api/watched", watchedRouter);
app.use("/api/users", socialRouter);

app.get("/", (_req, res) => {
  res.json({ status: "SceneIt API is running" });
});

app.listen(env.port, () => {
  console.log(`Server jalan di http://localhost:${env.port}`);
});