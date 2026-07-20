import {
  createNotification,
  getNotificationsPaginated,
  markNotificationRead,
  markAllNotificationsRead,
} from "../repositories/notification.repository";

export async function notifyProfileUpdate(
  userId: string,
  userName: string,
  changedFields: string[]
) {
  if (changedFields.length === 0) return;

  const message = `${userName} updated their ${changedFields.join(", ")}.`;

  return createNotification({
    type: "profile_update",
    message,
    user: userId,
    changedFields,
  });
}

export async function listNotifications(page?: string, limit?: string) {
  const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
  const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;

  const { data, total, unread } = await getNotificationsPaginated(currentPage, currentLimit);
  const totalPages = Math.ceil(total / currentLimit);

  return {
    data,
    unread,
    meta: { page: currentPage, limit: currentLimit, total, totalPages },
  };
}

export async function readNotification(id: string) {
  const notification = await markNotificationRead(id);
  if (!notification) throw Object.assign(new Error("Notification not found"), { status: 404 });
  return notification;
}

export async function readAllNotifications() {
  await markAllNotificationsRead();
}