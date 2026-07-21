import type { Request, Response } from "express";
import {
  listMyNotifications,
  readMyNotification,
  readAllMyNotifications,
} from "../services/notification.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const { data, unread, meta } = await listMyNotifications((req as any).user.id, page, limit);
    return sendSuccess(res, { notifications: data, unread }, "Notifications retrieved successfully", 200, meta);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function markMyNotificationRead(req: Request<{ id: string }>, res: Response) {
  try {
    const notification = await readMyNotification((req as any).user.id, req.params.id);
    return sendSuccess(res, notification, "Notification marked as read");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function markAllMyNotificationsRead(req: Request, res: Response) {
  try {
    await readAllMyNotifications((req as any).user.id);
    return sendSuccess(res, null, "All notifications marked as read");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}