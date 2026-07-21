"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart, X, AlertCircle, CheckCircle2, BookOpen } from "lucide-react";
import { handleToggleWishlist } from "@/lib/actions/wishlist-action";
import { handleBuyBook } from "@/lib/actions/purchase-action";

export type FeaturedBook = {
  _id: string;
  title: string;
  author: string;
  price: number;
  condition: string;
  image: string;
  status?: "Active" | "Sold";
};

const conditionColors: Record<string, string> = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Fair": "bg-yellow-100 text-yellow-700",
};

export default function BrowseBookCard({
  book,
  isWishlisted,
}: {
  book: FeaturedBook;
  isWishlisted: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isBuying, startBuyTransition] = useTransition();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [limitMessage, setLimitMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isSold = book.status === "Sold";

  function toggleHeart() {
    if (isSold) return;
    setWishlisted((prev) => !prev);
    startTransition(async () => {
      const result = await handleToggleWishlist({
        bookId: book._id,
        title: book.title,
        author: book.author,
        price: `Rs. ${book.price}`,
        image: book.image,
        condition: book.condition,
      });
      if (!result.success) {
        setWishlisted((prev) => !prev);
        setLimitMessage(result.message || "Couldn't update wishlist");
        return;
      }
      router.refresh();
    });
  }

  function confirmPurchase() {
    startBuyTransition(async () => {
      const result = await handleBuyBook({
        bookId: book._id,
        title: book.title,
        author: book.author,
        price: `Rs. ${book.price}`,
        image: book.image,
        condition: book.condition,
      });
      setConfirmOpen(false);
      if (!result.success) {
        setFeedback({ type: "error", message: result.message || "Failed to complete purchase" });
        return;
      }
      setFeedback({ type: "success", message: `You bought "${book.title}"! Check My Purchases.` });
      router.refresh();
    });
  }

  return (
    <>
      <div className="group w-40 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md snap-start sm:w-48">
        <div className="relative flex aspect-[3/4] w-full items-center justify-center bg-slate-100">
          {book.image ? (
            <Image
              src={book.image}
              alt={book.title}
              fill
              sizes="192px"
              className={`object-cover ${isSold ? "opacity-50" : ""}`}
            />
          ) : (
            <BookOpen size={24} className="text-slate-300" />
          )}

          {isSold && (
            <span className="absolute top-2 left-2 rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              Sold
            </span>
          )}

          {!isSold && (
            <button
              onClick={toggleHeart}
              className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 transition hover:bg-white ${
                wishlisted ? "text-pink-500" : "text-slate-400 opacity-0 group-hover:opacity-100"
              }`}
            >
              <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          )}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium text-slate-900">{book.title}</p>
          <p className="truncate text-xs text-slate-500">{book.author}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1E3A5F]">Rs. {book.price}</span>
            <span className={`text-xs rounded-full px-2 py-0.5 ${conditionColors[book.condition] ?? ""}`}>
              {book.condition}
            </span>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isSold}
            className="mt-2 w-full rounded-lg bg-[#1E3A5F] py-1.5 text-xs font-medium text-white transition hover:bg-[#162d4a] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSold ? "Sold Out" : "Buy Now"}
          </button>
        </div>
      </div>

      {limitMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setLimitMessage("")}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setLimitMessage("")}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={22} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Wishlist limit reached</h3>
            <p className="mt-2 text-sm text-slate-500">{limitMessage}</p>
            <button
              onClick={() => setLimitMessage("")}
              className="mt-5 w-full rounded-xl bg-[#1E3A5F] py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-base font-semibold text-slate-900">Confirm purchase</h3>
            <p className="mt-2 text-sm text-slate-500">
              Buy <span className="font-medium text-slate-700">&quot;{book.title}&quot;</span> for{" "}
              <span className="font-semibold text-[#1E3A5F]">Rs. {book.price}</span>?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                disabled={isBuying}
                className="flex-1 rounded-xl bg-[#1E3A5F] py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-50"
              >
                {isBuying ? "Buying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setFeedback(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                feedback.type === "success" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {feedback.type === "success" ? "Purchase complete" : "Purchase failed"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">{feedback.message}</p>
            <button
              onClick={() => setFeedback(null)}
              className="mt-5 w-full rounded-xl bg-[#1E3A5F] py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}