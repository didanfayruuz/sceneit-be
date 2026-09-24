import type { Request, Response } from "express";
import { getAllReports, updateReportStatus } from "./reports.service";

export async function list(req: Request, res: Response) {
  const data = await getAllReports();
  return res.json({ reports: data });
}

export async function updateStatus(req: Request, res: Response) {
  const reportId = Number(req.params.id);
  const status = req.body.status;

  if (!["reviewed", "removed"].includes(status)) {
    return res.status(400).json({ message: "Status harus 'reviewed' atau 'removed'" });
  }

  try {
    const updated = await updateReportStatus(reportId, status);
    return res.json({ report: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}