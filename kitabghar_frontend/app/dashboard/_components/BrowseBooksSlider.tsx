"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import BrowseBookCard, { type FeaturedBook } from "./BrowseBookCard";

export default function BrowseBooksSlider({
  books,
  wishlistedIds,
}: {
  books: FeaturedBook[];
  wishlistedIds: Set<string>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <BookOpen size={32} className="mx-auto text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">No books available yet</p>
        <p className="mt-1 text-xs text-slate-400">Check back soon — new books are added regularly.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:bg-slate-50"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x scrollbar-hide"
      >
        {books.map((book) => (
          <BrowseBookCard key={book._id} book={book} isWishlisted={wishlistedIds.has(book._id)} />
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:bg-slate-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
