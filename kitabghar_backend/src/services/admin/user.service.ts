import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  findUserById,
  createUserAdmin,
  updateUserById,
  deleteUserById,
  getAllUsersPaginated,
} from "../../repositories/user.repository";
import type { AdminCreateUserDTO, AdminUpdateUserDTO } from "../../dtos/user.dto";
import type { PaginationMeta } from "../../utils/apiResponse";
import type { IUser } from "../../models/user.model";

export async function adminCreateUser(data: AdminCreateUserDTO): Promise<IUser> {
  const existing = await findUserByEmail(data.email);
  if (existing) throw Object.assign(new Error("Email already in use"), { status: 400 });

  const hashed = await bcrypt.hash(data.password, 10);
  return createUserAdmin({
    name: data.name,
    email: data.email,
    password: hashed,
    role: data.role || "user",
  });
}

export async function adminGetUserById(id: string): Promise<IUser> {
  const user = await findUserById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
}

export async function adminUpdateUser(
  id: string,
  data: AdminUpdateUserDTO
): Promise<IUser> {
  const existing = await findUserById(id);
  if (!existing) throw Object.assign(new Error("User not found"), { status: 404 });

  if (data.email && data.email !== existing.email) {
    const emailTaken = await findUserByEmail(data.email);
    if (emailTaken) throw Object.assign(new Error("Email already in use"), { status: 400 });
  }

  const user = await updateUserById(id, data);
  if (!user) throw Object.assign(new Error("Failed to update user"), { status: 500 });
  return user;
}

export async function adminDeleteUser(id: string): Promise<void> {
  const user = await deleteUserById(id);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
}

export async function adminListUsers(
  page?: string,
  limit?: string,
  search?: string
): Promise<{ data: IUser[]; meta: PaginationMeta }> {
  const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
  const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;
  const currentSearch = search && search.trim() !== "" ? search : undefined;

  const { data, total } = await getAllUsersPaginated(
    currentPage,
    currentLimit,
    currentSearch
  );

  const totalPages = Math.ceil(total / currentLimit);

  return {
    data,
    meta: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages,
    },
  };
}