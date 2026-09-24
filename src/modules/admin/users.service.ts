import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export async function getAllUsers() {
  return db.query.users.findMany({
    columns: { id: true, name: true, email: true, role: true, isActive: true,createdAt: true },
  });
}

export async function deactivateUser(userId: number) {
  const existing = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!existing) throw new Error("NOT_FOUND");

  const [updated] = await db
    .update(users)
    .set({ isActive: false })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, isActive: users.isActive });

	return updated;
}