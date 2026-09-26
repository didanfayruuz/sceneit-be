import { eq, inArray, desc } from "drizzle-orm";
import { db } from "../../db";
import { follows, reviews, watchlist, watched } from "../../db/schema";

export async function getActivityFeed(userId: number, limit = 20) {
  const followingRows = await db.query.follows.findMany({
    where: eq(follows.followerId, userId),
    columns: { followingId: true },
  });
  const followingIds = followingRows.map((f) => f.followingId);

  if (followingIds.length === 0) return [];

  const [reviewActivities, watchlistActivities, watchedActivities] = await Promise.all([
    db.query.reviews.findMany({
      where: inArray(reviews.userId, followingIds),
      orderBy: desc(reviews.createdAt),
      limit,
      with: {
        user: { columns: { id: true, name: true, avatarUrl: true } },
        movie: { columns: { id: true, tmdbId: true, title: true, posterPath: true, type: true } },
      },
    }),
    db.query.watchlist.findMany({
      where: inArray(watchlist.userId, followingIds),
      orderBy: desc(watchlist.addedAt),
      limit,
      with: {
        user: { columns: { id: true, name: true, avatarUrl: true } },
        movie: { columns: { id: true, tmdbId: true, title: true, posterPath: true, type: true } },
      },
    }),
    db.query.watched.findMany({
      where: inArray(watched.userId, followingIds),
      orderBy: desc(watched.watchedAt),
      limit,
      with: {
        user: { columns: { id: true, name: true, avatarUrl: true } },
        movie: { columns: { id: true, tmdbId: true, title: true, posterPath: true, type: true } },
      },
    }),
  ]);

  const feed = [
    ...reviewActivities.map((r) => ({
      type: "review" as const,
      timestamp: r.createdAt,
      user: r.user,
      movie: r.movie,
      review: { id: r.id, rating: r.rating, content: r.content, containsSpoiler: r.containsSpoiler },
    })),
    ...watchlistActivities.map((w) => ({
      type: "watchlist" as const,
      timestamp: w.addedAt,
      user: w.user,
      movie: w.movie,
    })),
    ...watchedActivities.map((w) => ({
      type: "watched" as const,
      timestamp: w.watchedAt,
      user: w.user,
      movie: w.movie,
    })),
  ];

  feed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return feed.slice(0, limit);
}