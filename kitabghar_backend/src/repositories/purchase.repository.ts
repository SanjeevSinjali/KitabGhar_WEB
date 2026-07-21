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

// Atomic: only succeeds if the book is still "Active" at the moment of update.
// Prevents two buyers from both succeeding on the same book.
export async function markBookSoldIfActive(bookId: string) {
  return Book.findOneAndUpdate(
    { _id: bookId, status: "Active" },
    { status: "Sold" },
    { new: true }
  );
}