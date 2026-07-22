import type { Request, Response } from "express";
import { adminListBooks, adminGetBookById, adminDeleteBook, adminUpdateBookStatus } from "../../services/book.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export async function listBooks(req: Request, res: Response) {
  try {
    const { page, limit, search } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const { data, meta } = await adminListBooks(page, limit, search);
    return sendSuccess(res, data, "Books retrieved successfully", 200, meta);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function getBook(req: Request<{ id: string }>, res: Response) {
  try {
    const book = await adminGetBookById(req.params.id);
    return sendSuccess(res, book, "Book retrieved successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function deleteBook(req: Request<{ id: string }>, res: Response) {
  try {
    await adminDeleteBook(req.params.id);
    return sendSuccess(res, null, "Book deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function updateStatus(req: Request<{ id: string }>, res: Response) {
  try {
    const { status } = req.body as { status?: string };
    if (status !== "Active" && status !== "Sold") {
      return sendError(res, "status must be 'Active' or 'Sold'", 400);
    }
    const book = await adminUpdateBookStatus(req.params.id, status);
    return sendSuccess(res, book, `Book marked as ${status}`);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}