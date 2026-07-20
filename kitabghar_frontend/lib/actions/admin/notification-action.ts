"use server";

import {
  fetchNotifications,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "@/lib/api/admin/notification";

export async function handleGetNotifications(
  { page, limit }: { page?: number; limit?: number } = {}
) {
  try {
    const result = await fetchNotifications({ page, limit });
    if (result.success) {
      return {
        success: true,
        notifications: result.data.notifications,
        unread: result.data.unread,
        pagination: result.meta,
      };
    }
    return { success: false, message: result.message || "Failed to fetch notifications" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch notifications";
    return { success: false, message: msg };
  }
}

export async function handleMarkNotificationRead(id: string) {
  try {
    const result = await markNotificationReadApi(id);
    return { success: result.success, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to mark notification as read";
    return { success: false, message: msg };
  }
}

export async function handleMarkAllNotificationsRead() {
  try {
    const result = await markAllNotificationsReadApi();
    return { success: result.success, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to mark notifications as read";
    return { success: false, message: msg };
  }
}