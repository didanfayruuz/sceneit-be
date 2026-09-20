import { Router } from "express";
import { search, detail } from "./movies.controller";

export const moviesRouter = Router();

moviesRouter.get("/", search);        // GET /api/movies?query=&type=&page=
moviesRouter.get("/:id", detail);     // GET /api/movies/:id?type=movie|series