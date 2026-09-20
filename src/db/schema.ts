import { pgTable, serial, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { integer, unique } from "drizzle-orm/pg-core";

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