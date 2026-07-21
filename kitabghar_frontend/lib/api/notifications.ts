import { getTokenCookie } from "@/lib/cookies";
import { ENDPOINTS } from "@/lib/api/endpoints";

const API_BASE = "http://localhost:5000";

async function authHeaders() {
  const token = await getTokenCookie();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchMyNotifications(params: { page?: number; limit?: number } = {}) {
  const headers = await authHeaders();
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE}${ENDPOINTS.NOTIFICATIONS.LIST}?${query}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch notifications");
  }
  return res.json();
}

export async function markMyNotificationReadApi(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${ENDPOINTS.NOTIFICATIONS.MARK_READ(id)}`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to mark notification as read");
  }
  return res.json();
}

export async function markAllMyNotificationsReadApi() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to mark notifications as read");
  }
  return res.json();
}