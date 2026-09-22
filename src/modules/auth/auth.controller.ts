import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validation";
import { registerUser, loginUser, getUserById } from "./auth.service";
import { signToken } from "../../utils/jwt";
import { env } from "../../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
};

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  try {
    const user = await registerUser(parsed.data);
    const token = signToken({ userId: user.id, role: user.role });
    res.cookie("token", token, COOKIE_OPTIONS);
    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_USED") {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  try {
    const user = await loginUser(parsed.data);
    const token = signToken({ userId: user.id, role: user.role });
    res.cookie("token", token, COOKIE_OPTIONS);
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Email atau password salah" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  return res.json({ message: "Logout berhasil" });
}

export async function me(req: Request, res: Response) {
  const user = await getUserById(req.user!.userId);
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
  return res.json({ user });
}