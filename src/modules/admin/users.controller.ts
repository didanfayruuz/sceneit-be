import type { Request, Response } from "express";
import { getAllUsers, deactivateUser } from "./users.service";

export async function list(req: Request, res: Response) {
  const data = await getAllUsers();
  return res.json({ users: data });
}

export async function deactivate(req: Request, res: Response) {
	const userId = Number(req.params.id);

  try {
    const updated = await deactivateUser(userId);
		return res.json({ user: updated });
	} catch (err) {
		if (err instanceof Error && err.message === "NOT_FOUND") {
			return res.status(404).json({ message: "User tidak ditemukan" });
		}
		console.error(err);
		return res.status(500).json({ message: "Terjadi kesalahan server" });
	}
}