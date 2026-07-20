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

export async function fetchBooks(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const headers = await authHeaders();
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.BOOKS.LIST}?${query}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch books");
  }
  return res.json();
}

export async function fetchBookById(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.BOOKS.GET(id)}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch book");
  }
  return res.json();
}

export async function deleteBookApi(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${ENDPOINTS.ADMIN.BOOKS.DELETE(id)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete book");
  }
  return res.json();
}