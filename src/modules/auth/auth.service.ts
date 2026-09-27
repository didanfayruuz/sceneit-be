import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { hashPassword, comparePassword } from "../../utils/hash";
import type { RegisterInput, LoginInput, UpdateProfileInput } from "./auth.validation";

export async function registerUser(input: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });
  if (existing) {
    throw new Error("EMAIL_ALREADY_USED");
  }

  const passwordHash = await hashPassword(input.password);

  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
    })
    .returning();

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DEACTIVATED");
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
}

export async function getUserById(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, email: true, avatarUrl: true, bio: true, role: true, createdAt: true },
  });
}

export async function updateUserProfile(userId: number, input: UpdateProfileInput) {
  const [updated] = await db
    .update(users)
    .set(input)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      role: users.role,
      createdAt: users.createdAt,
    });
  if (!updated) throw new Error("NOT_FOUND");
  return updated;
}

export async function getPublicUserById(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, avatarUrl: true, bio: true, createdAt: true },
  });
}

