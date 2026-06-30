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

export async function fetchUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const headers = await authHeaders();
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.USERS.LIST}?${query}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch users");
  }
  return res.json();
}

export async function fetchUserById(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.USERS.GET(id)}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch user");
  }
  return res.json();
}

export async function createUserApi(data: Record<string, string>) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.USERS.CREATE}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create user");
  }
  return res.json();
}

export async function updateUserApi(id: string, data: FormData) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.USERS.UPDATE(id)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update user");
  }
  return res.json();
}

export async function deleteUserApi(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.USERS.DELETE(id)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete user");
  }
  return res.json();
}