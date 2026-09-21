import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt";

// Extend Request agar bisa membawa user payload
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  // Baca token dari cookie (browser) ATAU Authorization Bearer header (Postman/API client)
  const cookieToken = req.cookies?.token as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = cookieToken ?? bearerToken;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: token tidak ditemukan" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized: token tidak valid atau kedaluwarsa" });
  }
}
