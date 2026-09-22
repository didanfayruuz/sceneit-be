import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: "user" | "admin" };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}