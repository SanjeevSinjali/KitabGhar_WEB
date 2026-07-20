import type { Response } from "express";
import type { Request } from "express-serve-static-core";
import { CreateBookSchema } from "../types/book.type";
import { createBookService, listMyBooks } from "../services/book.service";
import { notifyBookListed } from "../services/notification.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function createBook(req: Request & { file?: any }, res: Response) {
  try {
    if (!req.file) {
      return sendError(res, "Book image is required", 400);
    }

    const parsed = CreateBookSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Validation failed";
      return sendError(res, msg, 400);
    }

    const image = `/books/${req.file.filename}`;
    const book = await createBookService((req as any).user.id, parsed.data, image);

    await notifyBookListed(
      (req as any).user.id,
      (req as any).user.name,
      book.title,
      book.price
    );

    return sendSuccess(res, book, "Book listed successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function getMyBooks(req: Request, res: Response) {
  try {
    const books = await listMyBooks((req as any).user.id);
    return sendSuccess(res, books, "Books retrieved successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}