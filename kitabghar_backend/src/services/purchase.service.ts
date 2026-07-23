import {
  createPurchase,
  findPurchasesByBuyer,
  findBookById,
  markBookSoldIfActive,
} from "../repositories/purchase.repository";
import { removeWishlistEntry } from "../repositories/wishlist.repository";
import { notifyBookSold, notifyPaymentCompleted } from "./notification.service";
import { khaltiInitiate, khaltiLookup } from "./khalti.service";
import { createPendingPayment, findPaymentByPidx, updatePaymentStatus } from "../repositories/payment.repository";

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

// Extracts a plain rupee number out of strings like "Rs. 250" or "250"
function parseRupees(price: string): number {
  const match = price.match(/\d+(\.\d+)?/);
  if (!match) {
    throw Object.assign(new Error("Invalid price."), { status: 400 });
  }
  const value = parseFloat(match[0]);
  if (isNaN(value)) {
    throw Object.assign(new Error("Invalid price."), { status: 400 });
  }
  return value;
}

export async function initiateKhaltiPurchase(
  buyerId: string,
  buyerEmail: string,
  buyerPhone: string | undefined,
  data: { bookId: string; title: string; author: string; price: string; image: string; condition: string }
) {
  const existingBook = await findBookById(data.bookId);
  if (!existingBook || existingBook.status !== "Active") {
    throw Object.assign(new Error("This book is no longer available."), { status: 400 });
  }
  if (String(existingBook.seller) === buyerId) {
    throw Object.assign(new Error("You can't buy your own listing."), { status: 400 });
  }

  const rupees = parseRupees(data.price);
  const amountInPaisa = Math.round(rupees * 100);
  const purchaseOrderId = `book_${data.bookId}_${Date.now()}`;

  const { pidx, payment_url } = await khaltiInitiate({
    return_url: `${process.env.FRONTEND_URL}/purchases/callback`,
    website_url: process.env.FRONTEND_URL as string,
    amount: amountInPaisa,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: data.title,
    customer_info: { name: buyerEmail, email: buyerEmail, phone: buyerPhone },
  });

  await createPendingPayment({
    pidx,
    buyer: buyerId,
    bookId: data.bookId,
    title: data.title,
    author: data.author,
    price: data.price,
    image: data.image,
    condition: data.condition,
    amount: amountInPaisa,
    purchaseOrderId,
  });

  return { pidx, payment_url };
}

export async function confirmKhaltiPurchase(pidx: string, buyerId: string, buyerName: string) {
  const payment = await findPaymentByPidx(pidx);
  if (!payment) throw Object.assign(new Error("Payment not found."), { status: 404 });
  if (String(payment.buyer) !== buyerId) throw Object.assign(new Error("Not authorized."), { status: 403 });

  if (payment.status === "Completed") {
    const existing = await findPurchasesByBuyer(buyerId);
    const already = existing.find((p: any) => p.bookId === payment.bookId);
    if (already) return already;
  }

  const result = await khaltiLookup(pidx);

  if (result.status !== "Completed") {
    await updatePaymentStatus(pidx, result.status, result.transaction_id);
    throw Object.assign(new Error(`Payment ${result.status.toLowerCase()}.`), { status: 400 });
  }

  await updatePaymentStatus(pidx, "Completed", result.transaction_id);

  await notifyPaymentCompleted(buyerId, buyerName, payment.title, payment.price, result.transaction_id);

  return buyBook(buyerId, buyerName, {
    bookId: payment.bookId,
    title: payment.title,
    author: payment.author,
    price: payment.price,
    image: payment.image,
    condition: payment.condition,
  });
}