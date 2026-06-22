import type { Response } from "express";
import type { Request } from "express-serve-static-core";
import { registerService, loginService } from "../services/user.service";
import { RegisterSchema, LoginSchema } from "../types/user.type";
import User from "../models/user.model";
import bcrypt from "bcryptjs";

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

// @desc   Update profile (name, email, password, avatar)
// @route  PUT /api/v1/auth/update
// @access Private
export async function updateProfile(
  req: Request & { file?: any },
  res: Response
) {
  try {
    const fieldsToUpdate: Record<string, string> = {};

    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.email) fieldsToUpdate.email = req.body.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.file) {
      fieldsToUpdate.avatar = `/avatars/${req.file.filename}`;
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

    res.status(200).json({ success: true, data: user });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    res.status(500).json({ message });
  }
}