"use server";

import { toggleWishlistApi, removeWishlistApi, fetchWishlistApi } from "@/lib/api/wishlist";

export async function handleToggleWishlist(data: {
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
}) {
  try {
    const result = await toggleWishlistApi(data);
    if (result.success) {
      return { success: true, wishlisted: result.data.wishlisted, message: result.message };
    }
    return { success: false, message: result.message || "Failed to update wishlist" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update wishlist";
    return { success: false, message: msg };
  }
}

export async function handleRemoveWishlist(bookId: string) {
  try {
    const result = await removeWishlistApi(bookId);
    if (result.success) {
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message || "Failed to remove from wishlist" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to remove from wishlist";
    return { success: false, message: msg };
  }
}

export async function handleGetWishlist() {
  try {
    const result = await fetchWishlistApi();
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message || "Failed to fetch wishlist" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch wishlist";
    return { success: false, message: msg };
  }
}