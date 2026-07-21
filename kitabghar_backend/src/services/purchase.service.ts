import {
  createPurchase,
  findPurchasesByBuyer,
  findBookById,
  markBookSoldIfActive,
} from "../repositories/purchase.repository";
import { removeWishlistEntry } from "../repositories/wishlist.repository";
import { notifyBookSold } from "./notification.service";

export async function buyBook(
  buyerId: string,
  buyerName: string,
  data: { bookId: string; title: string; author: string; price: string; image: string; condition: string }
) {
  const existingBook = await findBookById(data.bookId).catch(() => null);

  if (existingBook && String(existingBook.seller) === buyerId) {
    throw Object.assign(new Error("You can't buy your own listing."), { status: 400 });
  }

  let sellerId: string | null = null;

  if (existingBook) {
    // Atomic check-and-set: only one concurrent request can win this.
    const updatedBook = await markBookSoldIfActive(data.bookId);
    if (!updatedBook) {
      throw Object.assign(new Error("This book has already been sold."), { status: 400 });
    }
    sellerId = String(updatedBook.seller);
  }

  await removeWishlistEntry(buyerId, data.bookId).catch(() => null);

  const purchase = await createPurchase(buyerId, data);

  if (sellerId && sellerId !== buyerId) {
    await notifyBookSold(sellerId, buyerName, data.title, data.price);
  }

  return purchase;
}

export async function listPurchases(buyerId: string) {
  return findPurchasesByBuyer(buyerId);
}