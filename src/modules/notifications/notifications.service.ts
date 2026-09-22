import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { notifications } from "../../db/schema";

type NotificationType = "follow" | "like";

export async function createNotification(input: {
  userId: number;
  type: NotificationType;
  sourceUserId: number;
  reviewId?: number;
}) {
  if (input.userId === input.sourceUserId) return null; // jangan notifikasi diri sendiri
  const [entry] = await db.insert(notifications).values(input).returning();
  return entry;
}

export async function getUserNotifications(userId: number) {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: desc(notifications.createdAt),
    with: {
      sourceUser: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function markAsRead(notificationId: number, userId: number) {
  const existing = await db.query.notifications.findFirst({
    where: eq(notifications.id, notificationId),
  });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.userId !== userId) throw new Error("FORBIDDEN");

  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId))
    .returning();

  return updated;
}

export async function markAllAsRead(userId: number) {
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}