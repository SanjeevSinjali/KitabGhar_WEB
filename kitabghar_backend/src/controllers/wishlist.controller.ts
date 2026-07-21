import type { Response } from "express";
import type { Request } from "express-serve-static-core";
import { toggleWishlist, removeFromWishlist, listWishlist } from "../services/wishlist.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

export async function toggleBookWishlist(req: Request, res: Response) {
  try {
    const { bookId, title, author, price, image, condition } = req.body;
    if (!bookId || !title) {
      return sendError(res, "bookId and title are required", 400);
    }

    const result = await toggleWishlist((req as any).user.id, (req as any).user.name, {
      bookId,
      title,
      author,
      price,
      image,
      condition,
    });

    return sendSuccess(
      res,
      result,
      result.wishlisted ? "Added to wishlist" : "Removed from wishlist"
    );
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function deleteWishlistItem(req: Request<{ bookId: string }>, res: Response) {
  try {
    await removeFromWishlist((req as any).user.id, req.params.bookId);
    return sendSuccess(res, null, "Removed from wishlist");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}

export async function getWishlist(req: Request, res: Response) {
  try {
    const items = await listWishlist((req as any).user.id);
    return sendSuccess(res, items, "Wishlist retrieved successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Internal server error", error.status || 500);
  }
}
