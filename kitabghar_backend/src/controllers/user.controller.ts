import type { Request, Response } from "express";
import { registerService, loginService } from "../services/user.service";
import { RegisterSchema, LoginSchema } from "../types/user.type";

export async function register(req: Request, res: Response) {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstMessage = parsed.error.issues.length > 0
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
    const message = error instanceof Error ? error.message : "Something went wrong";
    res.status(400).json({ message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstMessage = parsed.error.issues.length > 0
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
    const message = error instanceof Error ? error.message : "Something went wrong";
    res.status(400).json({ message });
  }
}