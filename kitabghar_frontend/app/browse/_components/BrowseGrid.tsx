"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import BrowseBookCard, { type FeaturedBook } from "@/app/dashboard/_components/BrowseBookCard";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BrowseGrid({
  books,
  wishlistedIds,
  pagination,
}: {
  books: FeaturedBook[];
  wishlistedIds: Set<string>;
  pagination?: Pagination;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  const setPage = (next: number) => {
    const q = new URLSearchParams(params.toString());
    q.set("page", String(next));
    router.push(`/browse?${q.toString()}`);
  };

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <BookOpen size={36} className="mx-auto text-slate-300" />
        <p className="mt-4 text-sm font-medium text-slate-500">No books available yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <BrowseBookCard key={book._id} book={book} isWishlisted={wishlistedIds.has(book._id)} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}