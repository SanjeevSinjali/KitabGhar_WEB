import {
  findWishlistEntry,
  addWishlistEntry,
  removeWishlistEntry,
  countWishlistByUser,
  findWishlistByUser,
} from "../repositories/wishlist.repository";
import { notifyWishlistAdd } from "./notification.service";

export const WISHLIST_LIMIT = 5;

export async function toggleWishlist(
  userId: string,
  userName: string,
  data: { bookId: string; title: string; author: string; price: string; image: string; condition: string }
) {
  const existing = await findWishlistEntry(userId, data.bookId);

  if (existing) {
    await removeWishlistEntry(userId, data.bookId);
    return { wishlisted: false };
  }

  const currentCount = await countWishlistByUser(userId);
  if (currentCount >= WISHLIST_LIMIT) {
    throw Object.assign(
      new Error(`You can't have more than ${WISHLIST_LIMIT} books in your wishlist.`),
      { status: 400 }
    );
  }

  await addWishlistEntry(userId, data);
  await notifyWishlistAdd(userId, userName, data.title);
  return { wishlisted: true };
}

export async function removeFromWishlist(userId: string, bookId: string) {
  const removed = await removeWishlistEntry(userId, bookId);
  if (!removed) throw Object.assign(new Error("Wishlist item not found"), { status: 404 });
  return removed;
}

export async function listWishlist(userId: string) {
  return findWishlistByUser(userId);
}