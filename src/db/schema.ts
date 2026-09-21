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