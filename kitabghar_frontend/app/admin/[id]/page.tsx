import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, User as UserIcon, BookOpen } from "lucide-react";
import { handleGetBookById } from "@/lib/actions/admin/book-action";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await handleGetBookById(id);

  if (!result.success) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-600">
          {result.message || "Failed to load book"}
        </p>
      </div>
    );
  }

  const book = result.data;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/books"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Back to Books
      </Link>

      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[200px_1fr]">
        <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {book.image ? (
            <Image src={book.image} alt={book.title} fill sizes="200px" className="object-cover" />
          ) : (
            <BookOpen size={32} className="text-slate-300" />
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                book.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {book.status}
            </span>
            <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {book.condition}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{book.title}</h1>
          <p className="mt-1 text-sm text-slate-500">by {book.author}</p>
          <p className="mt-3 text-xl font-semibold text-[#1E3A5F]">Rs. {book.price}</p>

          {book.description && (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{book.description}</p>
          )}

          <p className="mt-4 text-xs text-slate-400">
            Listed on {new Date(book.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Seller
        </h2>
        <div className="flex items-center gap-4">
          {book.seller?.avatar ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-full">
              <Image src={book.seller.avatar} alt={book.seller.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A5F] text-lg font-semibold text-white">
              {book.seller?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="flex items-center gap-1.5 font-medium text-slate-900">
              <UserIcon size={14} className="text-slate-400" />
              {book.seller?.name ?? "Unknown"}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Mail size={14} className="text-slate-400" />
              {book.seller?.email ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}