import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";
import { list as listReports, updateStatus } from "./reports.controller";
import { create as createFeatured } from "./featured.controller";
import { list as listUsers, deactivate } from "./users.controller";

export const adminRouter = Router();

// Semua route DI BAWAH baris ini otomatis wajib login + wajib role admin
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/reports", listReports);              // GET   /api/admin/reports
adminRouter.patch("/reports/:id", updateStatus);        // PATCH /api/admin/reports/:id
adminRouter.post("/featured", createFeatured);          // POST  /api/admin/featured
adminRouter.get("/users", listUsers);                   // GET   /api/admin/users
adminRouter.patch("/users/:id/deactivate", deactivate); // PATCH /api/admin/users/:id/deactivate