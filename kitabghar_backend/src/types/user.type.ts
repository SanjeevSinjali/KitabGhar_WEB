import { z } from "zod";
export type { RegisterDTO, LoginDTO, AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/user.dto";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const AdminCreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const AdminUpdateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const RequestPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});

export const ConfirmPasswordChangeSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});