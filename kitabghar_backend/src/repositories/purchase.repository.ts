import Purchase from "../models/purchase.model";
import Book from "../models/book.model";

export async function createPurchase(
  buyerId: string,
  data: { bookId: string; title: string; author: string; price: string; image: string; condition: string }
) {
  return Purchase.create({ buyer: buyerId, ...data });
}

export async function findPurchasesByBuyer(buyerId: string) {
  return Purchase.find({ buyer: buyerId }).sort({ createdAt: -1 });
}

export async function findBookById(bookId: string) {
  return Book.findById(bookId);
}

export async function markBookSold(bookId: string) {
  return Book.findByIdAndUpdate(bookId, { status: "Sold" });
}