import type { Response } from "express";
import type { Request } from "express-serve-static-core";
import { registerService, loginService } from "../services/user.service";
import {
  RegisterSchema,
  LoginSchema,
  RequestPasswordChangeSchema,
  ConfirmPasswordChangeSchema,
} from "../types/user.type";
import { notifyProfileUpdate } from "../services/notification.service";
import { sendPasswordChangeCode } from "../utils/mailer";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function register(req: Request, res: Response) {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstMessage =
        parsed.error.issues.length > 0
          ? parsed.error.issues[0]!.message
          : "Validation failed";
      res.status(400).json({
        message: firstMessage,
        errors: parsed.error.issues,
      });
      return;
    }
    const result = await registerService(parsed.data);
    res.status(201).json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(400).json({ message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstMessage =
        parsed.error.issues.length > 0
          ? parsed.error.issues[0]!.message
          : "Validation failed";
      res.status(400).json({
        message: firstMessage,
        errors: parsed.error.issues,
      });
      return;
    }
    const result = await loginService(parsed.data);
    res.status(200).json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(400).json({ message });
  }
}

// @desc   Get logged in user
// @route  GET /api/v1/auth/whoami
// @access Private
export async function whoami(req: Request, res: Response) {
  try {
    const user = await User.findById((req as any).user.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ message });
  }
}

// @desc   Update profile (name, email, avatar)
// @route  PUT /api/v1/auth/update
// @access Private
export async function updateProfile(
  req: Request & { file?: any },
  res: Response
) {
  try {
    const currentUser = await User.findById((req as any).user.id);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const fieldsToUpdate: Record<string, string> = {};
    const changedFields: string[] = [];

    if (req.body.name && req.body.name !== currentUser.name) {
      fieldsToUpdate.name = req.body.name;
      changedFields.push("name");
    }
    if (req.body.email && req.body.email !== currentUser.email) {
      fieldsToUpdate.email = req.body.email;
      changedFields.push("email");
    }
    if (req.file) {
      fieldsToUpdate.avatar = `/avatars/${req.file.filename}`;
      changedFields.push("avatar");
    }

    const user = await User.findByIdAndUpdate(
      (req as any).user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (changedFields.length > 0 && user.role !== "admin") {
      await notifyProfileUpdate(String(user._id), user.name, changedFields);
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ message });
  }
}

// @desc   Step 1: verify current password, email a 6-digit code
// @route  POST /api/v1/auth/change-password/request-code
// @access Private
export async function requestPasswordChange(req: Request, res: Response) {
  try {
    const parsed = RequestPasswordChangeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0]?.message || "Validation failed" });
      return;
    }

    const user = await User.findById((req as any).user.id).select("+passwordChangeCode +passwordChangeCodeExpires");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    user.passwordChangeCode = await bcrypt.hash(code, salt);
    user.passwordChangeCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordChangeCode(user.email, code);

    res.status(200).json({ success: true, message: `Verification code sent to ${user.email}` });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ message });
  }
}

// @desc   Step 2: verify the code, set new password
// @route  PATCH /api/v1/auth/change-password/confirm
// @access Private
export async function confirmPasswordChange(req: Request, res: Response) {
  try {
    const parsed = ConfirmPasswordChangeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0]?.message || "Validation failed" });
      return;
    }

    const user = await User.findById((req as any).user.id).select("+passwordChangeCode +passwordChangeCodeExpires");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.passwordChangeCode || !user.passwordChangeCodeExpires) {
      res.status(400).json({ message: "No pending code. Please request a new one." });
      return;
    }

    if (user.passwordChangeCodeExpires.getTime() < Date.now()) {
      res.status(400).json({ message: "This code has expired. Please request a new one." });
      return;
    }

    const codeMatches = await bcrypt.compare(parsed.data.code, user.passwordChangeCode);
    if (!codeMatches) {
      res.status(400).json({ message: "Invalid verification code" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(parsed.data.newPassword, salt);
    user.passwordChangeCode = undefined;
    user.passwordChangeCodeExpires = undefined;
    await user.save();

    if (user.role !== "admin") {
      await notifyProfileUpdate(String(user._id), user.name, ["password"]);
    }

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ message });
  }
}