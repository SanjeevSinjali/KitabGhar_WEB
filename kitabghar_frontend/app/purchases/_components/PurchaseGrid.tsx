"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

type PurchaseItem = {
  _id: string;
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
  createdAt: string;
};

const conditionColors: Record<string, string> = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Fair": "bg-yellow-100 text-yellow-700",
};

export default function PurchaseGrid({ items }: { items: PurchaseItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <ShoppingBag size={36} className="mx-auto text-slate-300" />
        <p className="mt-4 text-sm font-medium text-slate-500">No purchases yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Browse Books and tap &quot;Buy Now&quot; on something you like.
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
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative aspect-3/4 w-full bg-slate-100">
            <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            <span className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              Purchased
            </span>
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
            <p className="mt-2 text-xs text-slate-400">
              Bought {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}