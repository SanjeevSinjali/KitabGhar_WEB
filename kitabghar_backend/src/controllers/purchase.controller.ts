import type { Response } from "express";
import type { Request } from "express-serve-static-core";
import { buyBook, listPurchases } from "../services/purchase.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function purchaseBook(req: Request, res: Response) {
  try {
    const { bookId, title, author, price, image, condition } = req.body;
    if (!bookId || !title) {
      return sendError(res, "bookId and title are required", 400);
    }

    const purchase = await buyBook((req as any).user.id, {
      bookId,
      title,
      author,
      price,
      image,
      condition,
    });

    return sendSuccess(res, purchase, "Purchase successful", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function getPurchases(req: Request, res: Response) {
  try {
    const purchases = await listPurchases((req as any).user.id);
    return sendSuccess(res, purchases, "Purchases retrieved successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}