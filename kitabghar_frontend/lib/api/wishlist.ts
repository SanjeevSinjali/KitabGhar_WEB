import { getTokenCookie } from "@/lib/cookies";
import { ENDPOINTS } from "@/lib/api/endpoints";

const API_BASE = "http://localhost:5000";

export async function toggleWishlistApi(data: {
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
}) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.WISHLIST.TOGGLE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update wishlist");
  }
  return res.json();
}

export async function removeWishlistApi(bookId: string) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.WISHLIST.DELETE(bookId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to remove from wishlist");
  }
  return res.json();
}

export async function fetchWishlistApi() {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.WISHLIST.LIST}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch wishlist");
  }
  return res.json();
}