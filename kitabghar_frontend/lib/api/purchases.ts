import { getTokenCookie } from "@/lib/cookies";
import { ENDPOINTS } from "@/lib/api/endpoints";

const API_BASE = "http://localhost:5000";

export async function buyBookApi(data: {
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
}) {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.PURCHASES.CREATE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to complete purchase");
  }
  return res.json();
}

export async function fetchPurchasesApi() {
  const token = await getTokenCookie();
  const res = await fetch(`${API_BASE}${ENDPOINTS.PURCHASES.LIST}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch purchases");
  }
  return res.json();
}