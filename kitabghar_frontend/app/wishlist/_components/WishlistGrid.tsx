"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2, Heart, ArrowLeft } from "lucide-react";
import { handleRemoveWishlist } from "@/lib/actions/wishlist-action";

type WishlistItem = {
  _id: string;
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
};

const conditionColors: Record<string, string> = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Fair": "bg-yellow-100 text-yellow-700",
};

export default function WishlistGrid({ items }: { items: WishlistItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  function onRemove(bookId: string) {
    setRemovingId(bookId);
    startTransition(async () => {
      await handleRemoveWishlist(bookId);
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <Heart size={36} className="mx-auto text-slate-300" />
        <p className="mt-4 text-sm font-medium text-slate-500">Your wishlist is empty</p>
        <p className="mt-1 text-xs text-slate-400">
          Tap the heart icon on any book in Browse Books to save it here.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#162d4a]"
        >
          <ArrowLeft size={14} /> Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="relative aspect-[3/4] w-full bg-slate-100">
            <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            <button
              onClick={() => onRemove(item.bookId)}
              disabled={isPending && removingId === item.bookId}
              title="Remove from wishlist"
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 transition hover:bg-white hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
            <p className="truncate text-xs text-slate-500">{item.author}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1E3A5F]">{item.price}</span>
              <span className={`text-xs rounded-full px-2 py-0.5 ${conditionColors[item.condition] ?? ""}`}>
                {item.condition}
              </span>
            </div>
            <button className="mt-2 w-full rounded-lg bg-[#1E3A5F] py-1.5 text-xs font-medium text-white transition hover:bg-[#162d4a]">
              Buy Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}