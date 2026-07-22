import { getTokenCookie } from "@/lib/cookies";
import { ENDPOINTS } from "@/lib/api/endpoints";

const API_BASE = "http://localhost:5000";

export async function createBookApi(data: FormData) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.BOOKS.CREATE}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to list book");
  }
  return res.json();
}

export async function fetchMyBooksApi() {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.BOOKS.MINE}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch your books");
  }
  return res.json();
}

export async function updateBookApi(id: string, data: FormData) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.BOOKS.UPDATE(id)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update book");
  }
  return res.json();
}

export async function deleteMyBookApi(id: string) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.BOOKS.DELETE(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete book");
  }
  return res.json();
}

export async function fetchFeaturedBooksApi(
  params: { page?: number; limit?: number; category?: string } = {}
) {
  const token = await getTokenCookie();
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.category) query.set("category", params.category);

  const res = await fetch(`${API_BASE}${ENDPOINTS.BOOKS.FEATURED}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch books");
  }
  return res.json();
}

export async function searchBooksApi(q: string) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.BOOKS.SEARCH}?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Search failed");
  }
  return res.json();
}