import Notification, { INotification } from "../models/notification.model";

export async function createNotification(data: {
  type: string;
  message: string;
  user: string;
  recipient?: string;
  changedFields: string[];
}): Promise<INotification> {
  const notification = new Notification(data);
  return notification.save();
}

export async function getNotificationsPaginated(
  page: number,
  limit: number
): Promise<{ data: INotification[]; total: number; unread: number }> {
  const total = await Notification.countDocuments();
  const unread = await Notification.countDocuments({ read: false });
  const data = await Notification.find()
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { data, total, unread };
}

export async function markNotificationRead(id: string): Promise<INotification | null> {
  return Notification.findByIdAndUpdate(id, { read: true }, { new: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  await Notification.updateMany({ read: false }, { read: true });
}

// User-facing (recipient-scoped) variants
export async function getUserNotificationsPaginated(
  userId: string,
  page: number,
  limit: number
): Promise<{ data: INotification[]; total: number; unread: number }> {
  const query = { recipient: userId };
  const total = await Notification.countDocuments(query);
  const unread = await Notification.countDocuments({ ...query, read: false });
  const data = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { data, total, unread };
}

export async function markUserNotificationRead(
  userId: string,
  id: string
): Promise<INotification | null> {
  return Notification.findOneAndUpdate({ _id: id, recipient: userId }, { read: true }, { new: true });
}

export async function markAllUserNotificationsRead(userId: string): Promise<void> {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
}