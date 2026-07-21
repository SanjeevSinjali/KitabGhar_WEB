"use server";

import { createBookApi, fetchMyBooksApi, fetchFeaturedBooksApi } from "@/lib/api/books";

export async function handleCreateBook(formData: FormData) {
  try {
    const result = await createBookApi(formData);
    if (result.success) {
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "Failed to list book" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to list book";
    return { success: false, message: msg };
  }
}

export async function handleGetMyBooks() {
  try {
    const result = await fetchMyBooksApi();
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message || "Failed to fetch your books" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch your books";
    return { success: false, message: msg };
  }
}

export async function handleGetFeaturedBooks(
  { page, limit }: { page?: number; limit?: number } = {}
) {
  try {
    const result = await fetchFeaturedBooksApi({ page, limit });
    if (result.success) {
      return { success: true, data: result.data, pagination: result.meta };
    }
    return { success: false, message: result.message || "Failed to fetch books" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch books";
    return { success: false, message: msg };
  }
}