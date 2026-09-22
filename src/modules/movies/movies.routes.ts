import { Router } from "express";
import { search, detail, similar, trending, popular, topRated, nowPlaying,
trendingSeries, popularSeries, topRatedSeries, airingTodaySeries, explore} from "./movies.controller";

export const moviesRouter = Router();

moviesRouter.get("/", search);        // GET /api/movies?query=&type=&page=

moviesRouter.get("/trending", trending); // GET /api/movies/trending?page=1
moviesRouter.get("/popular", popular); // GET /api/movies/popular?page=1
moviesRouter.get("/top-rated", topRated); // GET /api/movies/top-rated?page=1
moviesRouter.get("/now-playing", nowPlaying); // GET /api/movies/now-playing?page=1

moviesRouter.get("/trending-series", trendingSeries); // GET /api/movies/trending-series?page=1
moviesRouter.get("/popular-series", popularSeries); // GET /api/movies/popular-series?page=1
moviesRouter.get("/top-rated-series", topRatedSeries); // GET /api/movies/top-rated-series?page=1
moviesRouter.get("/airing-today-series", airingTodaySeries); // GET /api/movies/airing-today-series?page=1

moviesRouter.get("/explore", explore); // GET /api/movies/explore?query=&type=&genre=&year=&rating=&page=1
moviesRouter.get("/:id/similar", similar); // GET /api/movies/:id/similar?type=movie|series
moviesRouter.get("/:id", detail);     // GET /api/movies/:id?type=movie|series
