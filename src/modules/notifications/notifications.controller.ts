import type { Request, Response } from "express";
import { getUserNotifications, markAsRead, markAllAsRead } from "./notifications.service";

export async function list(req: Request, res: Response) {
  const data = await getUserNotifications(req.user!.userId);
  return res.json({ notifications: data });
}

export async function markRead(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const updated = await markAsRead(id, req.user!.userId);
    return res.json({ notification: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Ini bukan notifikasi kamu" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}

export async function markAllRead(req: Request, res: Response) {
  await markAllAsRead(req.user!.userId);
  return res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
}