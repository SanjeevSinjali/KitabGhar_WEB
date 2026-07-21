/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { whoamiAction } from "@/lib/actions/auth-action";
import { handleGetMyBooks } from "@/lib/actions/book-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import { handleGetPurchases } from "@/lib/actions/purchase-action";
import { Heart, Package, ShoppingBag } from "lucide-react";

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function ActivityPage() {
  const user = await whoamiAction();
  if (!user) {
    redirect("/login");
  }

  const [booksResult, wishlistResult, purchasesResult] = await Promise.all([
    handleGetMyBooks(),
    handleGetWishlist(),
    handleGetPurchases(),
  ]);

  const myListedBooks = booksResult.success ? booksResult.data : [];
  const wishlistBooks = wishlistResult.success ? wishlistResult.data : [];
  const purchases = purchasesResult.success ? purchasesResult.data : [];

  const listingActivity = myListedBooks.map((book: any) => ({
    id: `listing-${book._id}`,
    type: "listed" as const,
    text: `You listed "${book.title}" for Rs. ${book.price}`,
    time: book.createdAt,
  }));

  const wishlistActivity = wishlistBooks.map((item: any) => ({
    id: `wishlist-${item._id}`,
    type: "wishlisted" as const,
    text: `You added "${item.title}" to your wishlist`,
    time: item.createdAt,
  }));

  const purchaseActivity = purchases.map((item: any) => ({
    id: `purchase-${item._id}`,
    type: "purchased" as const,
    text: `You bought "${item.title}" for ${item.price}`,
    time: item.createdAt,
  }));

  const allActivity = [...listingActivity, ...wishlistActivity, ...purchaseActivity]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .map((item) => ({ ...item, timeLabel: formatRelativeTime(item.time) }));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Recent Activity</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everything you&apos;ve done on KitabGhar — listings, wishlist, and purchases.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {allActivity.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-400">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-5">
              {allActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      item.type === "wishlisted"
                        ? "bg-pink-100 text-pink-600"
                        : item.type === "purchased"
                        ? "bg-green-100 text-green-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {item.type === "wishlisted" ? (
                      <Heart size={16} />
                    ) : item.type === "purchased" ? (
                      <ShoppingBag size={16} />
                    ) : (
                      <Package size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">{item.text}</p>
                    <p className="text-xs text-slate-400">{item.timeLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}