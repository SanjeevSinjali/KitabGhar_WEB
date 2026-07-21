"use server";

import {
  fetchMyNotifications,
  markMyNotificationReadApi,
  markAllMyNotificationsReadApi,
} from "@/lib/api/notifications";

export async function handleGetMyNotifications(
  { page, limit }: { page?: number; limit?: number } = {}
) {
  try {
    const result = await fetchMyNotifications({ page, limit });
    if (result.success) {
      return {
        success: true,
        notifications: result.data.notifications,
        unread: result.data.unread,
      };
    }
    return { success: false, message: result.message || "Failed to fetch notifications" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch notifications";
    return { success: false, message: msg };
  }
}

export async function handleMarkMyNotificationRead(id: string) {
  try {
    const result = await markMyNotificationReadApi(id);
    return { success: result.success, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to mark notification as read";
    return { success: false, message: msg };
  }
}

export async function handleMarkAllMyNotificationsRead() {
  try {
    const result = await markAllMyNotificationsReadApi();
    return { success: result.success, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to mark notifications as read";
    return { success: false, message: msg };
  }
}