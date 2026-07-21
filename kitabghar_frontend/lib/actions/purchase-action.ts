"use server";

import { buyBookApi, fetchPurchasesApi } from "@/lib/api/purchases";

export async function handleBuyBook(data: {
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
}) {
  try {
    const result = await buyBookApi(data);
    if (result.success) {
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message || "Failed to complete purchase" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to complete purchase";
    return { success: false, message: msg };
  }
}

export async function handleGetPurchases() {
  try {
    const result = await fetchPurchasesApi();
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message || "Failed to fetch purchases" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch purchases";
    return { success: false, message: msg };
  }
}