import type { Request, Response } from "express";
import { AdminCreateUserSchema, AdminUpdateUserSchema } from "../../types/user.type";
import {
  adminCreateUser,
  adminGetUserById,
  adminUpdateUser,
  adminDeleteUser,
  adminListUsers,
} from "../../services/admin/user.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export async function listUsers(req: Request, res: Response) {
  try {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const { data, meta } = await adminListUsers(page, limit, search);
    return sendSuccess(res, data, "Users retrieved successfully", 200, meta);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function getUser(req: Request<{ id: string }>, res: Response) {
  try {
    const user = await adminGetUserById(req.params.id);
    return sendSuccess(res, user, "User retrieved successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const parsed = AdminCreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Validation failed";
      return sendError(res, msg, 400);
    }
    const user = await adminCreateUser(parsed.data);
    return sendSuccess(res, user, "User created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function updateUser(req: Request<{ id: string }>, res: Response) {
  try {
    const parsed = AdminUpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Validation failed";
      return sendError(res, msg, 400);
    }

    const updateData: Record<string, any> = { ...parsed.data };

    if ((req as any).file) {
      updateData.avatar = `/avatars/${(req as any).file.filename}`;
    }

    const user = await adminUpdateUser(req.params.id, updateData);
    return sendSuccess(res, user, "User updated successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function deleteUser(req: Request<{ id: string }>, res: Response) {
  try {
    await adminDeleteUser(req.params.id);
    return sendSuccess(res, null, "User deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}