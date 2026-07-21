"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import Modal from "../../_components/Modal";
import { handleDeleteBook } from "@/lib/actions/admin/book-action";

interface Seller {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  condition: string;
  image: string;
  status: string;
  seller: Seller;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const conditionColors: Record<string, string> = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Fair": "bg-yellow-100 text-yellow-700",
};

export default function BookTable({
  data,
  pagination,
  search,
}: {
  data: Book[];
  pagination: Pagination;
  search: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<Book | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const setQuery = (next: Record<string, string | number>) => {
    const q = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => q.set(k, String(v)));
    router.push(`/admin/books?${q.toString()}`);
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("search") as string;
    setQuery({ search: value ?? "", page: 1 });
  };

  const onDelete = () => {
    if (!target) return;
    setDeleteError("");
    startTransition(async () => {
      const result = await handleDeleteBook(target._id);
      if (result.success) {
        setTarget(null);
        router.refresh();
      } else {
        setDeleteError(result.message || "Failed to delete book");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Books</h2>
          <p className="text-sm text-slate-500">{total} total listings</p>
        </div>
        <Link
          href="/admin/books/create"
          className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a]"
        >
          <Plus size={16} />
          New Book
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={onSearch} className="flex w-full max-w-sm gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by title or author..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]"
            />
          </div>
          <button className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            Search
          </button>
        </form>

        <label className="flex items-center gap-2 text-sm text-slate-500">
          Rows
          <select
            value={limit}
            onChange={(e) => setQuery({ limit: e.target.value, page: 1 })}
            className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#1E3A5F]"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Book</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Condition</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Listed</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((book) => (
                <tr
                  key={book._id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {book.image ? (
                          <Image src={book.image} alt={book.title} fill sizes="36px" className="object-cover" />
                        ) : (
                          <BookOpen size={16} className="text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{book.title}</p>
                        <p className="truncate text-xs text-slate-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{book.seller?.name ?? "—"}</p>
                    <p className="text-xs text-slate-500">{book.seller?.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">Rs. {book.price}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionColors[book.condition] ?? "bg-slate-100 text-slate-600"}`}>
                      {book.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${book.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setTarget(book)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  No books listed yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setQuery({ page: page - 1 })}
            className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm transition hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setQuery({ page: page + 1 })}
            className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <Modal open={!!target} onClose={() => setTarget(null)} title="Delete book listing">
        <p className="mb-2 text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">{target?.title}</span>?
          This cannot be undone.
        </p>
        {deleteError && (
          <p className="mb-3 text-sm text-red-500">{deleteError}</p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => setTarget(null)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}