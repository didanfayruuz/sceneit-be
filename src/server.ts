import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { moviesRouter } from "./modules/movies/movies.routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true })); // sesuaikan port Vite frontend
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/movies", moviesRouter);

app.get("/", (_req, res) => {
  res.json({ status: "SceneIt API is running" });
});

app.listen(env.port, () => {
  console.log(`Server jalan di http://localhost:${env.port}`);
});