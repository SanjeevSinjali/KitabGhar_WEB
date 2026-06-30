"use server";

import { revalidatePath } from "next/cache";
import {
  fetchUsers,
  fetchUserById,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "@/lib/api/admin/user";

export async function handleGetAllUsers({
  page,
  limit,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const result = await fetchUsers({
      page: page && page > 0 ? page : 1,
      limit: limit && limit > 0 ? limit : 10,
      search: search || "",
    });
    if (result.success) {
      return {
        success: true,
        data: result.data,
        pagination: result.meta,
      };
    }
    return { success: false, message: result.message || "Failed to fetch users" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch users";
    return { success: false, message: msg };
  }
}

export async function handleGetUserById(id: string) {
  try {
    const result = await fetchUserById(id);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, message: result.message || "Failed to fetch user" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch user";
    return { success: false, message: msg };
  }
}

export async function handleCreateUser(data: Record<string, string>) {
  try {
    const result = await createUserApi(data);
    if (result.success) {
      revalidatePath("/admin/users");
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "User creation failed" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "User creation failed";
    return { success: false, message: msg };
  }
}

export async function handleUpdateUser(id: string, data: FormData) {
  try {
    const result = await updateUserApi(id, data);
    if (result.success) {
      revalidatePath("/admin/users");
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "Failed to update user" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update user";
    return { success: false, message: msg };
  }
}

export async function handleDeleteUser(id: string) {
  try {
    const result = await deleteUserApi(id);
    if (result.success) {
      revalidatePath("/admin/users");
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message || "Failed to delete user" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete user";
    return { success: false, message: msg };
  }
}