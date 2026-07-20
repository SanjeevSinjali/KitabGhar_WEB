import type { Request, Response } from "express";
import {
  listNotifications,
  readNotification,
  readAllNotifications,
} from "../../services/notification.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export async function getNotifications(req: Request, res: Response) {
  try {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const { data, unread, meta } = await listNotifications(page, limit);
    return sendSuccess(res, { notifications: data, unread }, "Notifications retrieved successfully", 200, meta);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function markRead(req: Request<{ id: string }>, res: Response) {
  try {
    const notification = await readNotification(req.params.id);
    return sendSuccess(res, notification, "Notification marked as read");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    await readAllNotifications();
    return sendSuccess(res, null, "All notifications marked as read");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}