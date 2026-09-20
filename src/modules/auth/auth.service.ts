// src/modules/auth/auth.service.ts
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { hashPassword, comparePassword } from "../../utils/hash";
import type { RegisterInput, LoginInput } from "./auth.validation";

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

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
}