import { Router } from "express";
import { list, markRead, markAllRead } from "./notifications.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, list);                 // GET   /api/notifications
notificationsRouter.patch("/read-all", requireAuth, markAllRead); // PATCH /api/notifications/read-all
notificationsRouter.patch("/:id/read", requireAuth, markRead);    // PATCH /api/notifications/:id/read