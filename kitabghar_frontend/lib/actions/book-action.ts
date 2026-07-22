"use server";

import { revalidatePath } from "next/cache";
import {
  createBookApi,
  fetchMyBooksApi,
  updateBookApi,
  deleteMyBookApi,
  fetchFeaturedBooksApi,
  searchBooksApi,
} from "@/lib/api/books";

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

export async function handleUpdateBook(id: string, formData: FormData) {
  try {
    const result = await updateBookApi(id, formData);
    if (result.success) {
      revalidatePath("/dashboard");
      revalidatePath("/browse");
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "Failed to update book" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update book";
    return { success: false, message: msg };
  }
}

export async function handleDeleteMyBook(id: string) {
  try {
    const result = await deleteMyBookApi(id);
    if (result.success) {
      revalidatePath("/dashboard");
      revalidatePath("/browse");
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message || "Failed to delete book" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete book";
    return { success: false, message: msg };
  }
}

export async function handleGetFeaturedBooks(
  { page, limit, category }: { page?: number; limit?: number; category?: string } = {}
) {
  try {
    const result = await fetchFeaturedBooksApi({ page, limit, category });
    if (result.success) {
      return { success: true, data: result.data, pagination: result.meta };
    }
    return { success: false, message: result.message || "Failed to fetch books" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch books";
    return { success: false, message: msg };
  }
}

export async function handleSearchBooks(q: string) {
  try {
    const result = await searchBooksApi(q);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message || "Search failed" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Search failed";
    return { success: false, message: msg };
  }
}