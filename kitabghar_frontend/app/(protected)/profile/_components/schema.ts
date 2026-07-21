import { z } from "zod";

export const profileInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
});

export type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;

export const requestCodeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RequestCodeFormData = z.infer<typeof requestCodeSchema>;

export const confirmCodeSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
});

export type ConfirmCodeFormData = z.infer<typeof confirmCodeSchema>;