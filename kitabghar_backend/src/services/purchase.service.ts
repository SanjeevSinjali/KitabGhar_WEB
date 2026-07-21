import {
  createPurchase,
  findPurchasesByBuyer,
  findBookById,
  markBookSold,
} from "../repositories/purchase.repository";
import { removeWishlistEntry } from "../repositories/wishlist.repository";

export async function buyBook(
  buyerId: string,
  data: { bookId: string; title: string; author: string; price: string; image: string; condition: string }
) {
  const book = await findBookById(data.bookId).catch(() => null);

  if (book) {
    if (book.status === "Sold") {
      throw Object.assign(new Error("This book has already been sold."), { status: 400 });
    }
    if (String(book.seller) === buyerId) {
      throw Object.assign(new Error("You can't buy your own listing."), { status: 400 });
    }
    await markBookSold(data.bookId);
  }

  await removeWishlistEntry(buyerId, data.bookId).catch(() => null);

  return createPurchase(buyerId, data);
}

export async function listPurchases(buyerId: string) {
  return findPurchasesByBuyer(buyerId);
}