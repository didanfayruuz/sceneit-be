import type { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validation";
import { signToken } from "../../utils/jwt";
import type { AuthRequest } from "../../middlewares/auth.middleware";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
};

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validasi gagal", errors: parsed.error.flatten() });
    return;
  }

  try {
    const user = await registerUser(parsed.data);
    const token = signToken({ userId: user.id, role: user.role });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({
      message: "Registrasi berhasil",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "EMAIL_ALREADY_USED") {
      res.status(409).json({ message: "Email sudah digunakan" });
      return;
    }
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validasi gagal", errors: parsed.error.flatten() });
    return;
  }

  try {
    const user = await loginUser(parsed.data);
    const token = signToken({ userId: user.id, role: user.role });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(200).json({
      message: "Login berhasil",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ message: "Email atau password salah" });
      return;
    }
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME);
  res.status(200).json({ message: "Logout berhasil" });
}

export function me(req: AuthRequest, res: Response): void {
  res.status(200).json({ user: req.user });
}
