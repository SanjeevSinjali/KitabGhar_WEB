"use server";

import { revalidatePath } from "next/cache";
import { fetchBooks, fetchBookById, deleteBookApi, updateBookStatusApi } from "@/lib/api/admin/book";

export async function handleGetAllBooks({
  page,
  limit,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const result = await fetchBooks({
      page: page && page > 0 ? page : 1,
      limit: limit && limit > 0 ? limit : 10,
      search: search || "",
    });
    if (result.success) {
      return { success: true, data: result.data, pagination: result.meta };
    }
    return { success: false, message: result.message || "Failed to fetch books" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch books";
    return { success: false, message: msg };
  }
}

export async function handleGetBookById(id: string) {
  try {
    const result = await fetchBookById(id);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message || "Failed to fetch book" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch book";
    return { success: false, message: msg };
  }
}

export async function handleDeleteBook(id: string) {
  try {
    const result = await deleteBookApi(id);
    if (result.success) {
      revalidatePath("/admin/books");
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

export async function handleUpdateBookStatus(id: string, status: "Active" | "Sold") {
  try {
    const result = await updateBookStatusApi(id, status);
    if (result.success) {
      revalidatePath("/admin/books");
      revalidatePath("/dashboard");
      revalidatePath("/browse");
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message || "Failed to update status" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update status";
    return { success: false, message: msg };
  }
}