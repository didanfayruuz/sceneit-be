import { pgTable, serial, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { integer, unique } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const contentTypeEnum = pgEnum("content_type", ["movie", "series"]);

export const movies = pgTable(
  "movies",
  {
    id: serial("id").primaryKey(),
    tmdbId: integer("tmdb_id").notNull(),
    type: contentTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    posterPath: text("poster_path"),
    genres: text("genres"), // disimpan sebagai string dipisah koma, mis. "Action,Thriller"
    releaseYear: integer("release_year"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tmdbTypeUnique: unique().on(table.tmdbId, table.type),
  })
);

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    movieId: integer("movie_id").notNull().references(() => movies.id),
    rating: integer("rating").notNull(), // skala 1-5 (lihat catatan di bawah)
    content: text("content").notNull(),
    containsSpoiler: boolean("contains_spoiler").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    oneReviewPerUserPerMovie: unique().on(table.userId, table.movieId),
  })
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  movie: one(movies, { fields: [reviews.movieId], references: [movies.id] }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export const watchlist = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    movieId: integer("movie_id").notNull().references(() => movies.id),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => ({
    oneEntryPerUserPerMovie: unique().on(table.userId, table.movieId),
  })
);

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, { fields: [watchlist.userId], references: [users.id] }),
  movie: one(movies, { fields: [watchlist.movieId], references: [movies.id] }),
}));

export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;

export const watched = pgTable(
  "watched",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    movieId: integer("movie_id").notNull().references(() => movies.id),
    watchedAt: timestamp("watched_at").notNull().defaultNow(),
  },
  (table) => ({
    oneEntryPerUserPerMovie: unique().on(table.userId, table.movieId),
  })
);

export const watchedRelations = relations(watched, ({ one }) => ({
  user: one(users, { fields: [watched.userId], references: [users.id] }),
  movie: one(movies, { fields: [watched.movieId], references: [movies.id] }),
}));

export type Watched = typeof watched.$inferSelect;
export type NewWatched = typeof watched.$inferInsert;

export const likes = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    reviewId: integer("review_id").notNull().references(() => reviews.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    oneLikePerUserPerReview: unique().on(table.userId, table.reviewId),
  })
);

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  review: one(reviews, { fields: [likes.reviewId], references: [reviews.id] }),
}));

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id").notNull().references(() => users.id),
    followingId: integer("following_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    oneFollowPerPair: unique().on(table.followerId, table.followingId),
  })
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    movieId: integer("movie_id").notNull().references(() => movies.id),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => ({
    oneEntryPerUserPerMovie: unique().on(table.userId, table.movieId),
  })
);

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  movie: one(movies, { fields: [favorites.movieId], references: [movies.id] }),
}));

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;