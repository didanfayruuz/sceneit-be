import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getAllUsers, deactivateUser } from "./users.service";
import { db } from "../../db";
import { users } from "../../db/schema";

export async function list(req: Request, res: Response) {
  const data = await getAllUsers();
  return res.json({ users: data });
}

export async function deactivate(req: Request, res: Response) {
  const userId = Number(req.params.id);

  if (userId === req.user!.userId) {
    return res.status(400).json({ message: "Kamu tidak bisa menonaktifkan akunmu sendiri" });
  }

  try {
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });
    if (!targetUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    if (targetUser.role === "admin") {
      return res.status(403).json({ message: "Tidak bisa menonaktifkan sesama admin" });
    }

    const updated = await deactivateUser(userId);
    return res.json({ user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}