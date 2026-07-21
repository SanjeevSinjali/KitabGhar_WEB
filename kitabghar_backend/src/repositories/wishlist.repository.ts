import Wishlist from "../models/wishlist.model";

export async function findWishlistEntry(userId: string, bookId: string) {
  return Wishlist.findOne({ user: userId, bookId });
}

export async function addWishlistEntry(
  userId: string,
  data: { bookId: string; title: string; author: string; price: string; image: string; condition: string }
) {
  return Wishlist.create({ user: userId, ...data });
}

export async function removeWishlistEntry(userId: string, bookId: string) {
  return Wishlist.findOneAndDelete({ user: userId, bookId });
}

export async function countWishlistByUser(userId: string): Promise<number> {
  return Wishlist.countDocuments({ user: userId });
}

export async function findWishlistByUser(userId: string) {
  return Wishlist.find({ user: userId }).sort({ createdAt: -1 });
}