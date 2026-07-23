"use server";

import {
  buyBookApi,
  fetchPurchasesApi,
  initiateKhaltiPaymentApi,
  verifyKhaltiPaymentApi,
} from "@/lib/api/purchases";

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

export async function handleInitiateKhaltiPayment(data: {
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
}) {
  try {
    const result = await initiateKhaltiPaymentApi(data);
    if (result.success) {
      return { success: true, data: result.data as { pidx: string; payment_url: string } };
    }
    return { success: false, message: result.message || "Failed to start payment" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to start payment";
    return { success: false, message: msg };
  }
}

export async function handleVerifyKhaltiPayment(pidx: string) {
  try {
    const result = await verifyKhaltiPaymentApi(pidx);
    if (result.success) {
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message || "Failed to verify payment" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to verify payment";
    return { success: false, message: msg };
  }
}